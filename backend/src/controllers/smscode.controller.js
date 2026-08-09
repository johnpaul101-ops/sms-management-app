const API_KEY = process.env.SMSCODE_API_KEY;
import crypto from "crypto";
import User from "../models/user.model.js";
import Transaction from "../models/transaction.model.js";
import { getExpirationTime, getTimeStamp } from "../utils/dateUtils.js";
import mongoose from "mongoose";

export const smsCodeGetBalance = async (req, res) => {
  try {
    const response = await fetch("https://api.smscode.gg/v2/balance", {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });

    if (!response.ok) {
      const errorMessage = await response.json();
      return res.status(response.status).json({
        message: `${errorMessage.error.code}: ${errorMessage.error.message}`,
      });
    }

    const data = await response.json();

    res.status(200).json({ balance: data.data.balance.amount });
  } catch (error) {
    console.error("Failed Fetching Balance from SMSCode: ", error.message);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

export const getPriceList = async (req, res) => {
  const { countryId, serviceId } = req.body;

  try {
    const params = new URLSearchParams({
      country_id: countryId,
      platform_id: serviceId,
    });
    const response = await fetch(
      `https://api.smscode.gg/v2/catalog/products?${params}`,
      {
        headers: { Authorization: `Bearer ${API_KEY}` },
      },
    );

    if (!response.ok) {
      const errorMessage = await response.json();
      return res.status(response.status).json({
        message: `${errorMessage.error.code}: ${errorMessage.error.message}`,
      });
    }

    const data = await response.json();

    res.status(200).json({ data: data.data });
  } catch (error) {
    console.error("Failed Fetching Price List From SMSCode: ", error.message);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

export const smsCodeActivateSms = async (req, res) => {
  const { countryName, serviceName, productId, quantity } = req.body;
  const userId = req.user.id;
  try {
    const response = await fetch("https://api.smscode.gg/v2/orders/create", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify({
        product_id: productId,
        quantity: quantity,
      }),
    });

    if (!response.ok) {
      const errorMessage = await response.json();
      return res.status(response.status).json({
        message: `${errorMessage.error?.code}: ${errorMessage.error?.message}`,
      });
    }

    const data = await response.json();

    const now = new Date();
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const orders = data.data.orders || [];

    const saveTransaction = orders.map(async (smsNum) => {
      return await Transaction.create({
        activationId: smsNum.id,
        userId,
        userName: user.name,
        phoneNumber: smsNum.phone_number,
        provider: "SMSCode",
        country: countryName,
        service: serviceName,
        price: smsNum.amount.amount,
        startTime: now.toISOString(),
        endTime: getExpirationTime(now, 20),
        timeStamp: getTimeStamp(now),
        status: "pending",
      });
    });

    res.status(200).json({
      success: true,
      message: "Successfully Activate SMS",
      userName: user.name,
      saveTransaction,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

export const smsCodeChangeStatus = async (req, res) => {
  const { id, status } = req.body;

  try {
    const response = await fetch(`https://api.smscode.gg/v2/orders/${status}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: id }),
    });

    if (!response.ok) {
      const errorMessage = await response.json();
      return res.status(response.status).json({
        message: `${errorMessage.error?.code}: ${errorMessage.error?.message}`,
      });
    }

    if (status == "finish") {
      const updateTransaction = await Transaction.findOneAndUpdate(
        {
          $or: [{ activationId: String(id) }, { activationId: Number(id) }],
        },
        {
          $set: {
            status: "success",
          },
        },
        { returnDocument: "after" },
      );

      if (!updateTransaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      return res.status(200).json({ message: "Activation Complete" });
    }
    if (status == "cancel") {
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
      return res
        .status(200)
        .json({ message: "Successfully canceled sms activation" });
    }

    res.status(200).json({
      success: true,
      message: "Resending SMS",
    });
  } catch (error) {
    console.error(
      "Failed to Change Activation Status in SMSCode: ",
      error.message,
    );
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

export const smsCodeChangeActivationStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const objectId = new mongoose.Types.ObjectId(userId);

    const pendingTxs = await Transaction.find({
      userId: objectId,
      provider: "SMSCode",
      status: "pending",
    }).sort({ _id: -1 });

    for (let tx of pendingTxs) {
      const now = Date.now();
      const endTimeDate = new Date(tx.endTime);

      if (now > endTimeDate) {
        if (tx.smsCode && tx.smsCode.length > 0) {
          tx.status = "success";
        } else {
          tx.status = "cancelled";
        }
        await tx.save();
      }
    }

    const activeList = await Transaction.find({
      userId: objectId,
      provider: "SMSCode",
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

export const smsCodeWebhook = async (req, res) => {
  const data = req.body;

  if (!data.data.order_id) {
    return res.status(400).send("Invalid Payload");
  }

  if (data.event !== "order.otp_received") {
    return res.status(200).send("Event Ignored");
  }

  res.status(200).send("OK");
  try {
    const updateData = {
      $set: {
        receivedAt: data.timestamp ? new Date(data.timestamp) : new Date(),
      },
    };

    if (data.data && data.data.otp_code) {
      updateData.$addToSet = { smsCode: data.data.otp_code };
    }

    await Transaction.findOneAndUpdate(
      {
        $or: [
          { activationId: String(data.data.order_id) },
          { activationId: Number(data.data.order_id) },
        ],
      },
      updateData,
    );
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error");
  }
};

export const smsCodeGetCode = async (req, res) => {
  const { id } = req.params;

  try {
    const response = await fetch(`https://api.smscode.gg/v2/orders/${id}`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });

    if (!response.ok) {
      const errorMessage = await response.json();
      return res.status(response.status).json({
        message: `${errorMessage.error.code}: ${errorMessage.error.message}`,
      });
    }

    const data = await response.json();

    if (!data.data?.otp_code) {
      return res.status(200).json({
        message: "No SMS code received. Please wait or try resending.",
        success: false,
      });
    }

    await Transaction.findOneAndUpdate(
      {
        $or: [{ activationId: String(id) }, { activationId: Number(id) }],
      },
      {
        $set: {
          receivedAt: data.data?.otp_received_at
            ? new Date(data.data?.otp_received_at)
            : new Date(),
        },
        $addToSet: { smsCode: data.data?.otp_code },
      },
    );

    res.status(200).json({
      message:
        "SMS request processed. Please make sure to enter the latest code received.",
      success: true,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", success: false });
    console.error(error);
  }
};
