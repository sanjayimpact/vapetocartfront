import mongoose from "mongoose";

const productTypeSchema = new mongoose.Schema({
  product_type_name: {
    type: String,
    required: true,
    trim: true,
    index: true // For fast searching/filtering
  },
  shop_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    index: true // For fast lookup by shop
  },
  product_type_status: {
    type: String,
    enum: ["Active", "Draft"],
    default: "Draft",
    index: true // If you often filter by status
  }
}, { timestamps: true });

// Optional: If product_type_name should be unique per shop
// productTypeSchema.index({ shop_id: 1, product_type_name: 1 }, { unique: true });

export const ProductType = mongoose.models.ProductType || mongoose.model("ProductType", productTypeSchema);
