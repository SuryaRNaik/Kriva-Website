import { z } from "zod";
import sanitizeHtml from "sanitize-html";
import mongoose from "mongoose";

// --- Sanitization Helpers ---

/**
 * Strips ALL HTML tags. Use for names, emails, phones, simple text fields.
 */
export const sanitizeStrict = (text: string | null | undefined): string => {
  if (!text) return "";
  return sanitizeHtml(text, {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();
};

/**
 * Allows basic formatting tags (b, i, em, strong, p, br, ul, ol, li).
 * Use for descriptions, admin notes, contact messages where formatting might be ok.
 */
export const sanitizeRichText = (text: string | null | undefined): string => {
  if (!text) return "";
  return sanitizeHtml(text, {
    allowedTags: ["b", "i", "em", "strong", "p", "br", "ul", "ol", "li"],
    allowedAttributes: {},
  }).trim();
};


// --- Zod Schemas ---

// Common Reusable Fields
export const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: "Invalid ObjectId",
});

export const emailSchema = z.string().email("Invalid email address").max(100);

export const passwordSchema = z.string().min(6, "Password must be at least 6 characters").max(100);

export const phoneSchema = z.string().regex(/^\+?[0-9\s\-()]{7,20}$/, "Invalid phone format");

export const stringMaxSchema = (max: number) => z.string().max(max, `Must be at most ${max} characters`);

export const positiveNumberSchema = z.number().positive();
export const nonNegativeNumberSchema = z.number().min(0);

// Specific Request Schemas
export const signupSchema = z.object({
  name: stringMaxSchema(100),
  email: emailSchema,
  password: passwordSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10), // Assuming tokens are adequately long
  password: passwordSchema,
});

export const contactSchema = z.object({
  name: stringMaxSchema(100),
  email: emailSchema,
  subject: stringMaxSchema(200),
  message: stringMaxSchema(5000), // Very large limit just in case
});

export const profileUpdateSchema = z.object({
  name: stringMaxSchema(100).optional(),
  phone: phoneSchema.optional().or(z.literal("")).or(z.literal(undefined)),
  address: stringMaxSchema(500).optional(),
  city: stringMaxSchema(100).optional(),
  pincode: stringMaxSchema(20).optional(),
});

export const createOrderSchema = z.object({
  amount: positiveNumberSchema,
  currency: z.literal("INR"),
  receipt: stringMaxSchema(100),
  notes: z.object({
    customer_email: emailSchema.optional(),
  }).passthrough().optional(), // allow other notes but enforce customer_email format if present
});

export const cancelOrderSchema = z.object({
  orderId: stringMaxSchema(100),
  cancellationReason: stringMaxSchema(1000),
});

export const fetchOrderSchema = z.object({
  orderId: stringMaxSchema(100),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: stringMaxSchema(100),
  razorpay_payment_id: stringMaxSchema(100),
  razorpay_signature: stringMaxSchema(200),
  totalAmount: positiveNumberSchema,
  orderType: z.enum(["shop", "workshop"]),
  customerDetails: z.object({
    name: stringMaxSchema(100),
    email: emailSchema,
    phone: phoneSchema,
    address: stringMaxSchema(500).optional(),
    city: stringMaxSchema(100).optional(),
    pincode: stringMaxSchema(20).optional(),
  }),
  items: z.array(z.object({
    id: stringMaxSchema(100),
    quantity: positiveNumberSchema,
  })).optional(),
  workshopDetails: z.object({
    title: stringMaxSchema(200),
    date: stringMaxSchema(100),
    time: stringMaxSchema(50),
    location: stringMaxSchema(200),
  }).optional(),
});

