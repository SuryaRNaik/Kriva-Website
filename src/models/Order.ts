import mongoose, { Schema, Document } from 'mongoose';
import { ICustomer } from './Customer';

export interface IOrder extends Document {
  customer: mongoose.Types.ObjectId | ICustomer;
  orderId: string;
  items: {
    id: string;
    title: string;
    price: string;
    quantity: number;
    image: string;
  }[];
  totalAmount: number;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  trackingStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    orderId: { type: String, required: true, unique: true },
    items: [
      {
        id: { type: String, required: true },
        title: { type: String, required: true },
        price: { type: String, required: true },
        quantity: { type: Number, required: true },
        image: { type: String, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String, required: true, unique: true },
    trackingStatus: {
      type: String,
      enum: ['Order Received', 'Crafting in Progress', 'Quality Check', 'Ready for Dispatch', 'Shipped', 'Delivered'],
      default: 'Order Received',
    },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
