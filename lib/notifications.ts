import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailParams {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export const sendEmail = async ({ to, subject, text, html }: EmailParams) => {
  try {
    const from = process.env.EMAIL_FROM || "onboarding@resend.dev";

    await resend.emails.send({
      from,
      to,
      subject,
      text,
      html,
    });

    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("Error sending email:", error);
    // Depending on requirements, you might want to throw the error
    // to be handled by the calling function.
    throw new Error("Failed to send email.");
  }
};
