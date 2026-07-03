export const generateCardNumber = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let code = "SB-";

  for (let i = 0; i < 10; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
};

export const generatePinCode = () => {
  return String(
    Math.floor(100000 + Math.random() * 900000)
  );
};
