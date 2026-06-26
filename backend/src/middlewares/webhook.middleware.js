const WHITELISTED_IPS = ["84.32.223.53", "185.138.88.87"];

export const verifyProviderIP = (req, res, next) => {
  const incomingIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  const cleanIP = incomingIP
    ? incomingIP.split(",")[0].replace("::ffff:", "").trim()
    : "";

  console.log(`Incoming webhook request from IP: ${cleanIP}`);

  if (!WHITELISTED_IPS.includes(cleanIP)) {
    console.warn(
      `Security Alert: Blocked unauthorized request from IP: ${cleanIP}`,
    );
    return res.status(403).send("Forbidden: IP not whitelisted");
  }

  next();
};
