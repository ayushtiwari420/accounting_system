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
    from: process.env.SMTP_FROM || '"Urban Furniture ERP" <ayushtiwari12348@gmail.com>',
    to: toEmail,
    subject: "Urban Furniture Financial ERP - Password Reset Verification Code",
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; padding: 24px; max-width: 520px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="display: inline-block; width: 48px; height: 48px; background-color: #1E3A8A; border-radius: 12px; line-height: 48px; text-align: center; color: #ffffff; font-weight: bold; font-size: 20px;">
            UF
          </div>
          <h2 style="color: #0f172a; margin-top: 12px; font-size: 20px; font-weight: 800; tracking-tight: -0.5px;">Urban Furniture Financial ERP</h2>
          <p style="color: #64748b; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; margin-top: 2px;">Security & Password Verification</p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 16px 0;" />

        <p style="color: #334155; font-size: 14px;">Hello <strong>${userName || "User"}</strong>,</p>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">We received a request to reset your password for your <strong>Urban Furniture Financial ERP</strong> account (${toEmail}). Please enter the single-use 6-digit verification code below:</p>

        <div style="background: linear-gradient(135deg, #1E3A8A 0%, #1e40af 100%); padding: 20px; text-align: center; border-radius: 12px; margin: 24px 0; box-shadow: 0 4px 12px rgba(30, 58, 138, 0.2);">
          <span style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #ffffff;">${otpCode}</span>
        </div>

        <p style="color: #64748b; font-size: 13px; text-align: center;">⏱️ This verification code is valid for <strong>10 minutes</strong>.</p>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 20px; text-align: center;">If you did not request a password reset, please ignore this email or contact security.</p>
        
        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
        <p style="color: #cbd5e1; font-size: 11px; text-align: center;">© 2026 Urban Furniture Financial ERP System. All rights reserved.</p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};
