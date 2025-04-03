import { Product } from "@/models/product";
import { Category } from "@/models/category";
import { ProductType } from "@/models/product_type";
import { RuleCondition } from "@/models/rulecondition";
import { RuleColumn } from "@/models/rulecolumn";
import { RuleRelation } from "@/models/rulerelation";
import { Brand } from "@/models/brand";
import { Tag } from "@/models/tags";
import { Variant } from "@/models/variant";
import { Variantdetail } from "@/models/variantdetail";
import { Stock } from "@/models/stock";
import connectDB from "@/lib/db";
import { NextResponse } from "next/server";

// Helper: Get variant details and stock concurrently.
const getVariantData = async (variant) => {
  const [details, stock] = await Promise.all([
    Variantdetail.find({ variant_id: variant._id }),
    Stock.findOne({ variant_id: variant._id }),
  ]);
  const options = details.map((detail) => ({
    id: detail._id,
    name: detail?.Options,
    values: detail?.option_values || [],
  }));
  return {
    ...variant._doc,
    options,
    stock: stock ? stock.quantity : 0,
    stockId: stock?._id,
    location_id: stock?.location_id,
  };
};

// Helper: Aggregate options from variant data.
const aggregateOptions = (variants) => {
  const groupedOptions = {};

  variants.forEach((variant) => {
    variant.options.forEach((option) => {
      if (Array.isArray(option.name) && option.name.length > 0) {
        option.name.forEach((optionKey) => {
          const optionValue = option.values.get(optionKey);

          if (!groupedOptions[optionKey]) {
            groupedOptions[optionKey] = new Set();
          }

          if (optionValue) {
            groupedOptions[optionKey].add(optionValue);
          }
        });
      }
    });
  });

  return Object.entries(groupedOptions).map(([name, values]) => ({
    id: generateUniqueId(name), // Generate unique IDs dynamically
    name,
    values: Array.from(values),
  }));
};

// Dummy function to generate unique IDs based on option names
const generateUniqueId = (name) => {
  return require('crypto').createHash('md5').update(name).digest('hex');
};


// Helper: Transform product data by combining variants and aggregated options.
const transformProduct = (product, variants, catId = null) => {
  const aggregatedOptions = aggregateOptions(variants);
  const variantImages = variants
    .map((variant) => variant.variant_image)
    .filter(Boolean);
  return {
    cat_id: catId,
    image: product.featured_image,
    pro_id: product._id,
    title: product.title,
    body_html: product.body_html,
    meta_title: product?.meta_title,
    meta_description: product?.meta_description,
    vendor: product.brand_name?.brand_name || null,
    product_type: product.product_type?.product_type_name || null,
    handle: product.handle,
    tags: product.tags.map((tag) => tag.tag_name).join(", ") || null,
    options: aggregatedOptions,
    variants,
  };
};

// Helper: Fetch main product's data (variants and aggregated options).
const getProductData = async (product) => {
  const variants = await Variant.find({ product_id: product._id });
  const variantData = await Promise.all(variants.map(getVariantData));
  return {
    pro_id: product._id,
    meta_title: product?.meta_title,
    meta_description: product?.meta_description,
    image: product?.featured_image,
    title: product.title,
    body_html: product.body_html,
    vendor: product.brand_name?.brand_name || null,
    product_type: product.product_type?.product_type_name || null,
    handle: product.handle,
    tags: product.tags.map((tag) => tag.tag_name).join(", ") || null,
    options: aggregateOptions(variantData),
    variants: variantData,
  };
};

// Helper: Fetch related products along with their variant data.
const getRelatedProducts = async (product, limit = 12) => {
  if (!product.product_type) return [];
  const relatedProducts = await Product.find({
    product_type: product.product_type._id,
    _id: { $ne: product._id },
  })
    .limit(limit)
    .populate({ path: "brand_name" })
    .populate({ path: "tags" })
    .populate({ path: "product_type" });

  const relatedProductIds = relatedProducts.map((p) => p._id);
  const relatedVariants = await Variant.find({
    product_id: { $in: relatedProductIds },
  });
  const relatedVariantData = await Promise.all(
    relatedVariants.map(getVariantData)
  );
  return relatedProducts.map((prod) => {
    const productVariants = relatedVariantData.filter(
      (variant) => String(variant.product_id) === String(prod._id)
    );
    return transformProduct(prod, productVariants);
  });
};

