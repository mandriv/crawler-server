import mongoose from 'mongoose';
import uuidv4 from 'uuid/v4';

/**
 * Institution Schema
 */

const { Schema } = mongoose;
const CrawlerSchema = new Schema({
  name: {
    type: String,
  },
  owners: [{
    type: {
      type: String,
      enum: ['User', 'Institution'],
    },
    id: {
      type: Schema.Types.ObjectId,
      refPath: 'ownership.ownershipType',
    },
  }],
  key: {
    type: String,
    required: [true, 'Key is required'],
  },
}, {
  timestamps: true,
  strict: true,
});

CrawlerSchema.statics = {
  generateKey() {
    return uuidv4();
  },
};

export default mongoose.model('Crawler', CrawlerSchema);
