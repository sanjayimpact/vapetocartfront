import connectDB from "@/lib/db";
import { Product } from "@/models/product";
import { Stock } from "@/models/stock";
import { Variant } from "@/models/variant";
import { Variantdetail } from "@/models/variantdetail";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    await connectDB();

    // Find products using a specific brand_name
    const products = await Product.find({ brand_name: "67caa44251942b1123138538" })
      .populate({ path: "brand_name", select: "brand_name" })
      .populate({ path: "tags", select: "tag_name" })
      .populate({ path: "product_type", select: "product_type_name" })
      .limit(12);

    const transformedProducts = await Promise.all(
      products.map(async (product) => {
        // Fetch variants for the product
        const variants = await Variant.find({ product_id: product._id });

        // For each variant, fetch its details and stock
        const variantsData = await Promise.all(
          variants.map(async (variant) => {
            const variantDetails = await Variantdetail.find({ variant_id: variant._id });
            const stockEntry = await Stock.findOne({ variant_id: variant._id });
            const variantStock = stockEntry ? stockEntry.quantity : 0;
            const options = variantDetails.map((detail) => ({
              id: detail._id,
              name: detail?.Options,
              values: detail?.option_values || []
            }));
            return {
              ...variant._doc,
              options,
              stock: variantStock
            };
          })
        );

        // Combine options from all variants
        const combinedOptions = variantsData.reduce((acc, variant) => {
          return acc.concat(variant.options);
        }, []);

        // Group options by name, merging values if names are the same
        const groupedOptions = {};
        combinedOptions.forEach((option) => {
          const optionName = Array.isArray(option.name) ? option.name[0] : option.name;
          const optionValues =
            Array.isArray(option.values) &&
            option.values.length > 0 &&
            Array.isArray(option.values[0])
              ? option.values.map((val) => (Array.isArray(val) ? val[1] : val))
              : option.values;

          if (groupedOptions[optionName]) {
            groupedOptions[optionName].values = Array.from(
              new Set([...groupedOptions[optionName].values, ...optionValues])
            );
          } else {
            groupedOptions[optionName] = {
              ...option,
              name: optionName,
              values: optionValues
            };
          }
        });

        const aggregatedOptions = Object.values(groupedOptions).map((opt) => ({
          ...opt,
          values: Array.isArray(opt.values)
            ? opt.values.map((val) => (Array.isArray(val) ? val[1] : val))
            : opt.values
            ? [opt.values]
            : []
        }));

        // Create an images array from the variants (assuming each variant might have a "variant_image" property)
        const variantImages = variantsData
          .map((variant) => variant.variant_image)
          .filter(Boolean);

        return {
          cat_id:'67c982bdc9e498e02ec70647' , // Adjusted: using product._id for cat_id
          image: product.featured_image,
          pro_id: product._id,
          title: product.title,
          body_html: product.body_html,
          vendor: product.brand_name?.brand_name || null,
          product_type: product.product_type?.product_type_name || null,
          handle: product.handle,
          tags: product.tags.map((tag) => tag.tag_name).join(", ") || null,
          options: aggregatedOptions, // Aggregated options, e.g., with values: ["10mg", "20mg"]
          images: variantImages,      // Array of variant images displayed below options
          variants: variantsData
        };
      })
    );
const transformedsdata = {
heading: "Crystal Bling 6000",
        subheading: "More than 30 Flavours",
        cat_id: '67c982bdc9e498e02ec70647',
        status: "Active",
        created_at: "2025-02-10T12:24:46.000000Z",
        updated_at: "2025-02-10T12:24:46.000000Z",
        title: "The Crystal Bling 6000",
        handle: "the-crystal-bling-6000",
 catpros:transformedProducts
}
    return NextResponse.json({
      status:true,
      topsellers: transformedsdata,
     
    });
  } catch (err) {
    return NextResponse.json({ message: err.message, status: false });
  }
};