export const getallCategory = async (slug) => {

  try {
    await connectDB();
    const handle = slug;
    // const { searchParams } = new URL(req.url);
    const page =   1;
    const limit = 12;
    const skip = (page - 1) * limit;
    let type = "Category";

    // Find category by handle and populate rules.
    let existhandle = await Category.findOne({ handle }).populate({
      path: "rules",
      populate: [{ path: "column" }, { path: "relation" }],
    });

    // If category is not found, search in products instead.
    if (!existhandle) {
      type = "Product";
      // Since we're looking for a single product by handle, we use findOne.
      const productExists = await Product.findOne({ handle })
        .populate({ path: "brand_name" })
        .populate({ path: "tags" })
        .populate({ path: "product_type" });
      if (!productExists) {
        return 
        ({
          message: "No data found",
          status: false,
          type: null,
        });
      }
      // Fetch main product data and related products concurrently.
      const [productData, relatedProducts] = await Promise.all([
        getProductData(productExists),
        getRelatedProducts(productExists),
      ]);
      const responseProduct = {
        success: true,
        slug: handle,
        type,
        sproduct: {
          single_product: productData,
          related_product: relatedProducts,
        },
      };
      return(JSON.parse(JSON.stringify(responseProduct)));
    }

    // Process filtering conditions based on category rules.
    let filters = {};
    for (const rule of existhandle.rules) {
      let fieldName = rule.column?.name;
      if (fieldName === "type") fieldName = "product_type";
      else if (fieldName === "tag") fieldName = "tags";
      else if (fieldName === "vendor") fieldName = "brand_name";
      const relation = rule.relation?.name;
      const value = rule.value;
      if (!fieldName || !relation || value === undefined) continue;
      switch (relation) {
        case "equals":
          filters[fieldName] = value;
          break;
        case "is not equal to":
          filters[fieldName] = { $ne: value };
          break;
        case "starts with":
          filters[fieldName] = { $regex: `^${value}`, $options: "i" };
          break;
        case "ends with":
          filters[fieldName] = { $regex: `${value}$`, $options: "i" };
          break;
        case "contains":
          filters[fieldName] = { $regex: value, $options: "i" };
          break;
        case "does not contain":
          filters[fieldName] = { $not: { $regex: value, $options: "i" } };
          break;
        case "is greater than":
          filters[fieldName] = { $gt: value };
          break;
        case "is less than":
          filters[fieldName] = { $lt: value };
          break;
        default:
          console.warn(`Unknown relation: ${relation}`);
          break;
      }
    }

    // Convert filter values to IDs concurrently.
    const lookupPromises = [];
    if (filters.product_type) {
      lookupPromises.push(
        ProductType.findOne({ product_type_name: filters.product_type }).then(
          (pt) => {
            if (pt) filters.product_type = pt._id;
          }
        )
      );
    }
    if (filters.tags) {
      lookupPromises.push(
        Tag.findOne({ tag_name: filters.tags }).then((tag) => {
          if (tag) filters.tags = tag._id;
        })
      );
    }
    if (filters.brand_name) {
      lookupPromises.push(
        Brand.findOne({ brand_name: filters.brand_name }).then((brand) => {
          if (brand) filters.brand_name = brand._id;
        })
      );
    }
    await Promise.all(lookupPromises);

    // Find products matching the filters with pagination.
    const products = await Product.aggregate([
      { $match: filters }, // Apply filters dynamically
      {
        $lookup: {
          from: "brands", // Collection name for Brand
          localField: "brand_name",
          foreignField: "_id",
          as: "brand_name"
        }
      },
      { $unwind: { path: "$brand_name", preserveNullAndEmptyArrays: true } },
    
      {
        $lookup: {
          from: "tags", // Collection name for Tag
          localField: "tags",
          foreignField: "_id",
          as: "tags"
        }
      },
    
      {
        $lookup: {
          from: "producttypes", // Collection name for ProductType
          localField: "product_type",
          foreignField: "_id",
          as: "product_type"
        }
      },
      { $unwind: { path: "$product_type", preserveNullAndEmptyArrays: true } },
    
      { $sort: { title: 1 } }, // Sort by title ascending
      { $skip: skip },         // Pagination skip
      { $limit: limit }        // Pagination limit
    ]);
    
    const totalproduct = await Product.countDocuments(filters);
    if (!products || products.length === 0) {
      return({
        message: "No products found",
        status: false,
        type,
        totalCount: 0,
      });
    }

    // Fetch variants for all found products.
    const productIds = products.map((product) => product._id);
    const variants = await Variant.find({ product_id: { $in: productIds } });
    const variantData = await Promise.all(variants.map(getVariantData));

    const transformedProducts = products.map((product) => {
      const productVariants = variantData.filter(
        (variant) => String(variant.product_id) === String(product._id)
      );
      return transformProduct(product, productVariants, existhandle._id);
    });

    const transformedData = {
      cat_id: existhandle._id,
      cat_title: existhandle.title,
      cat_products: transformedProducts,
      totalCount: transformedProducts.length,
      currentPage: page,
      totalPages: Math.ceil(totalproduct / limit),
      totalproduct,
    };

    const responseFilter = {
      message: "Successfully fetched",
      
      
      data:{status: true,type,catpros: transformedData},
    };

    return (JSON.parse(JSON.stringify(responseFilter)));
  } catch (err) {
    console.error("Error fetching product:", err);
    return ({ message: err.message, status: false });
  }
};
