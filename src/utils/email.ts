/* eslint-disable @typescript-eslint/no-explicit-any */
import nodemailer from "nodemailer";
import { envVars } from "../config/env";
import AppError from "../errorHelper/AppError";
import status from "http-status";
import path from "path";
import ejs from "ejs"


const transporter = nodemailer.createTransport({
    host: envVars.SEND_EMAIL.SEND_EMAIL_SMTP_HOST,
    secure: true,
    auth: {
        user: envVars.SEND_EMAIL.SEND_EMAIL_SMTP_USER,
        pass: envVars.SEND_EMAIL.SEND_EMAIL_SMTP_PASS
    },
    port: envVars.SEND_EMAIL.SEND_EMAIL_SMTP_PORT
})

interface SendEmailTemplete {
    to: string;
    subject: string;
    templeteName: string;
    templeteData: Record<string, any>
    attachment?: {
        fileName: string;
        content: Buffer | string;
        contentType: string
    }[]
}

export const sendEmail = async ({ to, subject, templeteName, templeteData, attachment }: SendEmailTemplete) => {
    console.log({ to, subject, templeteName, templeteData, attachment });
    try {
        const templetePath = path.resolve(process.cwd(), `src/templetes/${templeteName}.ejs`)

        const html = await ejs.renderFile(templetePath, templeteData)

        const info = await transporter.sendMail({
            from: envVars.SEND_EMAIL.SEND_EMAIL_SMTP_FROM,
            to: to,
            subject: subject,
            html: html,
            attachments: attachment?.map((atach) => ({
                fileName: atach.fileName,
                content: atach.content,
                contentType: atach.contentType,
            }))
        });

        console.log(`Email sent to ${to}: ${info.messageId}`);

    } catch (error: any) {
        console.log("Email sending error:", error.message);
        throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to send email!")
    }

}