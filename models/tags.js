import mongoose from "mongoose";

const tagSchema = new mongoose.Schema({
  tag_name: {
    type: String,
    trim: true,
    required: true,
    index: true // Fast lookup and filtering
    // unique: true // Optional: only if tag names must be globally unique
  },
  shop_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    index: true // Helps filter tags per shop quickly
  },
  tag_status: {
    type: String,
    enum: ['Active', 'Draft'],
    default: 'Draft',
    index: true // For quick filtering in admin/UIs
  }
}, { timestamps: true });



export const Tag = mongoose.models.Tag || mongoose.model('Tag', tagSchema);
