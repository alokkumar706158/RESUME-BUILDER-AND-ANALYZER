import mongoose from 'mongoose';

const loginLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  email: { type: String, required: true, lowercase: true, trim: true },
  provider: { type: String, enum: ['local', 'google'], default: 'local' },
  ip: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  loginTime: { type: Date, default: Date.now },
  status: { type: String, enum: ['success', 'failed'], default: 'success' },
  failureReason: { type: String, default: '' }
}, { timestamps: true });

loginLogSchema.index({ userId: 1, loginTime: -1 });
loginLogSchema.index({ email: 1, loginTime: -1 });

const LoginLog = mongoose.model('LoginLog', loginLogSchema);
export default LoginLog;
