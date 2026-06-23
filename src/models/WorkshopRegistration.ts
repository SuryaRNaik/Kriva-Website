import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkshopRegistration extends Document {
  orderId: string;
  customerName: string;
  email: string;
  phone: string;
  workshopTitle: string;
  date: string;
  time: string;
  location: string;
  amountPaid: number;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  createdAt: Date;
}

const WorkshopRegistrationSchema: Schema = new Schema(
  {
    orderId: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    workshopTitle: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    amountPaid: { type: Number, required: true },
    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.WorkshopRegistration || mongoose.model<IWorkshopRegistration>('WorkshopRegistration', WorkshopRegistrationSchema);
