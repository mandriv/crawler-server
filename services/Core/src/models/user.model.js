import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import beautifyUnique from 'mongoose-beautiful-unique-validation';

/**
 * User Schema
 */

const { Schema } = mongoose;
const UserSchema = new Schema({
  name: {
    type: String,
    required: 'Full name is required',
  },
  email: {
    type: String,
    unique: '{VALUE} email address already in use',
    required: 'Email address is required',
    match: [/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/, 'Email address is invalid'], // eslint-disable-line
  },
  password: {
    type: String,
    required: 'Password is required',
  },
  roles: {
    type: Array,
    enum: ['user', 'admin'],
    default: ['user'],
    required: true,
  },
  institution: {
    type: Schema.Types.ObjectId,
    ref: 'Institution',
  },
  verified: {
    type: Boolean,
    default: false,
    required: true,
  },
}, {
  timestamps: true,
  strict: true,
});

// Add validation plugin
UserSchema.plugin(beautifyUnique);

// Strip out password field when sending user object to client
UserSchema.set('toJSON', {
  virtuals: true,
  transform(doc, obj) {
    /* eslint-disable */
    obj.id = obj._id;
    delete obj._id;
    delete obj.__v;
    delete obj.password;
    delete obj.createdAt;
    delete obj.updatedAt;
    /* eslint-enable */
    return obj;
  },
});

// Use plain old function due to "this" usage
// eslint-disable-next-line
UserSchema.pre('save', function(done) {
  // Encrypt password before saving the document
  if (this.isModified('password')) {
    const saltRounds = parseInt(process.env.SALT_ROUNDS, 10);
    this.hashPassword(this.password, saltRounds, (err, hash) => {
      if (err) {
        throw new Error(err);
      }
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
      roles: this.roles,
      institution: this.institution,
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });
  },
};

export default mongoose.model('User', UserSchema);
