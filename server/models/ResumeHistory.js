import mongoose from 'mongoose';

const resumeHistorySchema = new mongoose.Schema({
  resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true },
  versionNumber: { type: Number, required: true },
  improvedResume: { type: mongoose.Schema.Types.Mixed, default: {} },
  atsScore: { type: Number, required: true }
}, { timestamps: true });

const ResumeHistory = mongoose.model('ResumeHistory', resumeHistorySchema);
export default ResumeHistory;
