import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const sendOTPEmail = async (email, newOTP, fullName = "User") => {
  const username = process.env.GMAIL_USERNAME?.trim();
  const passcode = process.env.GMAIL_PASSCODE?.trim();

  if (!username || !passcode) {
    const error = new Error(
      "Email delivery failed: GMAIL_USERNAME or GMAIL_PASSCODE is empty in server/.env."
    );
    error.statusCode = 500;
    throw error;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: username,
      pass: passcode,
    },
  });

  const mailOptions = {
    from: `"Cravings" <${username}>`,
    to: email,
    // Subject starts with the OTP so phone lock-screens show the code instantly!
    subject: `${newOTP} is your Cravings verification code`,
    priority: "high",
    headers: {
      "X-Priority": "1 (Highest)",
      "X-MSMail-Priority": "High",
      "Importance": "High",
    },
    text: `Your Cravings verification code is: ${newOTP}. This code will expire in 60 seconds. Do not share this OTP with anyone.`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 30px 15px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="500" border="0" cellspacing="0" cellpadding="0" style="max-width: 480px; background-color: #ffffff; border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; overflow: hidden;">
                
                <!-- Brand Header -->
                <tr>
                  <td align="center" style="padding: 30px 20px 20px 20px; background: linear-gradient(135deg, #E53935 0%, #EA580C 100%);">
                    <div style="font-size: 28px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">
                      🍴 Cravings
                    </div>
                    <div style="font-size: 13px; font-weight: 600; color: #ffedd5; margin-top: 4px;">
                      Food Delivery & Takeaway
                    </div>
                  </td>
                </tr>

                <!-- Content Body -->
                <tr>
                  <td style="padding: 32px 28px 24px 28px;">
                    <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; color: #0f172a; text-align: center;">
                      Verification Code
                    </h2>
                    <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 22px; color: #475569; text-align: center;">
                      Hello <strong style="color: #0f172a;">${fullName}</strong>, use the One-Time Password (OTP) below to verify your Cravings account.
                    </p>

                    <!-- OTP Code Box -->
                    <div style="background-color: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 16px; padding: 18px 10px; text-align: center; margin-bottom: 24px;">
                      <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #E53935;">
                        ${newOTP}
                      </span>
                    </div>

                    <p style="margin: 0 0 12px 0; font-size: 13px; line-height: 20px; color: #64748b; text-align: center;">
                      ⏱️ This code will expire in <strong style="color: #0f172a;">60 seconds</strong>.
                    </p>
                    <p style="margin: 0; font-size: 12px; line-height: 18px; color: #94a3b8; text-align: center;">
                      If you did not request this OTP, you can safely ignore this email.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 20px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
                    <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                      © ${new Date().getFullYear()} Cravings Food Delivery. All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};
