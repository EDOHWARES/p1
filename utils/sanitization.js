exports.sanitize_phoneNumber = (phoneNumber) => {
  if (typeof phoneNumber !== "string") return "";

  // Remove all non-digit characters
  let cleaned = phoneNumber.trim().replace(/\D/g, "");

  // If it's a Nigerian number like 070..., convert to 234 format
  // if (cleaned.length === 11 && cleaned.startsWith("0")) {
  //   cleaned = "234" + cleaned.slice(1);
  // }

  // If it's international already (starts with 234, 44, 1, etc), leave as-is
  if (cleaned.length >= 11) {
    return cleaned;
  }

  // If it's too short or invalid
  return "";
};
