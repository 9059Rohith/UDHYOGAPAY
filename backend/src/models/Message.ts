// Backend comment: Message
import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  booking: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  senderRole: 'user' | 'worker';
  message: string;
  type: 'text' | 'image' | 'location';
  isRead: boolean;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  booking: {
    type: Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    index: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    required: true
  },
  senderRole: {
    type: String,
    enum: ['user', 'worker'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'location'],
    default: 'text'
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster queries
MessageSchema.index({ booking: 1, createdAt: -1 });

export default mongoose.model<IMessage>('Message', MessageSchema);
