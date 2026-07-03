import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOrderEmail = async (receiver?: string) => {
  const to =
    process.env.EMAIL_RECEIVER ||
    process.env.EMAIL_USER ||
    receiver;

  if (!to) {
    console.log("Order email skipped: no receiver configured");
    return null;
  }

  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "New AI-COMMERCE Order Received",
    html: `
      <h2>New Order Received</h2>
      <p>A customer has placed a new order.</p>
      <p>Please check Admin Dashboard for details.</p>
    `,
  });
};

export const sendVerificationEmail = async (
  receiver: string,
  verifyUrl: string
) => {
  if (!receiver) {
    console.log("Verification email skipped: no receiver");
    return null;
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("Verification email dev link:", verifyUrl);

    return {
      devLink: verifyUrl,
    };
  }

  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: receiver,
    subject: "Verify your SAQSO account email",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px;border:1px solid #eee;border-radius:20px">
        <h2>Verify your email</h2>
        <p>Welcome to SAQSO. Please verify your email before using online payment methods.</p>
        <p>
          <a href="${verifyUrl}" style="display:inline-block;background:#000;color:#fff;padding:12px 18px;border-radius:999px;text-decoration:none;font-weight:bold">
            Verify Email
          </a>
        </p>
        <p style="color:#666;font-size:13px">If the button does not work, open this link:</p>
        <p style="word-break:break-all;font-size:13px">${verifyUrl}</p>
      </div>
    `,
  });
};
