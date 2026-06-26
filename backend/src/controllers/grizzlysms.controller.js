import dotenv from "dotenv";
import User from "../models/user.model.js";
dotenv.config();

const API_KEY = process.env.GRIZZLYSMS_API_KEY;

let cachedBalance = null;

const fetchBalance = async () => {
  try {
    const response = await fetch(
      `https://api.grizzlysms.com/stubs/handler_api.php?api_key=${API_KEY}&action=getBalance`,
    );
    const data = await response.text();

    cachedBalance = data;
    return cachedBalance;
  } catch (error) {
    console.error(error);
    return null;
  }
};

fetchBalance();

export const grizzlySmsGetBalance = async (req, res) => {
  try {
    if (cachedBalance == null) {
      const latestBalance = await fetchBalance();
      return res.status(200).json(latestBalance);
    }

    res.status(200).json(cachedBalance);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
    console.error(error);
  }
};

export const grizzlySmsActivateSms = async (req, res) => {
  const { service, country } = req.body;
  const userId = req.user.id;

  try {
    const response = await fetch(
      `https://api.grizzlysms.com/stubs/handler_api.php?api_key=${API_KEY}&action=getNumberV2&service=${service}&country=${country}`,
    );
    const rawText = await response.text();

    if (rawText.includes("NO_NUMBERS")) {
      return res.status(404).json({
        success: false,
        message: "No Available Numbers",
      });
    }
    if (rawText.includes("NO_BALANCE")) {
      return res.status(400).json({
        success: false,
        message: "No Balance",
      });
    }
    if (rawText.includes("BAD_KEY") || rawText.includes("ERROR_KEY")) {
      return res.status(401).json({
        success: false,
        message: "Incorrect or Invalid Third-Party API Key.",
      });
    }

    let parsedData;
    try {
      parsedData = JSON.parse(rawText);
    } catch (parseError) {
      return res.status(422).json({
        success: false,
        message: "Unexpected API response format",
        raw: rawText,
      });
    }

    const user = await User.findOne({ _id: userId });

    res.status(200).json({
      success: true,
      message: "Sucessfully activate sms",
      userName: user.name,
      parsedData,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
    console.error(error);
  }
};

export const grizzlySmsStatusChanges = async (req, res) => {
  const { id, status } = req.body;

  try {
    const response = await fetch(
      `https://api.grizzlysms.com/stubs/handler_api.php?api_key=${API_KEY}&action=setStatus&status=${status}&id=${id}`,
    );
    const rawText = await response.text();

    if (rawText.includes("ERROR_SQL")) {
      return res
        .status(response.status)
        .json({ success: false, message: "SQL server error" });
    }
    if (rawText.includes("NO_ACTIVATION")) {
      return res
        .status(response.status)
        .json({ success: false, message: "The activation id does not exist" });
    }
    if (rawText.includes("BAD_SERVICE")) {
      return res
        .status(response.status)
        .json({ success: false, message: "Incorrect service name" });
    }
    if (rawText.includes("BAD_STATUS")) {
      return res
        .status(response.status)
        .json({ success: false, message: "Incorrect status" });
    }
    if (rawText.includes("BAD_KEY")) {
      return res
        .status(response.status)
        .json({ success: false, message: "Invalid API key" });
    }
    if (rawText.includes("BAD_ACTION")) {
      return res
        .status(response.status)
        .json({ success: false, message: "Incorrect action" });
    }
    if (rawText.includes("SERVICE_UNAVAILABLE_REGION")) {
      return res
        .status(response.status)
        .json({
          success: false,
          message:
            "Access from your region is restricted, please use another IP",
        });
    }

    await fetchBalance();

    res.status(200).json({
      success: true,
      message: rawText,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
    console.error(error);
  }
};
