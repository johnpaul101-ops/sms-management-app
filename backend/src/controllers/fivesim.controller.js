import User from "../models/user.model.js";

const API_KEY = "awkeopk2po3";

let cachedBalance = null;
let cachedCountries = null;

const fetchBalance = async () => {
  try {
    const response = await fetch("https://5sim.net/v1/user/profile", {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return;
    }

    const data = await response.json();

    cachedBalance = data.balance;
    return cachedBalance;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const fetchCountryList = async () => {
  try {
    const response = await fetch("https://5sim.net/v1/guest/countries");

    const data = await response.json();

    cachedCountries = data;
    return cachedCountries;
  } catch (error) {
    console.error(error);
    return null;
  }
};

fetchBalance();
fetchCountryList();

export const fiveSimGetBalance = async (req, res) => {
  try {
    if (cachedBalance == null) {
      const latestBalance = await fetchBalance();
      return res.status(200).json(latestBalance);
    }

    res.status(200).json(cachedBalance);
  } catch (error) {
    req.status(500).json({ message: "Internal Server Error" });
    console.error(error);
  }
};

export const fiveSimGetCountryList = async (req, res) => {
  try {
    if (cachedCountries) {
      return res.status(200).json(cachedCountries);
    }

    const data = await fetchCountryList();

    res.status(200).json(data);
  } catch (error) {
    req.status(500).json({ message: "Internal Server Error" });
    console.error(error);
  }
};

export const fiveSimBuyActivationNum = async (req, res) => {
  const { country, operator, productName } = req.body;
  const userId = req.user.id;
  try {
    const response = await fetch(
      `https://5sim.net/v1/user/buy/activation/${country}/${operator}/${productName}`,
    );
    const data = await response.json();

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ success: false, message: data });
    }

    const user = User.findOne({ _id: userId });

    await fetchBalance();

    res.status(200).json({
      success: true,
      message: "Successfully purchased activation number",
      userName: user.name,
      data,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
    console.error(error);
  }
};

export const fiveSimCancelActivation = async (req, res) => {
  const { id } = req.params;

  try {
    const response = await fetch(`https://5sim.net/v1/user/cancel/${id}`);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ message: data });
    }

    await fetchBalance();

    res.status(200).json({
      success: true,
      message: "Successfully canceled activation",
      data,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
    console.error(error);
  }
};
