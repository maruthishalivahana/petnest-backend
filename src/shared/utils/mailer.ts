// utils/mailer.ts
import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
    if (!transporter) {

        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            throw new Error("SMTP_USER and SMTP_PASS must be set in .env file");
        }

        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        } as SMTPTransport.Options);
    }
    return transporter;
}

export async function sendOtpEmail(to: string, otp: number) {
    const fromAddress: string = process.env.SMTP_FROM || process.env.SMTP_USER || "";
    console.log(`Sending OTP email via ${process.env.SMTP_HOST || "smtp.gmail.com"} from ${fromAddress} to ${to}`);

    const appName = "PetNest";
    const supportUrl = 'https://petnest.com/support';
    const otpExpiryMinutes = 10;

    const html = `
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <style>
    /* Some clients support head styles; keep them minimal */
    @media screen and (max-width: 480px) {
      .container { padding: 16px !important; }
      .otp { font-size: 26px !important; }
    }
    @media (prefers-color-scheme: dark) {
      .card { background-color: #0b1220 !important; color: #e6eef8 !important; }
      .btn { background-color: #1f6feb !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:Helvetica,Arial,sans-serif;-webkit-text-size-adjust:none;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table class="container" width="600" cellpadding="0" cellspacing="0" role="presentation" style="width:600px;max-width:100%;background:transparent;">
          <tr>
            <td style="padding:16px 0;text-align:center;">
              <!-- Logo area -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td align="center">
                    <div style="display:inline-block;padding:8px 16px;border-radius:8px;background:linear-gradient(135deg,#1e88e5,#6dd5fa);color:white;font-weight:700;font-size:20px;">
                      ${appName}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td>
              <table class="card" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;border-radius:12px;box-shadow:0 6px 18px rgba(12,24,40,0.08);overflow:hidden;">
                <tr>
                  <td style="padding:28px;">

                    <h1 style="margin:0 0 8px 0;font-size:20px;color:#0f1724;">Your verification code</h1>
                    <p style="margin:0 0 20px 0;color:#475569;font-size:15px;line-height:1.45;">
                      Use the one-time code below to complete your action. This code will expire in <strong>${otpExpiryMinutes} minutes</strong>.
                    </p>

                    <!-- OTP -->
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td align="center" style="padding:18px 0 22px 0;">
                          <span class="otp" style="display:inline-block;padding:14px 22px;border-radius:10px;background:#f1f5f9;font-weight:700;font-size:32px;letter-spacing:3px;font-family: 'Courier New', Courier, monospace;color:#0b1220;">
                            ${otp}
                          </span>
                        </td>
                      </tr>
                    </table>

                    <!-- Optional CTA (verify link fallback) -->
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td align="center" style="padding-bottom:20px;">
                          <a href="${supportUrl}?email=${encodeURIComponent(to)}" target="_blank" class="btn" style="display:inline-block;padding:12px 20px;border-radius:10px;background:#1f6feb;color:#ffffff;text-decoration:none;font-weight:600;">
                            Need Help?
                          </a>
                        </td>
                      </tr>
                    </table>

                    <hr style="border:none;border-top:1px solid #eef2f7;margin:20px 0;" />

                    <p style="margin:0;color:#64748b;font-size:13px;line-height:1.4;">
                      If you didn't request this, please ignore this email or <a href="${supportUrl}" style="color:#1f6feb;text-decoration:none;">contact support</a>.
                    </p>

                    <p style="margin:14px 0 0 0;color:#94a3b8;font-size:12px;">
                      — ${appName} team
                    </p>

                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#fbfdff;padding:14px 28px;text-align:center;color:#94a3b8;font-size:12px;">
                    © ${new Date().getFullYear()} ${appName}. All rights reserved.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
    const mailer = getTransporter();

    const text = `${appName} — Your verification code\n\nYour OTP is: ${otp}\n\nIt expires in ${otpExpiryMinutes} minutes.\n\nIf you didn't request this, ignore this message or contact support: ${supportUrl}`;

    const info = await mailer.sendMail({
        from: `"${appName}" <${fromAddress}>`,
        to,
        subject: `Your ${appName} Verification Code`,
        text,
        html,
        headers: {
            'X-Priority': '1',
            'X-MSMail-Priority': 'High',
            'Importance': 'high'
        }
    });

    console.log(`OTP email sent successfully to ${to}`);
}
