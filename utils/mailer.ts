// utils/mailer.ts
import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
} as SMTPTransport.Options);

export async function sendOtpEmail(to: string, otp: number) {
    console.log("Connecting to SMTP:", process.env.SMTP_HOST);
    await transporter.sendMail({
        from: `"PetNest" <${process.env.SMTP_FROM}>`,
        to,
        subject: "Your OTP Code",
        text: `Your OTP is ${otp}. It expires in 5 minutes.`,
    });
}
