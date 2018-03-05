import mongoose from 'mongoose';
import uuidv4 from 'uuid/v4';
import bcrypt from 'bcrypt';

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

// Use plain old function due to "this" usage
// eslint-disable-next-line
CrawlerSchema.pre('save', function(done) {
  // Encrypt password before saving the document
  if (this.isModified('key')) {
    const saltRounds = parseInt(process.env.SALT_ROUNDS, 10);
    this.hashKey(this.key, saltRounds, (err, hash) => {
      if (err) {
        throw new Error(err);
      }
      this.key = hash;
      done();
    });
  } else {
    done();
  }
});

CrawlerSchema.statics = {
  hashKey(key, saltRounds = process.env.SALT_ROUNDS, cb) {
    return bcrypt.hash(key, saltRounds, cb);
  },
  authenticate(key) {
    return bcrypt.compareSync(key, this.password);
  },
  generateKey() {
    return uuidv4();
  },
};

export default mongoose.model('Crawler', CrawlerSchema);