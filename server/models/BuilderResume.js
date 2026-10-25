import mongoose from 'mongoose';

const educationSchema = new mongoose.Schema({
  institution: { type: String, default: '', trim: true },
  degree: { type: String, default: '', trim: true },
  fieldOfStudy: { type: String, default: '', trim: true },
  startYear: { type: String, default: '', trim: true },
  endYear: { type: String, default: '', trim: true },
  description: { type: String, default: '', trim: true }
});

const experienceSchema = new mongoose.Schema({
  company: { type: String, default: '', trim: true },
  jobTitle: { type: String, default: '', trim: true },
  startDate: { type: String, default: '', trim: true },
  endDate: { type: String, default: '', trim: true },
  responsibilities: { type: String, default: '', trim: true }
});

const projectSchema = new mongoose.Schema({
  name: { type: String, default: '', trim: true },
  description: { type: String, default: '', trim: true },
  technologies: { type: String, default: '', trim: true },
  url: { type: String, default: '', trim: true }
});

const certificationSchema = new mongoose.Schema({
  name: { type: String, default: '', trim: true },
  organization: { type: String, default: '', trim: true },
  date: { type: String, default: '', trim: true }
});

const builderResumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: { type: String, default: 'Untitled Resume', trim: true },
  personalInfo: {
    fullName: { type: String, default: '', trim: true },
    professionalTitle: { type: String, default: '', trim: true },
    email: { type: String, default: '', trim: true, lowercase: true },
    phone: { type: String, default: '', trim: true },
    location: { type: String, default: '', trim: true },
    linkedin: { type: String, default: '', trim: true },
    github: { type: String, default: '', trim: true },
    portfolio: { type: String, default: '', trim: true }
  },
  summary: { type: String, default: '', trim: true },
  education: { type: [educationSchema], default: [] },
  experience: { type: [experienceSchema], default: [] },
  projects: { type: [projectSchema], default: [] },
  skills: {
    programmingLanguages: { type: String, default: '', trim: true },
    frameworks: { type: String, default: '', trim: true },
    databases: { type: String, default: '', trim: true },
    tools: { type: String, default: '', trim: true }
  },
  certifications: { type: [certificationSchema], default: [] },
  achievements: { type: String, default: '', trim: true }
}, { timestamps: true });

builderResumeSchema.index({ userId: 1, updatedAt: -1 });

const BuilderResume = mongoose.model('BuilderResume', builderResumeSchema);

export default BuilderResume;
