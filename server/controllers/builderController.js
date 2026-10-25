import mongoose from 'mongoose';
import BuilderResume from '../models/BuilderResume.js';

const pickString = (value, maxLength = 300) => {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
};

const normalizeEntries = (value, fields, limit = 20) => {
  if (!Array.isArray(value)) return [];

  return value.slice(0, limit).map((entry) => {
    const source = entry && typeof entry === 'object' ? entry : {};
    return Object.entries(fields).reduce((result, [field, maxLength]) => {
      result[field] = pickString(source[field], maxLength);
      return result;
    }, {});
  });
};

const buildPayload = (body = {}) => {
  const personalInfo = body.personalInfo && typeof body.personalInfo === 'object' ? body.personalInfo : {};
  const skills = body.skills && typeof body.skills === 'object' ? body.skills : {};

  const normalizedPersonalInfo = {
    fullName: pickString(personalInfo.fullName, 200),
    professionalTitle: pickString(personalInfo.professionalTitle, 200),
    email: pickString(personalInfo.email, 320),
    phone: pickString(personalInfo.phone, 80),
    location: pickString(personalInfo.location, 200),
    linkedin: pickString(personalInfo.linkedin, 500),
    github: pickString(personalInfo.github, 500),
    portfolio: pickString(personalInfo.portfolio, 500)
  };

  return {
    title: normalizedPersonalInfo.fullName
      ? `${normalizedPersonalInfo.fullName}'s Resume`
      : 'Untitled Resume',
    personalInfo: normalizedPersonalInfo,
    summary: pickString(body.summary, 5000),
    education: normalizeEntries(body.education, {
      institution: 250,
      degree: 250,
      fieldOfStudy: 250,
      startYear: 40,
      endYear: 40,
      description: 5000
    }),
    experience: normalizeEntries(body.experience, {
      company: 250,
      jobTitle: 250,
      startDate: 80,
      endDate: 80,
      responsibilities: 6000
    }),
    projects: normalizeEntries(body.projects, {
      name: 250,
      description: 5000,
      technologies: 500,
      url: 500
    }),
    skills: {
      programmingLanguages: pickString(skills.programmingLanguages, 1000),
      frameworks: pickString(skills.frameworks, 1000),
      databases: pickString(skills.databases, 1000),
      tools: pickString(skills.tools, 1000)
    },
    certifications: normalizeEntries(body.certifications, {
      name: 250,
      organization: 250,
      date: 80
    }),
    achievements: pickString(body.achievements, 5000)
  };
};

const assertValidId = (id) => mongoose.isValidObjectId(id);

export const createBuilderResume = async (req, res) => {
  try {
    const resume = await BuilderResume.create({
      userId: req.user._id,
      ...buildPayload(req.body)
    });

    return res.status(201).json(resume);
  } catch (error) {
    console.error('Create builder resume error:', error);
    return res.status(500).json({ message: 'Failed to create the resume draft.' });
  }
};

export const updateBuilderResume = async (req, res) => {
  try {
    if (!assertValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid resume ID.' });
    }

    const resume = await BuilderResume.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({ message: 'Resume draft not found.' });
    }

    Object.assign(resume, buildPayload(req.body));
    await resume.save();

    return res.json(resume);
  } catch (error) {
    console.error('Update builder resume error:', error);
    return res.status(500).json({ message: 'Failed to save the resume draft.' });
  }
};

export const getBuilderResume = async (req, res) => {
  try {
    if (!assertValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid resume ID.' });
    }

    const resume = await BuilderResume.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({ message: 'Resume draft not found.' });
    }

    return res.json(resume);
  } catch (error) {
    console.error('Get builder resume error:', error);
    return res.status(500).json({ message: 'Failed to load the resume draft.' });
  }
};

export const getLatestBuilderResume = async (req, res) => {
  try {
    const resume = await BuilderResume.findOne({ userId: req.user._id })
      .sort({ updatedAt: -1 });

    if (!resume) {
      return res.status(404).json({ message: 'No saved resume drafts found.' });
    }

    return res.json(resume);
  } catch (error) {
    console.error('Get latest builder resume error:', error);
    return res.status(500).json({ message: 'Failed to load the latest resume draft.' });
  }
};
