import mongoose from 'mongoose';
import uuidv4 from 'uuid/v4';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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

// Strip out password field when sending user object to client
CrawlerSchema.set('toJSON', {
  virtuals: true,
  transform(doc, obj) {
    /* eslint-disable */
    obj.id = obj._id;
    delete obj._id;
    delete obj.__v;
    delete obj.key;
    delete obj.createdAt;
    delete obj.updatedAt;
    /* eslint-enable */
    return obj;
  },
});

// Use plain old function due to "this" usage
// eslint-disable-next-line
CrawlerSchema.pre('save', function(done) {
  // Encrypt password before saving the document
  if (!this.name) this.name = `Crawler-${this.id}`;
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
  generateToken() {
    const payload = {
      id: this.id,
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });
  },
};

export default mongoose.model('Crawler', CrawlerSchema);
