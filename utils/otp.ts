/**
 * Generates a random 6-digit number string.
 * Range: 100000 to 999999
 */
export const generateOtp = (): string => {
  const min = 100000;
  const max = 999999;
  // Standard formula for random integer within a range
  const otp = Math.floor(Math.random() * (max - min + 1)) + min;
  return otp.toString();
};