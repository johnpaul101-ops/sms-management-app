import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  activationId: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
    index: true,
  },
  userName: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  provider: {
    type: String,
  },
  country: {
    type: String,
  },
  service: {
    type: String,
  },
  price: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  rentalType: {
    type: String,
  },
  startTime: {
    type: String,
  },
  endTime: {
    type: String,
  },
  duration: {
    type: mongoose.Schema.Types.Mixed,
  },
  status: {
    type: String,
    enum: ["pending", "success", "cancelled"],
    default: "pending",
  },
  smsCode: [String],
  receivedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 259200,
  },
});

const Transaction = mongoose.model("Transactions", transactionSchema);

export default Transaction;
