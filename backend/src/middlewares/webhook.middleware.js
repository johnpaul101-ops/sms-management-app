const WHITELISTED_IPS = [
  "84.32.223.53",
  "185.138.88.87",
  "167.235.198.205",
  "2a01:4f8:1c17:6c99::1",
  "2a09:bac5:34b5:14dc::214:ae",
];

export const verifyProviderIP = (req, res, next) => {
  const incomingIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  const cleanIP = incomingIP
    ? incomingIP.split(",")[0].replace("::ffff:", "").trim()
    : "";

  if (!WHITELISTED_IPS.includes(cleanIP)) {
    console.warn(
      `Security Alert: Blocked unauthorized request from IP: ${cleanIP}`,
    );
    return res.status(403).send("Forbidden: IP not whitelisted");
  }

  next();
};
