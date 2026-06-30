import dotenv from "dotenv";
import User from "../models/user.model.js";
import Transaction from "../models/transaction.model.js";
import mongoose from "mongoose";
dotenv.config();

const API_KEY = process.env.ANOSIM_API_KEY;

const fetchBalance = async () => {
  try {
    const response = await fetch(
      `https://anosim.net/api/v1/Balance?apikey=${API_KEY}`,
    );

    const data = await response.json();

    return data.accountBalanceInUSD;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const anosimCheckBalance = async (req, res) => {
  const balance = await fetchBalance();

  res.status(200).json({ balance: balance });
};

export const anosimGetProductPrices = async (req, res) => {
  const { countryId, rentalTypeId, serviceId } = req.query;

  try {
    const response = await fetch(
      `https://anosim.net/api/v1/ProductPrices?apikey=${API_KEY}&countryId=${countryId}&rentalTypeId=${rentalTypeId}&serviceId=${serviceId}`,
    );

    if (!response.ok) {
      return res.status(response.status).json({
        message: "Failed to get product prices from anosim API",
      });
    }

    const data = await response.json();

    res.status(200).json(data);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
    console.error(error);
  }
};

export const anosimActivateSms = async (req, res) => {
  const { productId, amount, provId } = req.body;
  const userId = req.user.id;

  try {
    const response = await fetch(
      `https://anosim.net/api/v1/Orders?apikey=${API_KEY}&productId=${productId}&amount=${amount}&providerId=${provId}`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      const errorText = response.text();
      return res
        .status(response.status)
        .json({ message: "Anosim API Error", error: errorText });
    }

    const orderData = await response.json();

    const now = new Date();
    const expirationTime = new Date(now.getTime() + 20 * 60 * 1000);
    let timeStamp = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Manila",
    });
    const user = await User.findOne({ _id: userId });
    const booking = orderData.orderBookings?.[0] || {};

    const saveTransaction = await Transaction.create({
      activationId: booking.id,
      userId,
      userName: user.name,
      phoneNumber: booking.number,
      provider: "Anosim",
      country: booking.country,
      service: booking.service,
      price: booking.priceInUSD,
      rentalType: booking.rentalType,
      startTime: now.toISOString(),
      endTime: expirationTime.toISOString(),
      timeStamp: timeStamp,
      duration: booking.durationInMinutes,
    });

    res.status(200).json({
      success: true,
      message: "Successfully activate sms",
      data: saveTransaction,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
    console.error(error);
  }
};

export const anosimCancelActivation = async (req, res) => {
  const { id } = req.params;

  try {
    const response = await fetch(
      `https://anosim.net/api/v1/OrderBookings/${id}?apikey=${API_KEY}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const errorText = response.text();
      res.status(response.status).json({
        message: "Failed to cancel sms activation in Anosim",
        error: errorText,
      });
    }

    const updateTransaction = await Transaction.findOneAndUpdate(
      {
        $or: [{ activationId: String(id) }, { activationId: Number(id) }],
      },
      {
        $set: {
          status: "cancelled",
        },
      },
      { returnDocument: "after" },
    );

    if (!updateTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json({
      success: true,
      message: "Successfully canceled sms activation",
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
    console.error(error);
  }
};

export const anosimChangeSmsStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const objectId = new mongoose.Types.ObjectId(userId);

    const pendingTxs = await Transaction.find({
      userId: objectId,
      provider: "Anosim",
      status: "pending",
    }).sort({ _id: -1 });

    for (let tx of pendingTxs) {
      const now = Date.now();
      const endTimeDate = new Date(tx.endTime);

      if (now > endTimeDate) {
        if (tx.smsCode) {
          tx.status = "success";
        } else {
          tx.status = "cancelled";
        }
        await tx.save();
      }
    }

    const activeList = await Transaction.find({
      userId: objectId,
      provider: "Anosim",
      status: "pending",
    })
      .lean()
      .sort({ createdAt: -1 });

    const updatedActiveList = activeList.map((tx) => {
      const now = Date.now();
      const endTimeDate = new Date(tx.endTime);
      return {
        ...tx,
        timeLeftInSeconds: Math.max(0, Math.floor((endTimeDate - now) / 1000)),
      };
    });
    res.json(updatedActiveList);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
    console.error(error);
  }
};

export const getSMSById = async (req, res) => {
  const { id } = req.params;

  try {
    const response = await fetch(
      `https://anosim.net/api/v1/Sms/${id}?apikey=${API_KEY}`,
    );

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ message: "Something went wrong" });
    }

    const data = await response.json();

    const updateTransaction = await Transaction.findOneAndUpdate(
      {
        $or: [{ activationId: String(id) }, { activationId: Number(id) }],
      },
      {
        $set: {
          receivedAt: data?.messageDate,
        },
        $addToSet: { smsCode: data?.messageText },
      },
      { returnDocument: "after" },
    );

    if (!updateTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res
      .status(200)
      .json({ message: "Successfully added sms code to transaction" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
    console.error(error);
  }
};
