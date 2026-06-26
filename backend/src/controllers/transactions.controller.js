import Transaction from "../models/transaction.model.js";

export const getAllTransactionsHistory = async (req, res) => {
  try {
    const allTransactions = await Transaction.find({}).sort({ _id: -1 });

    if (!allTransactions) {
      return res.status(404).json({ message: "No transactions found" });
    }

    res.status(200).json(allTransactions);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
    console.error(error);
  }
};
