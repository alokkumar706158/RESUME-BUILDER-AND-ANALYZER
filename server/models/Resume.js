import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'fs.files' },
  filename: { type: String },
  originalFilename: { type: String },
  title: { type: String },
  originalFile: {
    filename: String,
    path: String,
    size: Number,
    fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'fs.files' }
  },
  originalText: { type: String, required: true },
  extractedText: { type: String },
  jobRole: { type: String, required: true },
  targetRole: { type: String },
  atsScore: { type: Number, required: true, default: 70 },
  analysis: { type: mongoose.Schema.Types.Mixed, default: {} },
  feedback: {
    honestRoast: { type: String, default: "" },
    missingKeywords: { type: mongoose.Schema.Types.Mixed, default: [] },
    grammarMistakes: { type: mongoose.Schema.Types.Mixed, default: [] },
    resumeStructure: { type: String, default: "" },
    skillsFeedback: { type: String, default: "" },
    projectFeedback: { type: String, default: "" },
    experienceFeedback: { type: String, default: "" },
    educationFeedback: { type: String, default: "" },
    sectionSuggestions: {
      summary: { type: String, default: "" },
      skills: { type: String, default: "" },
      experience: { type: String, default: "" },
      projects: { type: String, default: "" },
      education: { type: String, default: "" }
    },
    finalRecommendation: { type: String, default: "" }
  },
  selectedTemplate: { type: String, default: 'classic' },
  improvedResume: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

resumeSchema.pre('save', function (next) {
  if (this.title && !this.filename) {
    this.filename = `${this.title.replace(/[^a-zA-Z0-9_\- ]/g, '')}.pdf`;
  }
  if (this.filename && !this.title) {
    this.title = this.filename.replace(/\.pdf$/i, '');
  }
  if (this.originalFile?.filename && !this.filename) {
    this.filename = this.originalFile.filename;
  }
  if (this.originalFile?.filename && !this.originalFilename) {
    this.originalFilename = this.originalFile.filename;
  }
  if (!this.title && this.originalFile?.filename) {
    this.title = this.originalFile.filename.replace(/\.pdf$/i, '');
  }
  if (this.filename && !this.originalFile?.filename) {
    if (!this.originalFile) this.originalFile = {};
    this.originalFile.filename = this.filename;
  }
  if (this.originalFile?.fileId && !this.fileId) {
    this.fileId = this.originalFile.fileId;
  } else if (this.fileId && !this.originalFile?.fileId) {
    if (!this.originalFile) this.originalFile = {};
    this.originalFile.fileId = this.fileId;
  }
  if (this.originalText && !this.extractedText) {
    this.extractedText = this.originalText;
  } else if (this.extractedText && !this.originalText) {
    this.originalText = this.extractedText;
  }
  if (this.jobRole && !this.targetRole) {
    this.targetRole = this.jobRole;
  } else if (this.targetRole && !this.jobRole) {
    this.jobRole = this.targetRole;
  }
  next();
});

const Resume = mongoose.model('Resume', resumeSchema);
export default Resume;
