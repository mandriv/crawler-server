import mongoose from 'mongoose';

/**
 * Institution Schema
 */

const { Schema } = mongoose;
const InstitutionSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Institution name is required'],
  },
  managers: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
  strict: true,
});

export default mongoose.model('Institution', InstitutionSchema);
