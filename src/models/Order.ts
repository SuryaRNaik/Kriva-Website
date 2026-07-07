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
  courierName?: string;
  trackingNumber?: string;
  dispatchDate?: Date;
  expectedDeliveryDate?: Date;
  shippingNotes?: string;
  deliveryMethod?: string;
  paymentDate: Date;
  cancellationDeadline: Date;
  orderStatus: string;
  refundStatus: string;
  refundId?: string;
  refundDate?: Date;
  cancellationReason?: string;
  cancelledAt?: Date;
  cancelledBy?: string;
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
      enum: ['Order Received', 'Crafting in Progress', 'Quality Check', 'Packed', 'Shipped', 'Delivered'],
      default: 'Order Received',
    },
    courierName: { type: String },
    trackingNumber: { type: String },
    dispatchDate: { type: Date },
    expectedDeliveryDate: { type: Date },
    shippingNotes: { type: String },
    deliveryMethod: { type: String, enum: ['Courier', 'Local Delivery'] },
    paymentDate: { type: Date },
    cancellationDeadline: { type: Date },
    orderStatus: {
      type: String,
      enum: ['Active', 'Cancelled'],
      default: 'Active',
    },
    refundStatus: {
      type: String,
      enum: ['None', 'Pending', 'Initiated', 'Completed', 'Failed'],
      default: 'None',
    },
    refundId: { type: String },
    refundDate: { type: Date },
    cancellationReason: { type: String },
    cancelledAt: { type: Date },
    cancelledBy: { 
      type: String, 
      enum: ['Customer', 'Admin'] 
    },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
