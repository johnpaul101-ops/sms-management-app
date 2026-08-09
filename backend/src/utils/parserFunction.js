export const parseSmsResponse = (responseText) => {
  const cleanResponse = responseText.trim();

  if (cleanResponse.startsWith("STATUS_OK")) {
    const code = cleanResponse.split(":")[1];
    return {
      status: "SUCCESS",
      code: code,
      message: "SMS code received successfully",
    };
  }

  if (cleanResponse.startsWith("STATUS_WAIT_RETRY")) {
    const lastCode = cleanResponse.split(":")[1];
    return {
      status: "RETRY_WAIT",
      lastCode: lastCode,
      message: "Waiting for next SMS code",
    };
  }

  switch (cleanResponse) {
    case "STATUS_WAIT_CODE":
      return { status: "PENDING", message: "Waiting for SMS" };

    case "STATUS_CANCEL":
      return { status: "CANCELLED", message: "Activation canceled" };

    case "BAD_KEY":
      return { status: "ERROR", message: "Invalid API Key" };

    case "BAD_ACTION":
      return { status: "ERROR", message: "Incorrect Action" };

    case "NO_ACTIVATION":
      return { status: "ERROR", message: "Incorrect Activation ID" };

    default:
      return { status: "UNKNOWN", message: cleanResponse };
  }
};
