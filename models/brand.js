import mongoose from 'mongoose';

const brandschema = new mongoose.Schema({
  brand_name: {
    type: String,
    trim: true,
    index: true // Index for faster text-based search/filter
  },
  shop_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    index: true // Index for quick lookup and population
  },
  brand_status: {
    type: String,
    enum: ['Active', 'Draft'],
    default: 'Draft',
    index: true // Optional: if you often query/filter by status
  }
}, {
  timestamps: true
});

// Compound index example (optional)
// brandschema.index({ brand_name: 1, shop_id: 1 });

export const Brand = mongoose.models.Brand || mongoose.model('Brand', brandschema);
