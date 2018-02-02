import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

/**
 * User Schema
 */

const { Schema } = mongoose;
const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Full name is required'],
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Email address is required'],
    match: [/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/, 'Email address is invalid'], // eslint-disable-line
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
    required: true,
  },
  institution: {
    type: Schema.Types.ObjectId,
    ref: 'Institution',
  },
}, {
  timestamps: true,
  strict: true,
});

// Strip out password field when sending user object to client
UserSchema.set('toJSON', {
  virtuals: true,
  transform(doc, obj) {
    obj.id = obj._id; // eslint-disable-line
    delete obj._id; // eslint-disable-line
    delete obj.__v; // eslint-disable-line
    delete obj.password; // eslint-disable-line
    return obj;
  },
});

// Use plain old function due to "this" usage
// eslint-disable-next-line
UserSchema.pre('save', function(done) {
  // Encrypt password before saving the document
  if (this.isModified('password')) {
    const saltRounds = process.env.SALT_ROUNDS;
    this.hashPassword(this.password, saltRounds, (err, hash) => {
      this.password = hash;
      done();
    });
  } else {
    done();
  }
});

UserSchema.methods = {
  hashPassword(password, saltRounds = process.env.SALT_ROUNDS, cb) {
    return bcrypt.hash(password, saltRounds, cb);
  },
  authenticate(password) {
    return bcrypt.compareSync(password, this.password);
  },
  generateToken() {
    const payload = {
      id: this.id,
      role: this.role,
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });
  },
};

export default mongoose.model('User', UserSchema);
