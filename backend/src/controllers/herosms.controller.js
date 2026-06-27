import Transaction from "../models/transaction.model.js";
import User from "../models/user.model.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

const API_KEY = process.env.HEROSMS_API_KEY;

const fetchBalance = async () => {
  try {
    const response = await fetch(
      `https://hero-sms.com/stubs/handler_api.php?action=getBalance&api_key=${API_KEY}`,
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

export const heroSmsGetBalance = async (req, res) => {
  try {
    const balance = await fetchBalance();

    res.status(200).json({ balance: balance });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
    console.error(error);
  }
};

export const heroSmsOffers = async (req, res) => {
  const { serviceCode, countryId } = req.body;

  try {
    const response = await fetch(
      `https://hero-sms.com/api/v1/activations/offers?services=${serviceCode}&countries=${countryId}`,
      {
        headers: {
          Authorization: `ApiKey ${API_KEY}`,
        },
      },
    );
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ message: data.title });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error(error);
  }
};

export const getCurrentPricesForRent = async (req, res) => {
  const { countryId, serviceCode } = req.body;

  try {
    const response = await fetch(
      `https://hero-sms.com/stubs/handler_api.php?action=serviceCountRent&service=${serviceCode}&country=${countryId}&api_key=${API_KEY}`,
    );
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ message: data.title });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
    console.error(error);
  }
};

export const heroSmsActivateSMS = async (req, res) => {
  const {
    serviceCode,
    countryId,
    maxPrice,
    serviceName,
    countryName,
    duration,
  } = req.body;
  const userId = req.user.id;

  try {
    if (duration) {
      const response = await fetch(
        `https://hero-sms.com/stubs/handler_api.php?action=getRentNumber&service=${serviceCode}&country=${countryId}&duration=${duration}&api_key=${API_KEY}`,
      );

      const data = await response.json();

      if (!response.ok) {
        return res.json({
          success: false,
          message: data.details,
        });
      }

      const now = new Date();
      const expirationTime = new Date(
        now.getTime() + duration * 60 * 60 * 1000,
      );
      const user = await User.findOne({ _id: userId });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
      const saveTransaction = await Transaction.create({
        activationId: data.activationId,
        userId,
        userName: user.name,
        phoneNumber: data.phoneNumber,
        provider: "HeroSMS",
        country: countryName,
        service: serviceName,
        price: data.activationCost,
        startTime: now.toISOString(),
        endTime: expirationTime.toISOString(),
        status: "pending",
      });

      return res.status(200).json({
        success: true,
        message: "Successfully Activate SMS",
        userName: user.name,
        saveTransaction,
      });
    } else {
      const response = await fetch(
        `https://hero-sms.com/stubs/handler_api.php?action=getNumberV2&service=${serviceCode}&country=${countryId}&operator=any&maxPrice=${maxPrice}&fixedPrice=true&api_key=${API_KEY}`,
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
        console.log(parsedData);
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
          message: parsedData.details || "API Error occurred",
        });
      }

      const now = new Date();
      const expirationTime = new Date(now.getTime() + 20 * 60 * 1000);
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
        provider: "HeroSMS",
        country: countryName,
        service: serviceName,
        price: parsedData.activationCost,
        startTime: now.toISOString(),
        endTime: expirationTime.toISOString(),
        status: "pending",
      });

      console.log(maxPrice);
      console.log(saveTransaction);
      res.status(200).json({
        success: true,
        message: "Successfully Activate SMS",
        userName: user.name,
        saveTransaction,
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
    console.error(error);
  }
};

export const heroSmsChangeStatus = async (req, res) => {
  const { id, status } = req.query;

  try {
    const response = await fetch(
      `https://hero-sms.com/stubs/handler_api.php?action=setStatus&id=${id}&status=${status}&api_key=${API_KEY}`,
    );

    if (!response.ok) {
      const errorMessage = await response.json();
      return res
        .status(response.status)
        .json({ message: errorMessage.details });
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

export const heroSmsWebhook = async (req, res) => {
  const { activationId, code, receivedAt } = req.body;

  if (!activationId) {
    res.status(400).send("Invalid Payload");
  }

  res.status(200).send("OK");

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
      { returnDocument: "after" },
    );
  } catch (error) {
    console.error(error);
  }
};

export const heroSmsChangeSmsStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const objectId = new mongoose.Types.ObjectId(userId);

    const pendingTxs = await Transaction.find({
      userId: objectId,
      provider: "HeroSMS",
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
      provider: "HeroSMS",
      status: "pending",
    }).lean();

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
