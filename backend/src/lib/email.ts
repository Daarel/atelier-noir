import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: SendEmailOptions) => {
  return await resend.emails.send({
    from: process.env.EMAIL_FROM || ('Atelier Noir <onboarding@resend.dev>' as string),
    to,
    subject,
    html,
  });
};
