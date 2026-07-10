import Transaction from "../models/transaction.model.js";
import User from "../models/user.model.js";
import { getExpirationTime, getTimeStamp } from "../utils/dateUtils.js";
import mongoose from "mongoose";
const API_KEY = process.env.SMSBOWER_API_KEY;

const fetchBalance = async () => {
  try {
    const response = await fetch(
      `https://smsbower.page/stubs/handler_api.php?api_key=${API_KEY}&action=getBalance`,
    );
    const data = await response.text();

    if (data.includes("ACCESS_BALANCE:")) {
      const balanceString = data.split(":")[1];

      const balance = parseFloat(balanceString);

      return balance;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const smsBowerGetBalance = async (req, res) => {
  try {
    const balance = await fetchBalance();

    res.status(200).json({ balance: balance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const smsBowerGetPrices = async (req, res) => {
  const { serviceCode, countryId } = req.body;

  try {
    const response = await fetch(
      `https://smsbower.page/stubs/handler_api.php?api_key=${API_KEY}&action=getP
ricesV2&service=${serviceCode}&country=${countryId}`,
    );

    if (!response.ok) {
      const errorMessage = await response.text();
      return res.status(response.status).json({ message: errorMessage });
    }
    const data = await response.json();

    res.status(200).json(data);
  } catch (error) {
    console.error(error);
  }
};

export const smsBowerActivateSms = async (req, res) => {
  const { serviceCode, countryId, serviceName, countryName, price } = req.body;
  const userId = req.user.id;
  let numPrice = parseFloat(price);
  try {
    const response = await fetch(
      `https://smsbower.page/stubs/handler_api.php?api_key=${API_KEY}&action=getNumberV2&service=${serviceCode}&country=${countryId}&maxPrice=${numPrice}&minPrice=${numPrice}`,
    );

    const data = await response.text();

    if (data.includes("NO_NUMBERS")) {
      return res.json({
        success: false,
        message: "No numbers are currently available",
      });
    }

    let parsedData;

    try {
      parsedData = JSON.parse(data);
    } catch (parseError) {
      console.error("Failed to parse JSON response:", data);
      return res.status(500).json({
        success: false,
        message: "Unexpected response format from SMS provider",
        raw_response: data,
      });
    }

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: parsedData.message || "API Error occurred",
      });
    }

    const now = new Date();
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const saveTransaction = await Transaction.create({
      activationId: parsedData.activationId,
      userId,
      userName: user.name,
      phoneNumber: parsedData.phoneNumber,
      provider: "SMSBower",
      country: countryName,
      service: serviceName,
      price: parsedData.activationCost,
      startTime: now.toISOString(),
      endTime: getExpirationTime(now, 25),
      timeStamp: getTimeStamp(now),
      status: "pending",
    });

    res.status(200).json({
      success: true,
      message: "Successfully Activate SMS",
      userName: user.name,
      saveTransaction,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const smsBowerSmsChangeStatus = async (req, res) => {
  const { id, status } = req.query;

  try {
    const response = await fetch(
      `https://smsbower.page/stubs/handler_api.php?api_key=${API_KEY}&action=setSt
atus&status=${status}&id=${id}`,
    );

    if (!response.ok) {
      const errorMessage = await response.text();
      return res.status(response.status).json({ message: errorMessage });
    }

    if (status == 6) {
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
    if (status == 8) {
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
    res.status(500).json({ message: "Internal Server Error" });
    console.error(error);
  }
};

export const smsBowerWebhook = async (req, res) => {
  const { activationId, code, receivedAt } = req.body;

  if (!activationId) {
    return res.status(400).send("Invalid Payload");
  }

  try {
    await Transaction.findOneAndUpdate(
      {
        $or: [
          { activationId: String(activationId) },
          { activationId: Number(activationId) },
        ],
      },
      {
        $set: {
          receivedAt: receivedAt ? new Date(receivedAt) : new Date(),
        },
        $addToSet: { smsCode: code },
      },
    );

    return res.status(200).send("OK");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error");
  }
};

export const smsBowerChangeActivationStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const objectId = new mongoose.Types.ObjectId(userId);

    const pendingTxs = await Transaction.find({
      userId: objectId,
      provider: "SMSBower",
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
      provider: "SMSBower",
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
