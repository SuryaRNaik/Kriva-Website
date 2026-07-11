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
    // Message sent info removed
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
      <td style="padding: 15px 0; border-bottom: 1px solid #EAE4D9;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border:none;">
          <tr>
            <td width="70" style="vertical-align: top;">
              ${item.image ? `<img src="${item.image.startsWith('http') ? item.image : `https://krivastudio.in${item.image}`}" alt="${item.title}" style="width: 60px; height: 75px; object-fit: cover; border-radius: 8px; border: 1px solid #EAE4D9;" />` : ''}
            </td>
            <td style="padding-left: 15px; vertical-align: top;">
              <h4 style="margin: 0 0 5px 0; font-size: 14px; color: #2B2B2B; font-weight: 600;">${item.title}</h4>
              ${item.sizes && item.sizes.length > 0 ? `<p style="margin: 0 0 5px 0; font-size: 12px; color: #8A8070;">Size: ${item.sizes.join(', ')}</p>` : ''}
              <p style="margin: 0; font-size: 12px; color: #8A8070;">Qty: ${item.quantity}</p>
            </td>
            <td style="text-align: right; vertical-align: top; font-size: 14px; color: #2B2B2B; font-weight: 600;">
              ₹${item.price.toLocaleString('en-IN')}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');

  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #F9F9F9; padding: 40px 20px; color: #2B2B2B;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
        
        <!-- Header -->
        <div style="background-color: #1A1A1A; padding: 30px; text-align: center;">
          <h1 style="margin: 0; color: #C89B2D; font-size: 24px; font-weight: 400; letter-spacing: 2px; text-transform: uppercase;">New Order Received</h1>
          <div style="margin-top: 10px; display: inline-block; background-color: #22C55E; color: white; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: bold; letter-spacing: 1px;">PAID</div>
        </div>

        <div style="padding: 40px;">
          
          <!-- Order Info -->
          <div style="margin-bottom: 30px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="50%">
                  <p style="margin: 0 0 5px 0; font-size: 11px; color: #8A8070; text-transform: uppercase; letter-spacing: 1px;">Order ID</p>
                  <p style="margin: 0; font-size: 14px; font-weight: 600;">${orderId}</p>
                </td>
                <td width="50%" style="text-align: right;">
                  <p style="margin: 0 0 5px 0; font-size: 11px; color: #8A8070; text-transform: uppercase; letter-spacing: 1px;">Order Date</p>
                  <p style="margin: 0; font-size: 14px; font-weight: 600;">${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </td>
              </tr>
            </table>
          </div>

          <!-- Customer Details -->
          <div style="background-color: #FAF6EF; border-radius: 8px; padding: 25px; margin-bottom: 30px; border: 1px solid #EAE4D9;">
            <h3 style="margin: 0 0 15px 0; font-size: 14px; color: #C89B2D; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #EAE4D9; padding-bottom: 10px;">Customer Details</h3>
            <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>${customer.name}</strong></p>
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #5A5548;"><a href="mailto:${customer.email}" style="color: #5A5548; text-decoration: none;">${customer.email}</a></p>
            <p style="margin: 0 0 15px 0; font-size: 14px; color: #5A5548;">${customer.phone}</p>
            <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #5A5548;">
              ${customer.address}<br>
              ${customer.city} - ${customer.pincode}
            </p>
          </div>

          <!-- Order Items -->
          <h3 style="margin: 0 0 15px 0; font-size: 14px; color: #C89B2D; text-transform: uppercase; letter-spacing: 1px;">Order Summary</h3>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px;">
            ${itemsHtml}
            <tr>
              <td style="padding-top: 20px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="font-size: 16px; font-weight: bold;">Total Paid</td>
                    <td style="text-align: right; font-size: 18px; font-weight: bold; color: #C89B2D;">₹${totalAmount.toLocaleString('en-IN')}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Status & Timeline -->
          <div style="background-color: #F9F9F9; border-radius: 8px; padding: 20px; border: 1px dashed #D1D5DB; text-align: center;">
            <p style="margin: 0 0 5px 0; font-size: 12px; color: #8A8070; text-transform: uppercase; letter-spacing: 1px;">Action Required</p>
            <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1A1A1A;">Estimated Dispatch: 12-15 Days</p>
          </div>

        </div>
        
        <!-- Footer -->
        <div style="background-color: #F9F9F9; padding: 20px; text-align: center; border-top: 1px solid #EAE4D9;">
          <p style="margin: 0; font-size: 11px; color: #9CA3AF;">This order was automatically generated by the Kriva Studio website.</p>
        </div>
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
      <td style="padding: 20px 0; border-bottom: 1px solid #EAE4D9;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border:none;">
          <tr>
            <td width="80" style="vertical-align: top;">
              ${item.image ? `<img src="${item.image.startsWith('http') ? item.image : `https://krivastudio.in${item.image}`}" alt="${item.title}" style="width: 70px; height: 90px; object-fit: cover; border-radius: 8px; border: 1px solid #EAE4D9;" />` : ''}
            </td>
            <td style="padding-left: 20px; vertical-align: top;">
              <h4 style="margin: 0 0 8px 0; font-size: 16px; color: #2B2B2B; font-weight: 400; font-family: 'Georgia', serif;">${item.title}</h4>
              ${item.sizes && item.sizes.length > 0 ? `<p style="margin: 0 0 5px 0; font-size: 13px; color: #8A8070;">Size: ${item.sizes.join(', ')}</p>` : ''}
              <p style="margin: 0; font-size: 13px; color: #8A8070;">Quantity: ${item.quantity}</p>
            </td>
            <td style="text-align: right; vertical-align: top; font-size: 15px; color: #2B2B2B; font-weight: 600;">
              ₹${item.price.toLocaleString('en-IN')}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');

  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #FAF6EF; padding: 40px 20px; color: #2B2B2B;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.04);">
        
        <!-- Header -->
        <div style="text-align: center; padding: 40px 40px 20px 40px;">
          <h1 style="margin: 0; font-family: 'Georgia', serif; font-size: 32px; color: #C89B2D; font-weight: normal;">Kriva Studio</h1>
          <p style="margin: 10px 0 0 0; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #8A8070;">Handcrafted with Tradition</p>
        </div>
        
        <!-- Hero Section -->
        <div style="text-align: center; padding: 20px 40px 30px 40px;">
          <div style="margin-bottom: 20px;">
            <img src="https://img.icons8.com/color/96/000000/checked--v1.png" alt="Success" width="60" height="60" style="display: inline-block;" />
          </div>
          <h2 style="margin: 0 0 15px 0; font-family: 'Georgia', serif; font-size: 24px; color: #2B2B2B; font-weight: normal;">Your Order is Confirmed!</h2>
          <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #5A5548;">
            Dear ${customer.name},<br>Thank you for choosing Kriva Studio. We have successfully received your payment and are thrilled to begin crafting your order.
          </p>
        </div>

        <div style="padding: 0 40px 40px 40px;">
          
          <!-- Order Summary Card -->
          <div style="background-color: #FFFFFF; border: 1px solid #EAE4D9; border-radius: 12px; padding: 30px; margin-bottom: 25px;">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #EAE4D9; padding-bottom: 15px; margin-bottom: 15px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin: 0 0 4px 0; font-size: 11px; color: #8A8070; text-transform: uppercase; letter-spacing: 1px;">Order ID</p>
                    <p style="margin: 0; font-size: 14px; font-weight: 600;">${orderId}</p>
                  </td>
                  <td style="text-align: right;">
                    <p style="margin: 0 0 4px 0; font-size: 11px; color: #8A8070; text-transform: uppercase; letter-spacing: 1px;">Payment Date</p>
                    <p style="margin: 0; font-size: 14px; font-weight: 600;">${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </td>
                </tr>
              </table>
            </div>
            
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
              ${itemsHtml}
              <tr>
                <td style="padding-top: 25px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="font-size: 16px; color: #8A8070;">Total Amount</td>
                      <td style="text-align: right; font-size: 22px; font-weight: bold; color: #C89B2D;">₹${totalAmount.toLocaleString('en-IN')}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </div>

          <!-- Shipping Card -->
          <div style="background-color: #FAF6EF; border-radius: 12px; padding: 30px; margin-bottom: 25px;">
            <h3 style="margin: 0 0 15px 0; font-size: 13px; color: #C89B2D; text-transform: uppercase; letter-spacing: 1.5px;">Shipping Details</h3>
            <p style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600;">${customer.name}</p>
            <p style="margin: 0 0 5px 0; font-size: 14px; color: #5A5548;">${customer.email} | ${customer.phone}</p>
            <p style="margin: 10px 0 0 0; font-size: 14px; line-height: 1.6; color: #5A5548;">
              ${customer.address}<br>
              ${customer.city} - ${customer.pincode}
            </p>
          </div>

          <!-- Delivery Timeline Card -->
          <div style="border: 1px solid #EAE4D9; border-radius: 12px; padding: 30px; margin-bottom: 25px; text-align: center;">
            <h3 style="margin: 0 0 25px 0; font-size: 13px; color: #C89B2D; text-transform: uppercase; letter-spacing: 1.5px;">Delivery Timeline</h3>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="33%" style="text-align: center; vertical-align: top;">
                  <span style="font-size: 24px;">🎨</span>
                  <p style="margin: 10px 0 4px 0; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Handmade Prep</p>
                  <p style="margin: 0; font-size: 13px; color: #8A8070;">12-15 Days</p>
                </td>
                <td width="33%" style="text-align: center; vertical-align: top; border-left: 1px solid #EAE4D9; border-right: 1px solid #EAE4D9;">
                  <span style="font-size: 24px;">📦</span>
                  <p style="margin: 10px 0 4px 0; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Shipping</p>
                  <p style="margin: 0; font-size: 13px; color: #8A8070;">3-5 Days</p>
                </td>
                <td width="33%" style="text-align: center; vertical-align: top;">
                  <span style="font-size: 24px;">🚚</span>
                  <p style="margin: 10px 0 4px 0; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Est. Delivery</p>
                  <p style="margin: 0; font-size: 13px; color: #8A8070;">15-20 Days</p>
                </td>
              </tr>
            </table>
          </div>

          <!-- Cancellation Policy Card -->
          <div style="background-color: #FFFBF0; border: 1px solid #F3E5AB; border-left: 4px solid #C89B2D; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
            <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #C89B2D; font-family: 'Georgia', serif; font-weight: normal;">Important Notice</h3>
            <ul style="margin: 0; padding-left: 18px; color: #7B6E4E; font-size: 13.5px; line-height: 1.6;">
              <li style="margin-bottom: 8px;">Handmade products are made to order exclusively for you.</li>
              <li style="margin-bottom: 8px;">Cancellation is allowed within <strong>3 working days</strong> of placement.</li>
              <li>A full refund will be provided for eligible cancellations.</li>
            </ul>
          </div>

          <!-- Support Section -->
          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #EAE4D9;">
            <p style="margin: 0 0 15px 0; font-size: 14px; color: #5A5548;">Need assistance? We're here to help.</p>
            <p style="margin: 0 0 20px 0; font-size: 13px;">
              <a href="mailto:support@krivastudio.in" style="color: #C89B2D; text-decoration: none; font-weight: 600; margin: 0 10px;">Email Support</a> |
              <a href="#" style="color: #C89B2D; text-decoration: none; font-weight: 600; margin: 0 10px;">WhatsApp</a>
            </p>
            <p style="margin: 0 0 30px 0; font-size: 13px;">
              <a href="https://krivastudio.in" style="color: #8A8070; text-decoration: none; margin: 0 10px;">Website</a> |
              <a href="#" style="color: #8A8070; text-decoration: none; margin: 0 10px;">Instagram</a>
            </p>
            
            <!-- Footer -->
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #5A5548; font-style: italic;">Thank you for supporting handmade Indian art.</p>
            <p style="margin: 0; font-size: 15px; color: #2B2B2B; line-height: 1.6;">
              Warm regards,<br>
              <span style="font-family: 'Georgia', serif; font-size: 18px; color: #C89B2D; display: inline-block; margin-top: 5px;">Team Kriva Studio</span>
            </p>
          </div>

        </div>
      </div>
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
        <p style="margin: 5px 0;"><strong>Refund Status:</strong> ${order.refundStatus || "Initiated"}</p>
        <p style="margin: 5px 0;"><strong>Refund Amount:</strong> ₹${order.totalAmount.toLocaleString('en-IN')}</p>
        <p style="margin: 5px 0;"><strong>Items Cancelled:</strong></p>
        <ul style="margin: 5px 0; padding-left: 20px;">
          ${order.items.map((item: any) => `<li>${item.title} (x${item.quantity})</li>`).join('')}
        </ul>
      </div>

      <div style="background-color: #e8f5e9; padding: 15px; border-left: 4px solid #4caf50; border-radius: 4px; margin: 25px 0;">
        <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #1b5e20;">
          Your refund request has been initiated. It usually takes <strong>5–7 business days</strong> for the funds to reflect in your original payment method once processed.
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
        <p style="margin: 5px 0;"><strong>Cancelled By:</strong> ${order.cancelledBy || "Customer"}</p>
      </div>

      <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #E8DCC8;">
        <h3 style="margin-top: 0; color: #2B2B2B; border-bottom: 1px solid #eee; padding-bottom: 10px;">Refund Status</h3>
        <p style="margin: 5px 0;">The system has marked the refund as <strong>${order.refundStatus || "Initiated"}</strong>.</p>
        <p style="margin: 5px 0;"><strong>Amount to Refund:</strong> ₹${order.totalAmount.toLocaleString('en-IN')}</p>
        <p style="margin: 5px 0; font-size: 12px; color: #666;">Please process the refund in the Razorpay dashboard and update the status in the Admin panel.</p>
      </div>
    </div>
  `;
};

export const getShippingNotificationHtml = (
  customerName: string,
  orderId: string,
  courierName: string,
  trackingNumber: string,
  dispatchDate: string,
  expectedDeliveryDate: string
) => {
  return `
    <div style="font-family: 'Georgia', serif; color: #2B2B2B; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #E8DCC8; border-radius: 12px; background-color: #FAF8F2;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #C9A227; margin: 0;">Kriva Studio</h1>
        <p style="font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin-top: 5px; color: #8A8070;">Order Shipped</p>
      </div>
      
      <p style="font-size: 16px;">Dear <strong>${customerName}</strong>,</p>
      
      <p style="font-size: 16px; line-height: 1.6;">
        Great news! Your order <strong>${orderId}</strong> has been shipped and is on its way to you.
      </p>

      <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #E8DCC8; margin: 25px 0;">
        <h3 style="margin-top: 0; color: #2B2B2B; border-bottom: 1px solid #eee; padding-bottom: 10px;">Shipping Details</h3>
        <p style="margin: 5px 0;"><strong>Courier / Delivery Partner:</strong> ${courierName}</p>
        <p style="margin: 5px 0;"><strong>Tracking Number / Reference:</strong> ${trackingNumber}</p>
        <p style="margin: 5px 0;"><strong>Dispatch Date:</strong> ${dispatchDate}</p>
        <p style="margin: 5px 0;"><strong>Expected Delivery:</strong> ${expectedDeliveryDate || "To be updated by courier"}</p>
      </div>

      <p style="font-size: 16px; line-height: 1.6;">
        You can track your order by visiting the 'My Orders' section on our website.
      </p>

      <p style="font-size: 16px; margin-top: 30px;">
        Warmly,<br>
        <strong>Ruchitha Reddy</strong><br>
        <span style="color: #C9A227;">Kriva Studio</span>
      </p>
    </div>
  `;
};

export const getDeliveryConfirmationHtml = (
  customerName: string,
  orderId: string
) => {
  return `
    <div style="font-family: 'Georgia', serif; color: #2B2B2B; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #E8DCC8; border-radius: 12px; background-color: #FAF8F2;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #C9A227; margin: 0;">Kriva Studio</h1>
        <p style="font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin-top: 5px; color: #8A8070;">Order Delivered</p>
      </div>
      
      <p style="font-size: 16px;">Dear <strong>${customerName}</strong>,</p>
      
      <p style="font-size: 16px; line-height: 1.6;">
        Your order <strong>${orderId}</strong> has been successfully delivered! 
      </p>

      <p style="font-size: 16px; line-height: 1.6;">
        We hope you love your new pieces. Thank you for shopping with Kriva Studio and supporting our craftsmanship.
      </p>

      <p style="font-size: 16px; margin-top: 30px;">
        Warmly,<br>
        <strong>Ruchitha Reddy</strong><br>
        <span style="color: #C9A227;">Kriva Studio</span>
      </p>
    </div>
  `;
};

export const getVerificationEmailHtml = (token: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL;
  if (!baseUrl) {
    console.error("Missing NEXT_PUBLIC_APP_URL or NEXTAUTH_URL");
  }
  const verifyUrl = `${baseUrl}/verify-email?token=${token}`;
  return `
    <div style="font-family: 'Georgia', serif; color: #2B2B2B; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #E8DCC8; border-radius: 12px; background-color: #FAF8F2;">
      <h2 style="color: #2B2B2B; text-align: center;">Welcome to Kriva Studio!</h2>
      <p style="font-size: 16px; text-align: center;">Thank you for creating an account. Please verify your email address to activate your account.</p>
      <div style="text-align: center; margin-top: 25px;">
        <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background-color: #C9A227; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Verify Email</a>
      </div>
      <p style="margin-top: 25px; font-size: 12px; color: #666; text-align: center;">If you did not request this, please ignore this email.</p>
    </div>
  `;
};

export const getPasswordResetEmailHtml = (token: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL;
  if (!baseUrl) {
    console.error("Missing NEXT_PUBLIC_APP_URL or NEXTAUTH_URL");
  }
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;
  return `
    <div style="font-family: 'Georgia', serif; color: #2B2B2B; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #E8DCC8; border-radius: 12px; background-color: #FAF8F2;">
      <h2 style="color: #2B2B2B; text-align: center;">Password Reset Request</h2>
      <p style="font-size: 16px; text-align: center;">We received a request to reset your password. Click the button below to choose a new password.</p>
      <div style="text-align: center; margin-top: 25px;">
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #C9A227; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
      </div>
      <p style="margin-top: 25px; font-size: 12px; color: #666; text-align: center;">If you did not request a password reset, please ignore this email.</p>
    </div>
  `;
};

