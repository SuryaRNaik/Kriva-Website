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

export const getOwnerOrderNotificationHtml = (
  customer: any,
  items: any[],
  totalAmount: number,
  orderId: string
) => {
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #E8DCC8;">${item.title}</td>
      <td style="padding: 10px; border-bottom: 1px solid #E8DCC8; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #E8DCC8; text-align: right;">${item.price}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: 'Georgia', serif; color: #2B2B2B; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #E8DCC8; border-radius: 12px; background-color: #FAF8F2;">
      <h2 style="color: #C9A227; text-align: center;">New Order Received!</h2>
      <p style="text-align: center; font-size: 14px; color: #8A8070;">Order ID: ${orderId}</p>
      
      <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #E8DCC8; margin: 25px 0;">
        <h3 style="margin-top: 0; color: #2B2B2B; border-bottom: 1px solid #eee; padding-bottom: 10px;">Customer Details</h3>
        <p style="margin: 5px 0;"><strong>Name:</strong> ${customer.name}</p>
        <p style="margin: 5px 0;"><strong>Email:</strong> ${customer.email}</p>
        <p style="margin: 5px 0;"><strong>Phone:</strong> ${customer.phone}</p>
        <p style="margin: 5px 0;"><strong>Address:</strong> ${customer.address}, ${customer.city} - ${customer.pincode}</p>
      </div>

      <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #E8DCC8;">
        <h3 style="margin-top: 0; color: #2B2B2B; border-bottom: 1px solid #eee; padding-bottom: 10px;">Order Items</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <thead>
            <tr>
              <th style="text-align: left; padding: 10px; border-bottom: 2px solid #E8DCC8;">Item</th>
              <th style="text-align: center; padding: 10px; border-bottom: 2px solid #E8DCC8;">Qty</th>
              <th style="text-align: right; padding: 10px; border-bottom: 2px solid #E8DCC8;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="text-align: right; padding: 15px 10px; font-weight: bold;">Total Paid:</td>
              <td style="text-align: right; padding: 15px 10px; font-weight: bold; color: #C9A227;">₹${totalAmount.toLocaleString('en-IN')}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  `;
};

export const getCustomerOrderConfirmationHtml = (
  customer: any,
  items: any[],
  totalAmount: number,
  orderId: string
) => {
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #E8DCC8;">${item.title}</td>
      <td style="padding: 10px; border-bottom: 1px solid #E8DCC8; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #E8DCC8; text-align: right;">${item.price}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: 'Georgia', serif; color: #2B2B2B; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #E8DCC8; border-radius: 12px; background-color: #FAF8F2;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #C9A227; margin: 0;">Kriva Studio</h1>
        <p style="font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin-top: 5px; color: #8A8070;">Order Confirmed</p>
      </div>
      
      <p style="font-size: 16px;">Dear <strong>${customer.name}</strong>,</p>
      
      <p style="font-size: 16px; line-height: 1.6;">
        Thank you for your order! Your payment was successful. We will begin preparing your handcrafted pieces right away.
      </p>

      <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #E8DCC8; margin: 25px 0;">
        <h3 style="margin-top: 0; color: #2B2B2B; border-bottom: 1px solid #eee; padding-bottom: 10px;">Order Summary (ID: ${orderId})</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 15px;">
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="text-align: right; padding: 10px; font-weight: bold;">Total:</td>
              <td style="text-align: right; padding: 10px; font-weight: bold; color: #C9A227;">₹${totalAmount.toLocaleString('en-IN')}</td>
            </tr>
          </tfoot>
        </table>
        
        <h4 style="margin: 15px 0 5px 0; color: #2B2B2B;">Shipping Address:</h4>
        <p style="margin: 0; font-size: 14px; color: #666;">
          ${customer.address}<br>
          ${customer.city} - ${customer.pincode}
        </p>
      </div>

      <div style="background-color: #fff8e1; padding: 15px; border-left: 4px solid #C9A227; border-radius: 4px; margin: 25px 0;">
        <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #5c4e1c;">
          <strong>Important Note on Delivery:</strong> Because each piece is exclusively hand-painted just for you, please allow <strong>12-15 days</strong> for the artwork to be beautifully completed, plus an additional <strong>5 days</strong> for standard shipping and delivery.
        </p>
      </div>

      <p style="font-size: 16px; margin-top: 30px;">
        Warmly,<br>
        <strong>Ruchitha Reddy</strong><br>
        <span style="color: #C9A227;">Kriva Studio</span>
    </div>
  `;
};

