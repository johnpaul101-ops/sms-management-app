export const getExpirationTime = (now, durationInMinutes) => {
  const expiryDate = new Date(now.getTime() + durationInMinutes * 60 * 1000);
  return expiryDate.toISOString();
};

export const getTimeStamp = (now) => {
  return now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Manila",
  });
};
