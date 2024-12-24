import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

export const sendVerificationEmail = async (
  to: string,
  name: string,
  token: string
) => {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Welcome to Pharma App - Verify Your Email",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .header {
              background: linear-gradient(135deg, #4F46E5 0%, #3b82f6 100%);
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background: #ffffff;
              padding: 30px;
              border-radius: 0 0 8px 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .button {
              background: linear-gradient(135deg, #4F46E5 0%, #3b82f6 100%);
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 6px;
              display: inline-block;
              margin: 20px 0;
              font-weight: bold;
              text-align: center;
              transition: background-color 0.3s ease;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>Welcome to Pharma App!</h1>
            </div>
            <div class="content">
              <h2>Hello ${name},</h2>
              <p>Thank you for joining Pharma App. We're excited to have you on board!</p>
              <p>To get started, please verify your email address by clicking the button below:</p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button" style="color: #ffffff !important; text-decoration: none;">Verify Email Address</a>
              </div>
              
              <p style="font-size: 14px; color: #666;">
                If you didn't create this account, you can safely ignore this email.
              </p>
              
              <p style="font-size: 12px; color: #999;">
                Button not working? Copy and paste this link into your browser:<br>
                <a href="${verificationUrl}" style="color: #4F46E5;">${verificationUrl}</a>
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Pharma App. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendPasswordResetEmail = async (
  to: string,
  name: string,
  token: string
) => {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Reset Your Password - Pharma App",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
          <style>
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.5;
            }
            .header {
              background: linear-gradient(135deg, #4F46E5 0%, #3b82f6 100%);
              padding: 40px 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .header h1 {
              color: #ffffff;
              margin: 0;
              font-size: 28px;
              font-weight: 700;
            }
            .content {
              background: #ffffff;
              padding: 40px 20px;
              border-radius: 0 0 8px 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .button-container {
              text-align: center;
              margin: 30px 0;
            }
            .button {
              display: inline-block;
              padding: 14px 32px;
              background: linear-gradient(135deg, #4F46E5 0%, #3b82f6 100%);
              color: #ffffff !important;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              font-size: 16px;
              box-shadow: 0 4px 6px rgba(79, 70, 229, 0.25);
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #6b7280;
              font-size: 14px;
            }
            .help-text {
              color: #6b7280;
              font-size: 14px;
              text-align: center;
              margin: 20px 0;
            }
            .link-text {
              color: #4F46E5;
              word-break: break-all;
              font-size: 14px;
            }
            .divider {
              height: 1px;
              background: #e5e7eb;
              margin: 30px 0;
            }
          </style>
        </head>
        <body style="margin: 0; padding: 20px; background-color: #f3f4f6;">
          <div class="email-container">
            <div class="header">
              <h1>Reset Your Password</h1>
            </div>
            <div class="content">
              <h2 style="color: #1f2937; margin-top: 0;">Hello ${name},</h2>
              <p style="color: #4b5563;">We received a request to reset your password. Click the button below to create a new password:</p>
              
              <div class="button-container">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              
              <div class="divider"></div>
              
              <p class="help-text">
                If you didn't request this, you can safely ignore this email.
              </p>
              
              <p class="help-text">
                Button not working? Copy and paste this link into your browser:<br>
                <a href="${resetUrl}" class="link-text">${resetUrl}</a>
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Pharma App. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};
