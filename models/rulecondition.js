import mongoose from "mongoose";

const ruleConditionSchema = new mongoose.Schema({
  column: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RuleColumn",
    index: true // Speeds up lookups and filters by column
  },
  relation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RuleRelation",
    index: true // Speeds up joins/filters by relation
  },
  value: {
    type: String
    // Add index only if frequently searched by value
  },
  logicalOperator: {
    type: String,
    enum: ["AND", "OR"],
    index: true // Useful if conditions are grouped/logically filtered
  }
}, { timestamps: true });

export const RuleCondition = mongoose.models.RuleCondition || mongoose.model("RuleCondition", ruleConditionSchema);
