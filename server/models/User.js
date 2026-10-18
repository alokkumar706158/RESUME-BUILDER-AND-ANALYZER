import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  // Password is optional since OAuth (Google) users have no password
  password: { type: String, default: "" },
  // Google OAuth provider id (sub) — unique per Google account
  googleId: { type: String, default: "", index: true, sparse: true },
  provider: { type: String, enum: ['local', 'google'], default: 'local' },
  emailVerified: { type: Boolean, default: false },
  avatar: { type: String, default: "" },
  college: { type: String, default: "" },
  branch: { type: String, default: "" },
  graduationYear: { type: Number, default: null },
  linkedin: { type: String, default: "" },
  github: { type: String, default: "" },
  refreshToken: { type: String, default: "" },
  lastLogin: { type: Date, default: Date.now },
  loginCount: { type: Number, default: 0 },
  lastLoginIp: { type: String, default: "" }
}, { timestamps: true });

// Pre-save middleware to hash password (only when a new/changed password is present)
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password helper (safe for Google-only accounts without a password)
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
