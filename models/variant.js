import mongoose from 'mongoose';

const varianSchema = new mongoose.Schema({
  price: {
    type: String
  },
  compareprice: {
    type: String
  },
  sku: {
    type: String,
    unique: true,
    index: true // Ensures fast lookups by SKU
  },
  costprice: {
    type: String
  },
  barcode: {
    type: String
    // You can add index: true if you use barcode lookup
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    index: true // Optimizes join/filter by product
  },
  variant_image: {
    type: String,
    trim: true
  },
  shop_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    index: true // Important for multi-store filtering
  },
  isVariandetails: {
    type: Number,
    default: 0
  },
  istax: {
    type: Boolean,
    default: false
  },
  isdefault: {
    type: Boolean,
    enum: [true, false],
    default: false,
    index: true // Helps find default variants quickly
  },
  weight: {
    type: String,
    trim: true
  },
  p_id: {
    type: Number,
    default: 0,
    index: true // If you're using this for syncing or mapping
  }
}, { timestamps: true });

export const Variant = mongoose.models.Variant || mongoose.model('Variant', varianSchema);
