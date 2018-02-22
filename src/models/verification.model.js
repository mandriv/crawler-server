import mongoose from 'mongoose';
import uuidv4 from 'uuid/v4';

/**
 * Verification Schema
 * Used for verification of email address
 */

const { Schema } = mongoose;
const VerificationSchema = new Schema({
  token: {
    type: String,
    required: [true, 'Token is required'],
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
  strict: true,
});

VerificationSchema.statics = {
  generateToken() {
    return uuidv4();
  },
};

export default mongoose.model('Verification', VerificationSchema);
