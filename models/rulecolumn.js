import mongoose from "mongoose";

const ruleColumnSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true, // Add index for faster search/filtering
    unique: true // Optional: prevent duplicate column names
  }
}, { timestamps: true });

export const RuleColumn = mongoose.models.RuleColumn || mongoose.model("RuleColumn", ruleColumnSchema);
