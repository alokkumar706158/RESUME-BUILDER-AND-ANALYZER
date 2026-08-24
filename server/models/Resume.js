import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  originalFile: {
    filename: String,
    path: String,
    size: Number
  },
  originalText: { type: String, required: true },
  jobRole: { type: String, required: true },
  atsScore: { type: Number, required: true },
  analysis: { type: mongoose.Schema.Types.Mixed, default: {} },
  feedback: {
    honestRoast: { type: String, default: "" },
    missingKeywords: [{
      keyword: String,
      meaning: String,
      importance: String, // High, Medium, Low
      whereToAdd: String
    }],
    grammarMistakes: [{
      original: String,
      correction: String,
      explanation: String
    }],
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
  improvedResume: {
    contactInfo: {
      fullName: { type: String, default: "" },
      phone: { type: String, default: "" },
      email: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      github: { type: String, default: "" },
      portfolio: { type: String, default: "" },
      address: { type: String, default: "" },
      profilePhoto: { type: String, default: "" },
      photoEnabled: { type: Boolean, default: false },
      photoZoom: { type: Number, default: 1 },
      photoCrop: { type: mongoose.Schema.Types.Mixed, default: { x: 0, y: 0 } },
      photoRotation: { type: Number, default: 0 },
      photoFrameStyle: { type: String, default: 'passport' },
      photoSize: { type: Number, default: 76 },
      customLinks: [{
        heading: { type: String, default: "" },
        url: { type: String, default: "" }
      }]
    },
    summary: { type: String, default: "" },
    skills: { type: mongoose.Schema.Types.Mixed, default: [] },
    softSkills: { type: [String], default: [] },
    technicalSkills: { type: [String], default: [] },
    toolsAndTech: { type: [String], default: [] },
    experience: [{
      company: { type: String, default: "" },
      role: { type: String, default: "" },
      duration: { type: String, default: "" },
      startDate: { type: String, default: "" },
      endDate: { type: String, default: "" },
      currentWorking: { type: Boolean, default: false },
      location: { type: String, default: "" },
      description: { type: [String], default: [] },
      achievements: { type: String, default: "" }
    }],
    projects: [{
      title: { type: String, default: "" },
      techStack: { type: [String], default: [] },
      description: { type: [String], default: [] },
      link: { type: String, default: "" },
      github: { type: String, default: "" },
      liveDemo: { type: String, default: "" },
      startDate: { type: String, default: "" },
      endDate: { type: String, default: "" },
      duration: { type: String, default: "" },
      role: { type: String, default: "" },
      features: { type: String, default: "" },
      challenges: { type: String, default: "" },
      achievements: { type: String, default: "" }
    }],
    education: [{
      institution: { type: String, default: "" },
      degree: { type: String, default: "" },
      branch: { type: String, default: "" },
      gpa: { type: String, default: "" },
      startYear: { type: String, default: "" },
      endYear: { type: String, default: "" },
      duration: { type: String, default: "" },
      location: { type: String, default: "" },
      relevantCoursework: { type: [String], default: [] },
      description: { type: [String], default: [] }
    }],
    achievements: [{
      title: { type: String, default: "" },
      organization: { type: String, default: "" },
      date: { type: String, default: "" },
      description: { type: String, default: "" }
    }],
    certifications: [{
      name: { type: String, default: "" },
      organization: { type: String, default: "" },
      issueDate: { type: String, default: "" },
      credentialId: { type: String, default: "" },
      credentialUrl: { type: String, default: "" }
    }],
    links: [{
      heading: { type: String, default: "" },
      url: { type: String, default: "" }
    }],
    languages: [{
      name: { type: String, default: "" },
      proficiency: { type: String, default: "Advanced" },
      rating: { type: Number, default: 5 }
    }]
  }
}, { timestamps: true });

const Resume = mongoose.model('Resume', resumeSchema);
export default Resume;
