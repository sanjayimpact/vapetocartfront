import mongoose from "mongoose";

const variantdetailSchema = new mongoose.Schema({
  variant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Variant", // Capitalized model name ('Variant', not 'variant')
    index: true // For fast joins and filtering by variant
  },
  Options: {
    type: [String]
    // Optional: add index if you're filtering by option names (e.g., color, size)
  },
  option_values: {
    type: Map,
    of: String
    // Indexing individual Map keys is not supported directly, but can be flattened if needed
  },
  isdefault: {
    type: Boolean,
    enum: [true, false],
    default: false,
    index: true // Useful if you're looking up the default variant details
  }
}, { timestamps: true });

export const Variantdetail = mongoose.models.Variantdetail || mongoose.model('Variantdetail', variantdetailSchema);
