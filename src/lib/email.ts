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

export const getShopCustomerEmailHtml = (
  customerName: string,
  items: { title: string; quantity: number; price: string }[],
  totalAmount: number,
  orderId: string,
  shippingAddress: string
) => {
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #E8DCC8;">${item.title} (x${item.quantity})</td>
      <td style="padding: 10px; border-bottom: 1px solid #E8DCC8; text-align: right;">${item.price}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: 'Georgia', serif; color: #2B2B2B; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #E8DCC8; border-radius: 12px; background-color: #FAF8F2;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #C9A227; margin: 0;">Kriva Studio</h1>
        <p style="font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin-top: 5px; color: #8A8070;">Order Confirmed</p>
      </div>
      
      <p style="font-size: 16px;">Dear <strong>${customerName}</strong>,</p>
      
      <p style="font-size: 16px; line-height: 1.6;">
        Thank you for your order! Your payment was successful, and we are thrilled to begin preparing your handcrafted pieces.
      </p>

      <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #E8DCC8; margin: 25px 0;">
        <h3 style="margin-top: 0; color: #2B2B2B;">Order Summary (#${orderId})</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          ${itemsHtml}
          <tr>
            <td style="padding: 10px; font-weight: bold; text-align: right;">Total Paid:</td>
            <td style="padding: 10px; font-weight: bold; text-align: right;">₹${totalAmount.toLocaleString('en-IN')}</td>
          </tr>
        </table>
      </div>

      <div style="background-color: #F5F0E6; padding: 15px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #C9A227;">
        <h4 style="margin-top: 0; margin-bottom: 10px; color: #2B2B2B;">Shipping To:</h4>
        <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #5A5548;">${shippingAddress}</p>
      </div>

      <p style="font-size: 16px; line-height: 1.6; font-weight: bold; color: #A07830;">
        Please note: Since each piece is exclusively hand-painted and crafted just for you, please allow 12-15 days for delivery (approx. 10 days for creation and 5 days for shipping).
      </p>

      <p style="font-size: 16px; margin-top: 30px;">
        Warmly,<br>
        <strong>Ruchitha Reddy</strong><br>
        <span style="color: #C9A227;">Kriva Studio</span>
      </p>
    </div>
  `;
};

export const getShopOwnerEmailHtml = (
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  shippingAddress: string,
  items: { title: string; quantity: number; price: string }[],
  totalAmount: number,
  orderId: string
) => {
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.title} (x${item.quantity})</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.price}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="color: #28a745; margin-top: 0;">🎉 New Order Received!</h2>
      <p><strong>Order ID:</strong> ${orderId}</p>
      <p><strong>Total Amount Received:</strong> ₹${totalAmount.toLocaleString('en-IN')}</p>
      
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">

      <h3 style="margin-top: 0;">Customer Details</h3>
      <p style="margin: 5px 0;"><strong>Name:</strong> ${customerName}</p>
      <p style="margin: 5px 0;"><strong>Email:</strong> ${customerEmail}</p>
      <p style="margin: 5px 0;"><strong>Phone:</strong> ${customerPhone}</p>
      
      <h3 style="margin-top: 15px;">Shipping Address</h3>
      <p style="margin: 5px 0; background-color: #f9f9f9; padding: 10px; border-radius: 4px;">${shippingAddress}</p>

      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">

      <h3 style="margin-top: 0;">Items Ordered</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        ${itemsHtml}
      </table>
      
      <p style="margin-top: 30px; font-size: 12px; color: #888;">
        This is an automated notification from your Kriva Studio website.
      </p>
    </div>
  `;
};