export const productSchema = z.object({
  id: stringMaxSchema(100).optional(),
  name: stringMaxSchema(200),
  sku: stringMaxSchema(100).optional(),
  price: nonNegativeNumberSchema,
  originalPrice: nonNegativeNumberSchema.optional(),
  discount: nonNegativeNumberSchema.optional(),
  stock: nonNegativeNumberSchema,
  lowStockLimit: nonNegativeNumberSchema.optional(),
  images: z.array(z.string()).optional(),
  description: stringMaxSchema(10000).optional(),
  shortDescription: stringMaxSchema(2000).optional(),
  category: stringMaxSchema(100),
  subCategory: stringMaxSchema(100).optional(),
  brand: stringMaxSchema(100).optional(),
  sizes: z.array(stringMaxSchema(50)).optional(),
  colors: z.array(stringMaxSchema(50)).optional(),
  tags: z.array(stringMaxSchema(100)).optional(),
  material: stringMaxSchema(100).optional(),
  occasion: stringMaxSchema(100).optional(),
  careInstructions: stringMaxSchema(1000).optional(),
  status: z.enum(['Active', 'Inactive', 'Out of Stock']).optional(),
  isFeatured: z.boolean().optional(),
  isBestseller: z.boolean().optional(),
  isNewArrival: z.boolean().optional(),
  isTrending: z.boolean().optional(),
  isRecommended: z.boolean().optional(),
  displayOrder: nonNegativeNumberSchema.optional(),
  metaTitle: stringMaxSchema(200).optional(),
  metaDescription: stringMaxSchema(1000).optional(),
  metaKeywords: stringMaxSchema(500).optional(),
  slug: stringMaxSchema(200).optional(),
  isTrashed: z.boolean().optional(),
}).passthrough(); // allows any unexpected fields for compatibility

export const bulkProductSchema = z.object({
  action: z.enum(["publish", "archive", "trash", "restore", "bestseller", "featured", "delete"]),
  productIds: z.array(objectIdSchema).min(1, "No products selected"),
});

export const updateOrderSchema = z.object({
  orderId: stringMaxSchema(100),
  trackingStatus: z.enum(["Order Received", "Crafting / Preparing", "Quality Check", "Packed", "Shipped", "Delivered", "Cancelled"]),
  courierName: stringMaxSchema(100).optional().nullable(),
  trackingNumber: stringMaxSchema(100).optional().nullable(),
  dispatchDate: z.string().optional().nullable(),
  expectedDeliveryDate: z.string().optional().nullable(),
  shippingNotes: stringMaxSchema(2000).optional().nullable(),
  deliveryMethod: z.enum(["standard", "express", "local_pickup"]).optional().nullable(),
  refundStatus: z.enum(["None", "Initiated", "Processed", "Failed"]).optional(),
  shippingMode: z.enum(["Road", "Air", "Surface", "Other"]).optional().nullable(),
  dispatchTime: stringMaxSchema(100).optional().nullable(),
  courierContact: stringMaxSchema(100).optional().nullable(),
  pickupLocation: stringMaxSchema(200).optional().nullable(),
  adminNotes: stringMaxSchema(5000).optional().nullable(),
  deliveredBy: stringMaxSchema(100).optional().nullable(),
  receivedBy: stringMaxSchema(100).optional().nullable(),
  deliveryRemarks: stringMaxSchema(2000).optional().nullable(),
});

export const inventorySingleSchema = z.object({
  _id: objectIdSchema.optional(),
  id: stringMaxSchema(100).optional(),
  stock: nonNegativeNumberSchema,
}).refine(data => data._id || data.id, {
  message: "Either _id or id must be provided",
});

export const inventoryBulkSchema = z.array(z.object({
  _id: objectIdSchema,
  stock: nonNegativeNumberSchema,
})).min(1, "No items provided for update");

export const inventoryUpdateSchema = z.union([
  inventorySingleSchema,
  inventoryBulkSchema
]);

export const settingsSchema = z.object({
  storeName: stringMaxSchema(100).optional(),
  storeEmail: emailSchema.optional(),
  storePhone: phoneSchema.optional(),
  storeAddress: stringMaxSchema(500).optional(),
  cancellationWindowHours: nonNegativeNumberSchema.optional(),
  defaultProductionDays: nonNegativeNumberSchema.optional(),
  defaultDeliveryDays: nonNegativeNumberSchema.optional(),
  lowStockThreshold: nonNegativeNumberSchema.optional(),
  smtpHost: stringMaxSchema(200).optional(),
  smtpPort: nonNegativeNumberSchema.optional(),
  smtpUser: stringMaxSchema(200).optional(),
  smtpPass: stringMaxSchema(200).optional(),
  smtpSenderName: stringMaxSchema(100).optional(),
});
