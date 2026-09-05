import nodemailer from "nodemailer";

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // TLS via STARTTLS on 587
    auth: {
      user: process.env.SMTP_USER || "ayushtiwari12348@gmail.com",
      pass: process.env.SMTP_PASS || "bpuwzwynegfvsqbo",
    },
  });
};

export const sendOtpEmail = async (toEmail, otpCode, userName) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.SMTP_FROM || '"Finora Financial ERP" <ayushtiwari12348@gmail.com>',
    to: toEmail,
    subject: "Finora Financial ERP - Password Reset Verification Code",
    html: `
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="width: 48px; h-48px; background-color: #1E3A8A; color: #ffffff; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; font-size: 20px; line-height: 48px; margin: 0 auto;">
            ⚡
          </div>
          <h2 style="color: #0f172a; margin-top: 12px; font-size: 20px; font-weight: 800; tracking-tight: -0.5px;">Finora Financial ERP</h2>
          <p style="color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 1.5px; margin-top: 4px;">Account Security & Verification</p>
        </div>

        <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">We received a request to reset your password for your <strong>Finora Financial ERP</strong> account (${toEmail}). Please enter the single-use 6-digit verification code below:</p>
          
          <div style="text-align: center; margin: 24px 0;">
            <span style="font-family: monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #1E3A8A; background-color: #eff6ff; padding: 12px 28px; border-radius: 12px; border: 1px border-blue-200; display: inline-block;">
              ${otpCode}
            </span>
          </div>

          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">This code is valid for 10 minutes. Do not share this OTP with anyone.</p>
        </div>

        <p style="color: #cbd5e1; font-size: 11px; text-align: center;">© 2026 Finora Financial ERP System. All rights reserved.</p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};
