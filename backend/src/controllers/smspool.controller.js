const TEST_API_KEY = "asdasdasd";

let cachedBalance = null;
let cachedServices = null;
let cachedCountries = null;
const fetchBalance = async () => {
  try {
    let formdata = new FormData();
    formdata.append("key", TEST_API_KEY);

    const response = await fetch("https://api.smspool.net/request/balance", {
      method: "POST",
      body: formdata,
      redirect: "follow",
    });

    const data = response.json();

    cachedBalance = data.balance;
    return cachedBalance;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const fetchServices = async () => {
  try {
    const response = await fetch(
      "https://api.smspool.net/service/retrieve_all",
    );

    const data = await response.json();

    cachedServices = data;
    return cachedServices;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const fetchCountries = async () => {
  try {
    const response = await fetch(
      "https://api.smspool.net/country/retrieve_all",
    );

    const data = await response.json();

    cachedCountries = data;
    return cachedCountries;
  } catch (error) {
    console.error(error);
    return null;
  }
};

fetchBalance();
fetchServices();
fetchCountries();

export const smsPoolGetBalance = async (req, res) => {
  if (cachedBalance == null) {
    const latestBalance = await fetchBalance();
    return res.status(200).json(latestBalance);
  }

  res.status(200).json(cachedBalance);
};

export const smsPoolGetServices = async (req, res) => {
  try {
    if (cachedServices) {
      return res.status(200).json(cachedServices);
    }

    const data = await fetchServices();

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
    console.error(error);
  }
};

export const smsPoolGetCountryList = async (req, res) => {
  try {
    if (cachedCountries) {
      return res.status(200).json(cachedCountries);
    }

    const data = await fetchCountries();

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
    console.error(error);
  }
};