export const getCustomerRefundEmailHtml = (
  customer: any,
  order: any,
  refundId: string
) => {
  return `
    <div style="font-family: 'Georgia', serif; color: #2B2B2B; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #E8DCC8; border-radius: 12px; background-color: #FAF8F2;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #C62828; margin: 0;">Kriva Studio</h1>
        <p style="font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin-top: 5px; color: #8A8070;">Order Cancelled</p>
      </div>
      
      <p style="font-size: 16px;">Dear <strong>${customer.name}</strong>,</p>
      
      <p style="font-size: 16px; line-height: 1.6;">
        As per your request, we have successfully cancelled your order (<strong>${order.orderId}</strong>).
      </p>

      <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #E8DCC8; margin: 25px 0;">
        <h3 style="margin-top: 0; color: #2B2B2B; border-bottom: 1px solid #eee; padding-bottom: 10px;">Refund Details</h3>
        <p style="margin: 5px 0;"><strong>Refund Status:</strong> Initiated</p>
        <p style="margin: 5px 0;"><strong>Refund Amount:</strong> ₹${order.totalAmount.toLocaleString('en-IN')}</p>
        <p style="margin: 5px 0;"><strong>Refund ID:</strong> ${refundId}</p>
      </div>

      <div style="background-color: #e8f5e9; padding: 15px; border-left: 4px solid #4caf50; border-radius: 4px; margin: 25px 0;">
        <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #1b5e20;">
          A full refund has been initiated to your original payment method. It usually takes <strong>5–7 business days</strong> for the funds to reflect in your account, depending on your bank.
        </p>
      </div>

      <p style="font-size: 16px; margin-top: 30px;">
        We hope to serve you again in the future!<br><br>
        Warmly,<br>
        <strong>Ruchitha Reddy</strong><br>
        <span style="color: #C9A227;">Kriva Studio</span>
      </p>
    </div>
  `;
};

export const getOwnerCancellationEmailHtml = (
  customer: any,
  order: any,
  refundId: string,
  reason: string
) => {
  return `
    <div style="font-family: 'Georgia', serif; color: #2B2B2B; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #E8DCC8; border-radius: 12px; background-color: #fff3f3;">
      <h2 style="color: #C62828; text-align: center;">Order Cancelled</h2>
      <p style="text-align: center; font-size: 14px; color: #8A8070;">Order ID: ${order.orderId}</p>
      
      <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #ffcdd2; margin: 25px 0;">
        <h3 style="margin-top: 0; color: #2B2B2B; border-bottom: 1px solid #eee; padding-bottom: 10px;">Cancellation Details</h3>
        <p style="margin: 5px 0;"><strong>Customer:</strong> ${customer.name} (${customer.email})</p>
        <p style="margin: 5px 0; color: #C62828;"><strong>Reason Given:</strong> ${reason}</p>
      </div>

      <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #E8DCC8;">
        <h3 style="margin-top: 0; color: #2B2B2B; border-bottom: 1px solid #eee; padding-bottom: 10px;">Refund Automated</h3>
        <p style="margin: 5px 0;">The system has automatically refunded the customer via Razorpay.</p>
        <p style="margin: 5px 0;"><strong>Refund ID:</strong> ${refundId}</p>
        <p style="margin: 5px 0;"><strong>Amount Refunded:</strong> ₹${order.totalAmount.toLocaleString('en-IN')}</p>
      </div>
    </div>
  `;
};
