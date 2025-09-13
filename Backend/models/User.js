const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    minlength: [3, 'Name must be at least 3 characters'],
    maxlength: [60, 'Name cannot exceed 60 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: 'Please provide a valid email'
    }
  },
  password: {
    type: String,
    required: [true, 'Please provide a password']
  },
  address: {
    type: String,
    required: [true, 'Please provide an address'],
    maxlength: [400, 'Address cannot exceed 400 characters']
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'store_owner'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Validate password before hashing
UserSchema.pre('validate', function(next) {
  if (this.isModified('password')) {
    const password = this.password;
    if (password.length < 8) {
      this.invalidate('password', 'Password must be at least 8 characters');
    } else if (password.length > 16) {
      this.invalidate('password', 'Password cannot exceed 16 characters');
    } else if (!/[A-Z]/.test(password)) {
      this.invalidate('password', 'Password must contain at least one uppercase letter');
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      this.invalidate('password', 'Password must contain at least one special character');
    }
  }
  next();
});

// Hash password after validation but before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);