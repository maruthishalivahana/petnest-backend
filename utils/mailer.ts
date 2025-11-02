// utils/mailer.ts
import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

// Create transporter lazily so env vars are loaded by dotenv first
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
    if (!transporter) {
        // Validate required environment variables
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            throw new Error("SMTP_USER and SMTP_PASS must be set in .env file");
        }

        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        } as SMTPTransport.Options);
    }
    return transporter;
}

export async function sendOtpEmail(to: string, otp: number) {
    const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;
    console.log(`Sending OTP email via ${process.env.SMTP_HOST || "smtp.gmail.com"} from ${fromAddress} to ${to}`);

    const mailer = getTransporter();
    await mailer.sendMail({
        from: `"PetNest" <${fromAddress}>`,
        to,
        subject: "Your OTP Code",
        text: `Your OTP is ${otp}. It expires in 5 minutes.`,
        html: `<p>Your OTP code is <b>${otp}</b>. It will expire in 5 minutes.</p>`
    });

    console.log(`OTP email sent successfully to ${to}`);
}
