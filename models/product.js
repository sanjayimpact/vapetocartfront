import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: true,
    index: true // Optional: if you search by title
  },
  handle: {
    type: String,
    trim: true,
    index: true, // Often used for unique product slugs
    unique: true // Optional: if each product should have a unique handle
  },
  publish_status: {
    type: String,
    trim: true,
    enum: ['Online Store', 'Other'],
    index: true // Optional: if you filter by this
  },
  meta_title: {
    type: String,
    trim: true,
  },
  meta_description: {
    type: String,
  },
  body_html: {
    type: String,
    trim: true
  },
  featured_image: {
    type: String,
  },
  shop_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    index: true // Index to filter by shop
  },
  product_status: {
    type: String,
    enum: ['Active', 'Draft'],
    default: 'Draft',
    index: true // Helpful for admin panel filters
  },
  brand_name: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    index: true // For fast joins
  },
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag',
    default: [],
    index: true // Helps if filtering by tag
  }],
  product_type: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductType',
    index: true // For product type filtering
  },
  product_id: {
    type: Number,
    index: true // Useful if used as a unique/store sync ID
  }
}, { timestamps: true });

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
