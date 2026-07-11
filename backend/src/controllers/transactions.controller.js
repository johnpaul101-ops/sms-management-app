import Transaction from "../models/transaction.model.js";

export const getAllTransactionsHistory = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 15;
    const category = req.query.category;
    const skip = (page - 1) * limit;
    const filter = {};

    if (category) {
      filter.status = category;
    }

    const paginatedTransaction = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (!paginatedTransaction) {
      return res.status(404).json({ message: "No transactions found" });
    }
    const totalTransactions = await Transaction.countDocuments(filter);
    const totalPages = Math.ceil(totalTransactions / limit);

    res.status(200).json({
      page,
      totalPages,
      data: paginatedTransaction,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
    console.error(error);
  }
};
