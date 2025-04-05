import nodemailer from "nodemailer";
import { format } from "date-fns";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  rateDelta: 1000,
  rateLimit: 5,
});

const createMailOptions = (to: string, subject: string, html: string) => {
  return {
    from: {
      name: "Pharma App",
      address: process.env.EMAIL_USER as string,
    },
    to,
    subject,
    html,
    headers: {
      "X-Priority": "1",
      "X-MSMail-Priority": "High",
      Importance: "high",
      "X-Mailer": "Pharma App Mailer",
      "List-Unsubscribe": `<mailto:unsubscribe@${
        process.env.EMAIL_DOMAIN || "yourdomain.com"
      }?subject=Unsubscribe>`,
    },
    text: html
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  };
};

export const sendVerificationEmail = async (
  to: string,
  name: string,
  token: string
) => {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
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
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #666;
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
            <p>
              You received this email because you signed up for Pharma App.
              <br>
              <a href="mailto:unsubscribe@${
                process.env.EMAIL_DOMAIN || "yourdomain.com"
              }?subject=Unsubscribe" style="color: #4F46E5;">Unsubscribe</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  const mailOptions = createMailOptions(
    to,
    "Welcome to Pharma App - Verify Your Email",
    html
  );

  await transporter.sendMail(mailOptions);
};

export const sendPasswordResetEmail = async (
  to: string,
  name: string,
  token: string
) => {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${token}`;

  const html = `
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
            <p style="font-size: 12px;">
              You received this email because you requested a password reset.
              <br>
              <a href="mailto:unsubscribe@${
                process.env.EMAIL_DOMAIN || "yourdomain.com"
              }?subject=Unsubscribe" style="color: #4F46E5;">Unsubscribe</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  const mailOptions = createMailOptions(
    to,
    "Reset Your Password - Pharma App",
    html
  );

  await transporter.sendMail(mailOptions);
};

export const sendBulkReorderEmail = async (
  stockItems: any[],
  orderIds: string[]
) => {
  const confirmUrl = `${
    process.env.NEXT_PUBLIC_APP_URL
  }/confirm?ids=${orderIds.join(",")}`;
  const rejectUrl = `${
    process.env.NEXT_PUBLIC_APP_URL
  }/reject?ids=${orderIds.join(",")}`;

  const totalAmount = stockItems.reduce(
    (sum, item) => sum + Number(item.pricePerUnit) * item.reorderQuantity,
    0
  );

  const itemsTable = stockItems
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${
        item.name
      }</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${
        item.reorderQuantity
      } units</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${Number(
        item.pricePerUnit
      ).toFixed(2)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${(
        Number(item.pricePerUnit) * item.reorderQuantity
      ).toFixed(2)}</td>
    </tr>
  `
    )
    .join("");

  const isSingleOrder = stockItems.length === 1;
  const headerText = isSingleOrder
    ? "Stock Reorder Request"
    : "Multiple Stock Reorder Request";
  const confirmButtonText = isSingleOrder
    ? "Confirm Order"
    : "Confirm All Orders";

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${headerText}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <tr>
            <td align="center" style="padding: 20px 0;">
              <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 2px; border-radius: 16px;">
                <div style="background-color: white; border-radius: 14px; padding: 30px;">
                  <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #1e40af; font-size: 24px; margin: 0;">${headerText}</h1>
                    <p style="color: #6b7280; margin-top: 10px;">📣 Action Required 📣</p>
                  </div>
                  <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin-bottom: 30px; border-radius: 8px;">
                    <h2 style="color: #1e40af; font-size: 18px; margin: 0 0 20px 0;">Order Summary</h2>
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 6px;">
                      <thead>
                        <tr style="background-color: #f8fafc;">
                          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Item Name</th>
                          <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb;">Quantity</th>
                          <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Price/Unit</th>
                          <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Total</th>
                        </tr>
                      </thead>
                      <tbody>${itemsTable}</tbody>
                      <tfoot>
                        <tr>
                          <td colspan="3" style="padding: 12px; text-align: right; font-weight: bold;">Total Amount:</td>
                          <td style="padding: 12px; text-align: right; font-weight: bold;">$${totalAmount.toFixed(
                            2
                          )}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${confirmUrl}" style="display: inline-block; background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 0 10px; font-weight: bold;">
                      ${confirmButtonText}
                    </a>
                    <a href="${rejectUrl}" style="display: inline-block; background-color: #EF4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 0 10px; font-weight: bold;">
                      Cannot Supply
                    </a>
                  </div>
                  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 0;">
                      This is an automated message from Pharma's inventory management system.<br>
                      Please process ${
                        isSingleOrder ? "this order" : "these orders"
                      } as soon as possible.
                    </p>
                    <p style="color: #6b7280; font-size: 12px; text-align: center; margin-top: 10px;">
                      Order Date: ${format(new Date(), "PPP")}
                    </p>
                    <p style="color: #6b7280; font-size: 12px; text-align: center; margin-top: 10px;">
                      <a href="mailto:unsubscribe@${
                        process.env.EMAIL_DOMAIN || "yourdomain.com"
                      }?subject=Unsubscribe" style="color: #4F46E5;">Unsubscribe</a>
                    </p>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const mailOptions = createMailOptions(
    stockItems[0].vendor.email,
    isSingleOrder
      ? "🔔 Stock Reorder Request - Action Required"
      : "🔔 Multiple Stock Reorder Request - Action Required",
    html
  );

  await transporter.sendMail(mailOptions);
};
