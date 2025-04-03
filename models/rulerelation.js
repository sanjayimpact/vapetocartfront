import mongoose from "mongoose";

const ruleRelationSchema = new mongoose.Schema({
  column_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RuleColumn',
    index: true // Improves performance in lookups and filters
  },
  name: {
    type: String,
    required: true,
    index: true, // Improves performance in searching/filtering by name
    unique: true // Optional: ensure each relation name is distinct
  }
}, { timestamps: true });

export const RuleRelation = mongoose.models.RuleRelation || mongoose.model("RuleRelation", ruleRelationSchema);
