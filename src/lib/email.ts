import nodemailer from "nodemailer";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: SendEmailParams) => {
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    console.warn("SMTP credentials not configured. Email will not be sent.");
    return false;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail", // Can be configured for other services
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"Kriva Studio" <${process.env.SMTP_EMAIL}>`,
      to,
      subject,
      html,
    });
    console.log("Message sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

export const getWorkshopConfirmationEmailHtml = (
  customerName: string,
  workshopTitle: string,
  date: string,
  time: string,
  location: string,
  orderId: string
) => {
  return `
    <div style="font-family: 'Georgia', serif; color: #2B2B2B; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #E8DCC8; border-radius: 12px; background-color: #FAF8F2;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #C9A227; margin: 0;">Kriva Studio</h1>
        <p style="font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin-top: 5px; color: #8A8070;">Booking Confirmed</p>
      </div>
      
      <p style="font-size: 16px;">Dear <strong>${customerName}</strong>,</p>
      
      <p style="font-size: 16px; line-height: 1.6;">
        Thank you for booking your spot in our upcoming workshop! Your payment was successful, and your seat is confirmed.
      </p>

      <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #E8DCC8; margin: 25px 0;">
        <h3 style="margin-top: 0; color: #2B2B2B;">Workshop Details</h3>
        <p style="margin: 5px 0;"><strong>Workshop:</strong> ${workshopTitle}</p>
        <p style="margin: 5px 0;"><strong>Date:</strong> ${date}</p>
        <p style="margin: 5px 0;"><strong>Time:</strong> ${time}</p>
        <p style="margin: 5px 0;"><strong>Location:</strong> ${location}</p>
        <p style="margin: 5px 0; margin-top: 15px; font-size: 12px; color: #8A8070;"><strong>Order ID:</strong> ${orderId}</p>
      </div>

      <p style="font-size: 16px; line-height: 1.6;">
        All materials will be provided at the venue. If you have any questions, please reply to this email or reach out to us via our contact page.
      </p>

      <p style="font-size: 16px; margin-top: 30px;">
        Warmly,<br>
        <strong>Ruchitha Reddy</strong><br>
        <span style="color: #C9A227;">Kriva Studio</span>
      </p>
    </div>
  `;
};
