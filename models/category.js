import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  collection_id: {
    type: Number,
    index: true // Add index if you're querying by collection_id
  },
  title: {
    type: String
    // Add index if you're searching/filtering by title
  },
  handle: {
    type: String,
    index: true, // Recommended if you query by handle (e.g., findOne({ handle }))
    unique: true // Optional: make sure each handle is unique
  },
  cat_image: {
    type: String
  },
  meta_title: {
    type: String
  },
  meta_desc: {
    type: String
  },
  body_html: {
    type: String
  },
  rules: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RuleCondition',
    index: true // Indexing for better lookup performance
  }]
}, { timestamps: true });

export const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);
