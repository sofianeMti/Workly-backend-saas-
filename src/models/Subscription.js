const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    category: { type: String },
    price: { type: Number, required: true },
    recurrence: {
      type: String,
      enum: ["mensuel", "annuel", "autre"],
      required: true,
    },
    nextPayment: { type: Date, required: true },
    status: {
      type: String,
      enum: ["actif", "résilié", "à résilier"],
      default: "actif",
    },
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
