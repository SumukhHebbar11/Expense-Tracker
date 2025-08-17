import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: [true, "Transaction type is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      trim: true,
      enum: [
        "Cash",
        "UPI",
        "Bank Transfer",
        "Credit Card",
        "Debit Card",
        "Cheque",
        "Other",
      ],
      default: "Cash",
    },
    forMemberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FamilyMember",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1 });

export default mongoose.model("Transaction", transactionSchema);
