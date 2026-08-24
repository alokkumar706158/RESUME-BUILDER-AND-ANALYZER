import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Sparkles, 
  Download, 
  Flame, 
  FileText, 
  User, 
  BookOpen, 
  Briefcase, 
  FolderKanban, 
  GraduationCap, 
  Award, 
  Trophy, 
  FileCheck, 
  Plus, 
  Trash2, 
  Eye, 
  ChevronRight, 
  ChevronLeft,
  Save,
  LayoutTemplate,
  Zap,
  CheckCircle2,
  Link as LinkIcon,
  Camera,
  Image as ImageIcon,
  Crop,
  UploadCloud,
  AlertCircle,
  GripVertical,
  Maximize2,
  Sliders
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';
import ClassicATSTemplate from '../components/templates/ClassicATSTemplate';
import ModernATSTemplate from '../components/templates/ModernATSTemplate';
import RecommendedATSTemplate from '../components/templates/RecommendedATSTemplate';
import PhotoEditorModal from '../components/PhotoEditorModal';
import ImportResumeModal from '../components/ImportResumeModal';
import ImportCurationModal from '../components/ImportCurationModal';

const TARGET_JOB_ROLES = [
  'Java Developer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'React Developer',
  'Node.js Developer',
  'Python Developer',
  'Data Analyst',
  'AI Engineer',
  'DevOps Engineer',
  'Cloud Engineer',
  'Software Engineer',
  'Other'
];

const PRESET_LINK_PLATFORMS = [
  'GitHub', 'LinkedIn', 'Portfolio', 'LeetCode', 'CodeChef', 'HackerRank', 'Website', 'Medium', 'Other'
];

const ROLE_SKILL_RECOMMENDATIONS = {
  'Java Developer': ['Spring Boot', 'REST API', 'Hibernate', 'Microservices', 'Docker', 'JUnit', 'Git', 'AWS'],
  'Frontend Developer': ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Redux Toolkit', 'JavaScript', 'HTML5/CSS3', 'Jest'],
  'Backend Developer': ['Node.js', 'Express.js', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'REST API', 'GraphQL'],
  'Full Stack Developer': ['React', 'Node.js', 'Spring Boot', 'MongoDB', 'PostgreSQL', 'Docker', 'AWS', 'Tailwind CSS'],
  'React Developer': ['React 18', 'Redux', 'TypeScript', 'Tailwind CSS', 'Next.js', 'React Query', 'Vite', 'Jest'],
  'Node.js Developer': ['Node.js', 'Express', 'NestJS', 'MongoDB', 'Redis', 'TypeScript', 'Docker', 'Microservices'],
  'Python Developer': ['Python 3', 'Django', 'FastAPI', 'Flask', 'PostgreSQL', 'Docker', 'Pandas', 'Celery'],
  'Data Analyst': ['Python', 'SQL', 'Tableau', 'Power BI', 'Pandas', 'NumPy', 'Excel', 'Statistics'],
  'AI Engineer': ['Python', 'PyTorch', 'TensorFlow', 'LangChain', 'OpenAI API', 'Hugging Face', 'Scikit-Learn', 'Vector DBs'],
  'DevOps Engineer': ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD', 'Jenkins', 'Linux', 'Ansible'],
  'Cloud Engineer': ['AWS', 'Azure', 'Terraform', 'Docker', 'Kubernetes', 'CloudFormation', 'Python', 'Networking'],
  'Software Engineer': ['Data Structures', 'Algorithms', 'Java/Python', 'System Design', 'Git', 'SQL', 'REST API', 'Docker']
};

const ROLE_CERT_RECOMMENDATIONS = {
  'Java Developer': [
    { name: 'Oracle Certified Professional: Java SE 17 Developer', organization: 'Oracle' },
    { name: 'Spring Certified Professional', organization: 'VMware' }
  ],
  'Frontend Developer': [
    { name: 'Meta Frontend Developer Professional Certificate', organization: 'Coursera' },
    { name: 'AWS Certified Cloud Practitioner', organization: 'AWS' }
  ],
  'Backend Developer': [
    { name: 'Node.js Application Developer (JSNAD)', organization: 'OpenJS Foundation' },
    { name: 'AWS Certified Developer - Associate', organization: 'AWS' }
  ],
  'Full Stack Developer': [
    { name: 'AWS Certified Solutions Architect - Associate', organization: 'AWS' },
    { name: 'MongoDB Certified Developer', organization: 'MongoDB' }
  ],
  'Software Engineer': [
    { name: 'AWS Certified Cloud Practitioner', organization: 'AWS' },
    { name: 'Meta Backend Developer Professional Certificate', organization: 'Coursera' }
  ]
};

const ResumeBuilder = ({ resumeIdProp, isEmbedded = false }) => {
  const { id: paramId } = useParams();
  const id = resumeIdProp || paramId;
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMobileModal, setPreviewMobileModal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);

  // Synchronize active step with URL search parameter & browser history stack
  const stepParam = parseInt(searchParams.get('step'), 10);
  const initialStep = !isNaN(stepParam) && stepParam >= 1 && stepParam <= 10 ? stepParam : 1;
  const [internalStep, setInternalStep] = useState(initialStep);

  // Sync internalStep when URL parameter changes (e.g. browser back/forward buttons)
  useEffect(() => {
    const s = parseInt(searchParams.get('step'), 10);
    if (!isNaN(s) && s >= 1 && s <= 10) {
      setInternalStep(s);
    }
  }, [searchParams]);

  const activeStep = internalStep;

  const setActiveStep = (stepOrFn) => {
    setInternalStep(prev => {
      const nextStep = typeof stepOrFn === 'function' ? stepOrFn(prev) : stepOrFn;
      const clampedStep = Math.max(1, Math.min(10, nextStep));
      
      if (!isEmbedded) {
        const newParams = new URLSearchParams(window.location.search);
        newParams.set('step', clampedStep.toString());
        setSearchParams(newParams, { replace: false });
      }
      return clampedStep;
    });
  };

  // Layout Resizer States & Refs
  const containerRef = React.useRef(null);
  const [leftWidth, setLeftWidth] = useState(() => {
    try {
      const saved = localStorage.getItem('builder_left_width');
      return saved ? parseInt(saved, 10) : 250;
    } catch {
      return 250;
    }
  });
  const [rightWidth, setRightWidth] = useState(() => {
    try {
      const saved = localStorage.getItem('builder_right_width');
      return saved ? parseInt(saved, 10) : 580;
    } catch {
      return 580;
    }
  });
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const containerWidth = rect.width;

      if (isResizingLeft) {
        const clientX = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
        const newLeft = clientX - rect.left;
        const minLeft = 160;
        const maxLeft = Math.min(420, containerWidth * 0.35);
        const clampedLeft = Math.max(minLeft, Math.min(maxLeft, Math.round(newLeft)));
        setLeftWidth(clampedLeft);
        try { localStorage.setItem('builder_left_width', clampedLeft.toString()); } catch {}
      } else if (isResizingRight) {
        const clientX = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
        const newRight = rect.right - clientX;
        const minRight = 280;
        const maxRight = Math.min(1000, containerWidth * 0.75);
        const clampedRight = Math.max(minRight, Math.min(maxRight, Math.round(newRight)));
        setRightWidth(clampedRight);
        try { localStorage.setItem('builder_right_width', clampedRight.toString()); } catch {}
      }
    };

    const handleMouseUp = () => {
      setIsResizingLeft(false);
      setIsResizingRight(false);
    };

    if (isResizingLeft || isResizingRight) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isResizingLeft, isResizingRight]);

  // Automatically fit live preview canvas to panel width on screen resize or panel drag
  useEffect(() => {
    if (isDesktop && rightWidth) {
      const autoScale = Math.min(100, Math.max(60, Math.floor(((rightWidth - 28) / 800) * 100)));
      setZoomLevel(autoScale);
    }
  }, [rightWidth, isDesktop]);

  const handleResetLeft = () => {
    setLeftWidth(250);
    try { localStorage.setItem('builder_left_width', '250'); } catch {}
    toast.success('Left step panel width reset');
  };

  const handleResetRight = () => {
    setRightWidth(460);
    try { localStorage.setItem('builder_right_width', '460'); } catch {}
    toast.success('Preview panel width reset');
  };

  const [resumeId, setResumeId] = useState(id || null);
  const [jobRole, setJobRole] = useState('Java Developer');
  const [selectedTemplate, setSelectedTemplate] = useState('classic');

  // Score comparison tracking
  const [previousScore, setPreviousScore] = useState(82);
  const [atsScore, setAtsScore] = useState(88);

  // Import Modal States
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [curationModalOpen, setCurationModalOpen] = useState(false);
  const [importedCandidateData, setImportedCandidateData] = useState(null);

  const saveToLocalStorage = (dataToSave, targetId = null) => {
    try {
      const storageKey = `resumeroast_builder_${targetId || resumeId || id || 'draft'}`;
      localStorage.setItem(storageKey, JSON.stringify(dataToSave));
    } catch (e) {
      console.error('Failed to save to local storage:', e);
    }
  };

  const handleImportSuccess = (importedData) => {
    if (!importedData) return;
    const imp = importedData.improvedResume || importedData || {};

    const newContact = {
      fullName: imp.contactInfo?.fullName || imp.fullName || imp.name || '',
      email: imp.contactInfo?.email || imp.email || '',
      phone: imp.contactInfo?.phone || imp.phone || '',
      linkedin: imp.contactInfo?.linkedin || imp.linkedin || '',
      github: imp.contactInfo?.github || imp.github || '',
      portfolio: imp.contactInfo?.portfolio || imp.portfolio || '',
      address: imp.contactInfo?.address || imp.address || '',
      profilePhoto: imp.contactInfo?.profilePhoto || '',
      photoEnabled: Boolean(imp.contactInfo?.profilePhoto),
      photoSize: imp.contactInfo?.photoSize || 76
    };

    const newSummary = imp.summary || '';

    const newSkills = Array.isArray(imp.skills) && imp.skills.length > 0
      ? imp.skills.map(s => typeof s === 'string' ? { name: s, rating: 4 } : s)
      : [];

    const newExperience = Array.isArray(imp.experience) && imp.experience.length > 0
      ? imp.experience
      : [];

    const newProjects = Array.isArray(imp.projects) && imp.projects.length > 0
      ? imp.projects
      : [];

    const newEducation = Array.isArray(imp.education) && imp.education.length > 0
      ? imp.education
      : [];

    const newCertifications = Array.isArray(imp.certifications) && imp.certifications.length > 0
      ? imp.certifications.map(c => typeof c === 'string' ? { name: c } : c)
      : [];

    const newAchievements = Array.isArray(imp.achievements) && imp.achievements.length > 0
      ? imp.achievements.map(a => typeof a === 'string' ? { title: a, description: a } : a)
      : [];

    const newLinks = Array.isArray(imp.links) && imp.links.length > 0
      ? imp.links
      : [];

    setResumeData(prev => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        ...newContact,
        fullName: newContact.fullName || prev.contactInfo.fullName,
        email: newContact.email || prev.contactInfo.email,
        phone: newContact.phone || prev.contactInfo.phone
      },
      summary: newSummary || prev.summary,
      skills: newSkills.length > 0 ? newSkills : prev.skills,
      experience: newExperience.length > 0 ? newExperience : prev.experience,
      projects: newProjects.length > 0 ? newProjects : prev.projects,
      education: newEducation.length > 0 ? newEducation : prev.education,
      certifications: newCertifications.length > 0 ? newCertifications : prev.certifications,
      achievements: newAchievements.length > 0 ? newAchievements : prev.achievements,
      links: newLinks.length > 0 ? newLinks : prev.links
    }));

    if (importedData._id) {
      setResumeId(importedData._id);
    }
    if (importedData.atsScore) {
      setAtsScore(importedData.atsScore);
    }

    saveToLocalStorage(imp, importedData._id);

    setImportModalOpen(false);
    toast.success('Resume imported successfully! All content is live in preview.', { icon: '📄' });
  };

  const handleApplyCuration = (finalMergedResume) => {
    setResumeData(finalMergedResume);
    saveToLocalStorage(finalMergedResume);
    toast.success('Purana + Naya merged resume applied!', { icon: '🚀' });
    handleSaveSection(false);
  };

  // Profile Photo Editor & Removal States
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [removeConfirmModalOpen, setRemoveConfirmModalOpen] = useState(false);
  const [rawPhotoFileSrc, setRawPhotoFileSrc] = useState('');

  // AI Suggestion States
  const [aiLoading, setAiLoading] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiSuggestionCandidate, setAiSuggestionCandidate] = useState('');
  const [aiTargetKey, setAiTargetKey] = useState({ section: '', field: '', index: null });

  // Main Structured Resume State
  const [resumeData, setResumeData] = useState({
    contactInfo: {
      fullName: 'ALOK KUMAR',
      phone: '+91 9304XXXXXX',
      email: 'alok.dev@example.com',
      linkedin: 'linkedin.com/in/alokkumar',
      github: 'github.com/alokkumar',
      portfolio: 'alokkumar.dev',
      address: 'Bihar, India',
      profilePhoto: '',
      photoEnabled: false,
      photoZoom: 1,
      photoCrop: { x: 0, y: 0 },
      photoRotation: 0,
      photoFrameStyle: 'passport',
      photoSize: 76,
      customLinks: [
        { heading: 'LeetCode', url: 'leetcode.com/u/alokkumar' },
        { heading: 'HackerRank', url: 'hackerrank.com/alokkumar' }
      ]
    },
    summary: 'Detail-oriented and results-driven Java Developer with 2+ years of hands-on experience in building scalable RESTful microservices, backend APIs, and web applications using Spring Boot, Hibernate, and modern cloud technologies.',
    skills: [
      { name: 'Java', rating: 5 },
      { name: 'Spring Boot', rating: 5 },
      { name: 'REST API', rating: 5 },
      { name: 'Hibernate', rating: 4 },
      { name: 'Microservices', rating: 4 },
      { name: 'Docker', rating: 4 },
      { name: 'MySQL', rating: 5 },
      { name: 'MongoDB', rating: 4 }
    ],
    technicalSkills: ['Java 17', 'Spring Boot', 'Hibernate', 'RESTful APIs', 'Microservices', 'Docker', 'MySQL', 'MongoDB', 'JUnit 5', 'Git', 'Maven'],
    softSkills: ['Problem Solving', 'Team Collaboration', 'Agile/Scrum', 'Clean Code'],
    toolsAndTech: ['Docker', 'Git', 'IntelliJ IDEA', 'Postman', 'Maven', 'Swagger'],
    experience: [
      {
        company: 'Innovate Tech Solutions',
        role: 'Java Developer Intern',
        location: 'Noida, India',
        startDate: 'Jan 2024',
        endDate: 'Jun 2024',
        currentWorking: false,
        duration: 'Jan 2024 - Jun 2024',
        description: [
          'Developed 12+ RESTful API endpoints using Spring Boot and Microservices architecture, reducing server response latency by 25%.',
          'Integrated Spring Data JPA with MySQL database, optimizing complex SQL queries for faster data retrieval.',
          'Wrote comprehensive unit and integration tests with JUnit 5 and Mockito, raising code test coverage from 60% to 88%.'
        ],
        achievements: 'Engineered high-throughput caching layer with Redis, boosting API response time by 40%.'
      }
    ],
    projects: [
      {
        title: 'ResumeRoast AI Platform',
        description: [
          'Engineered full-stack AI Resume Analyzer & Builder with PDF parsing and Google Gemini AI scoring.',
          'Built automated ATS compliance checker providing instant section-by-section actionable feedback.',
          'Implemented single-click ATS-friendly PDF and DOCX export capabilities with custom templates.'
        ],
        techStack: ['Java', 'Spring Boot', 'React', 'Node.js', 'MongoDB', 'Tailwind CSS', 'Gemini AI'],
        link: 'github.com/alokkumar/resumeroast',
        github: 'github.com/alokkumar/resumeroast',
        liveDemo: 'resumeroast.live',
        startDate: 'Jan 2024',
        endDate: 'Mar 2024',
        duration: '3 Months',
        role: 'Full Stack Engineer'
      }
    ],
    education: [
      {
        institution: 'Lovely Professional University',
        degree: 'B.Tech',
        branch: 'Computer Science and Engineering',
        startYear: '2021',
        endYear: '2025',
        duration: '2021 - 2025',
        gpa: '8.45',
        location: 'Punjab, India',
        relevantCoursework: ['Data Structures & Algorithms', 'Database Management Systems', 'Object Oriented Programming', 'Operating Systems', 'Computer Networks'],
        description: ['Top 5% student in CS department', 'Core Technical Lead at Coding Club']
      }
    ],
    certifications: [
      {
        name: 'Oracle Certified Professional: Java SE 11 Developer',
        organization: 'Oracle',
        issueDate: '2023',
        credentialId: 'OCP-9921',
        credentialUrl: 'oracle.com/cert/ocp9921'
      },
      {
        name: 'AWS Certified Cloud Practitioner',
        organization: 'Amazon Web Services',
        issueDate: '2024',
        credentialId: 'AWS-8821',
        credentialUrl: 'aws.amazon.com/verify/8821'
      }
    ],
    achievements: [
      {
        title: 'Secured 1st Position in Campus Hackathon',
        organization: 'TechFest 2024',
        date: 'Feb 2024',
        description: 'Secured 1st position among 40+ teams by developing an AI-powered resume analysis platform within 24 hours.'
      },
      {
        title: 'Solved 350+ DSA Problems',
        organization: 'LeetCode & CodeChef',
        date: '2023 - 2024',
        description: 'Achieved 4-star rating on CodeChef and solved 350+ algorithmic problems across LeetCode & CodeChef.'
      }
    ],
    links: [
      { heading: 'LeetCode', url: 'leetcode.com/u/alokkumar' },
      { heading: 'CodeChef', url: 'codechef.com/users/alokkumar' }
    ],
    languages: [
      { name: 'English', proficiency: 'Advanced', rating: 5 },
      { name: 'Hindi', proficiency: 'Native', rating: 5 }
    ]
  });

  // Steps definition (10 steps)
  const steps = [
    { id: 1, number: '01', name: 'Personal Info', icon: User },
    { id: 2, number: '02', name: 'Summary', icon: FileText },
    { id: 3, number: '03', name: 'Skills', icon: BookOpen },
    { id: 4, number: '04', name: 'Experience', icon: Briefcase },
    { id: 5, number: '05', name: 'Projects', icon: FolderKanban },
    { id: 6, number: '06', name: 'Education', icon: GraduationCap },
    { id: 7, number: '07', name: 'Certifications', icon: Award },
    { id: 8, number: '08', name: 'Achievements', icon: Trophy },
    { id: 9, number: '09', name: 'Links', icon: LinkIcon },
    { id: 10, number: '10', name: 'Review & Export', icon: FileCheck }
  ];

  // Calculate section completions
  const calculateCompletion = () => {
    let completedCount = 0;
    const totalSteps = 9; // 9 content steps

    if (resumeData.contactInfo.fullName && resumeData.contactInfo.email && resumeData.contactInfo.phone) completedCount++;
    if (resumeData.summary && resumeData.summary.length > 20) completedCount++;
    if (resumeData.skills && resumeData.skills.length > 0) completedCount++;
    if (resumeData.experience && resumeData.experience.length > 0) completedCount++;
    if (resumeData.projects && resumeData.projects.length > 0) completedCount++;
    if (resumeData.education && resumeData.education.length > 0) completedCount++;
    if (resumeData.certifications && resumeData.certifications.length > 0) completedCount++;
    if (resumeData.achievements && resumeData.achievements.length > 0) completedCount++;
    if (resumeData.contactInfo.github || resumeData.contactInfo.linkedin || (resumeData.links && resumeData.links.length > 0)) completedCount++;

    return Math.min(100, Math.round((completedCount / totalSteps) * 100));
  };

  const completionPercent = calculateCompletion();

  // Load from local storage or DB
  useEffect(() => {
    const storageKey = `resumeroast_builder_${id || 'draft'}`;
    const savedLocal = localStorage.getItem(storageKey);
    if (savedLocal) {
      try {
        const parsed = JSON.parse(savedLocal);
        if (parsed && typeof parsed === 'object') {
          setResumeData(prev => ({
            ...prev,
            ...parsed,
            contactInfo: { ...prev.contactInfo, ...(parsed.contactInfo || {}) }
          }));
        }
      } catch (e) {
        console.error('LocalStorage parse error:', e);
      }
    }

    if (id) {
      fetchResumeFromDB();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchResumeFromDB = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/resume/${id}`);
      if (res.data && res.data.resume) {
        const dbResume = res.data.resume;
        setResumeId(dbResume._id);
        if (dbResume.jobRole) setJobRole(dbResume.jobRole);
        if (dbResume.atsScore) setAtsScore(dbResume.atsScore);
        if (dbResume.selectedTemplate) setSelectedTemplate(dbResume.selectedTemplate);
        if (dbResume.improvedResume) {
          setResumeData(prev => ({
            ...prev,
            ...dbResume.improvedResume,
            contactInfo: { ...prev.contactInfo, ...(dbResume.improvedResume.contactInfo || {}) }
          }));
        }
      }
    } catch (err) {
      console.warn('Failed to load resume from server:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSection = async (showToast = true) => {
    try {
      setSaving(true);
      saveToLocalStorage(resumeData);

      const payload = {
        resumeId,
        improvedResume: resumeData,
        selectedTemplate,
        jobRole
      };

      const res = await api.put('/resume/update', payload);
      if (res.data && res.data._id) {
        setResumeId(res.data._id);
        if (res.data.atsScore) {
          setPreviousScore(atsScore);
          setAtsScore(res.data.atsScore);
        }
      }
      if (showToast) {
        toast.success('Saved successfully!', { id: 'save-toast' });
      }
    } catch (err) {
      console.error('Save error:', err);
      if (showToast) {
        toast.error('Failed to save to database. Saved locally.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndNext = async () => {
    await handleSaveSection(false);
    if (activeStep < 10) {
      setActiveStep(prev => prev + 1);
      toast.success('Section saved! Moving to next step.', { icon: '➔' });
    }
  };

  // AI Trigger Executor
  const triggerAIAction = async (sectionName, actionType, content, targetInfo = {}) => {
    try {
      setAiLoading(true);
      const res = await api.post('/resume/ai-action', {
        resumeId,
        sectionName,
        actionType,
        content
      });

      if (res.data && res.data.updatedContent !== undefined) {
        setAiSuggestionCandidate(res.data.updatedContent);
        setAiTargetKey(targetInfo);
        setAiModalOpen(true);
      }
    } catch (err) {
      toast.error('AI action failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setAiLoading(false);
    }
  };

  // Apply AI Suggestion
  const applyAISuggestion = (mode = 'replace') => {
    if (!aiSuggestionCandidate) return;

    const { section, field, index } = aiTargetKey;

    setResumeData(prev => {
      const copy = JSON.parse(JSON.stringify(prev));

      if (section === 'summary') {
        if (mode === 'append') {
          copy.summary = copy.summary ? `${copy.summary}\n\n${aiSuggestionCandidate}` : aiSuggestionCandidate;
        } else {
          copy.summary = aiSuggestionCandidate;
        }
      } else if (section === 'experience' && index !== null) {
        if (field === 'description') {
          copy.experience[index].description = Array.isArray(aiSuggestionCandidate)
            ? aiSuggestionCandidate
            : typeof aiSuggestionCandidate === 'string'
            ? aiSuggestionCandidate.split('\n').filter(Boolean)
            : copy.experience[index].description;
        } else if (field === 'achievements') {
          copy.experience[index].achievements = String(aiSuggestionCandidate);
        }
      } else if (section === 'projects' && index !== null) {
        if (field === 'description') {
          copy.projects[index].description = Array.isArray(aiSuggestionCandidate)
            ? aiSuggestionCandidate
            : typeof aiSuggestionCandidate === 'string'
            ? aiSuggestionCandidate.split('\n').filter(Boolean)
            : copy.projects[index].description;
        }
      } else if (section === 'education' && index !== null) {
        if (field === 'relevantCoursework') {
          copy.education[index].relevantCoursework = Array.isArray(aiSuggestionCandidate)
            ? aiSuggestionCandidate
            : copy.education[index].relevantCoursework;
        }
      } else if (section === 'achievements' && index !== null) {
        if (field === 'description') {
          copy.achievements[index].description = String(aiSuggestionCandidate);
        }
      }

      saveToLocalStorage(copy);
      return copy;
    });

    setAiModalOpen(false);
    toast.success('AI suggestion applied!');
  };

  // PDF Export
  const handleDownloadPDF = async () => {
    try {
      await handleSaveSection(false);
      toast.loading('Generating PDF...', { id: 'pdf-toast' });
      const response = await api.post(
        '/resume/download',
        { resumeId },
        { responseType: 'blob' }
      );
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Resume_${jobRole.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF Downloaded!', { id: 'pdf-toast' });
    } catch (error) {
      toast.error('Failed to download PDF', { id: 'pdf-toast' });
    }
  };

  // DOCX Export
  const handleDownloadDOCX = async () => {
    try {
      await handleSaveSection(false);
      toast.loading('Generating DOCX...', { id: 'docx-toast' });
      const response = await api.post(
        '/resume/download-docx',
        { resumeId },
        { responseType: 'blob' }
      );
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Resume_${jobRole.replace(/\s+/g, '_')}.docx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('DOCX Downloaded!', { id: 'docx-toast' });
    } catch (error) {
      toast.error('Failed to download DOCX', { id: 'docx-toast' });
    }
  };

  // Check step completion status
  const getStepStatus = (stepId) => {
    if (stepId === activeStep) return 'current';
    switch (stepId) {
      case 1:
        return (resumeData.contactInfo.fullName && resumeData.contactInfo.email) ? 'completed' : 'pending';
      case 2:
        return (resumeData.summary && resumeData.summary.length > 20) ? 'completed' : 'pending';
      case 3:
        return (resumeData.skills && resumeData.skills.length > 0) ? 'completed' : 'pending';
      case 4:
        return (resumeData.experience && resumeData.experience.length > 0) ? 'completed' : 'pending';
      case 5:
        return (resumeData.projects && resumeData.projects.length > 0) ? 'completed' : 'pending';
      case 6:
        return (resumeData.education && resumeData.education.length > 0) ? 'completed' : 'pending';
      case 7:
        return (resumeData.certifications && resumeData.certifications.length > 0) ? 'completed' : 'pending';
      case 8:
        return (resumeData.achievements && resumeData.achievements.length > 0) ? 'completed' : 'pending';
      case 9:
        return (resumeData.links && resumeData.links.length > 0) ? 'completed' : 'pending';
      case 10:
        return 'completed';
      default:
        return 'pending';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
        <Loader />
        <p className="mt-4 text-slate-400 font-medium text-sm animate-pulse">Initializing Resume Builder...</p>
      </div>
    );
  }

  return (
    <div className={isEmbedded ? "w-full bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-hidden rounded-2xl border border-slate-800 my-2" : "h-screen max-h-screen w-full overflow-hidden bg-slate-950 text-slate-100 flex flex-col font-sans select-none"}>
      {/* ==================================================
          TOP CONTROL HEADER & PROGRESS
      ================================================== */}
      <header className="flex-shrink-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-3 md:px-5 py-2">
        <div className="w-full flex flex-wrap items-center justify-between gap-2">
          
          {/* Title & Target Role */}
          <div className="flex items-center space-x-2">
            {/* Back Button (Previous Section - Only when step > 1) */}
            {activeStep > 1 && (
              <button
                type="button"
                onClick={() => {
                  setActiveStep(prev => prev - 1);
                  toast.success(`Moved back to Step ${activeStep - 1}`);
                }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition flex items-center space-x-1 flex-shrink-0"
                title={`Go back to Step ${activeStep - 1}`}
              >
                <ChevronLeft className="w-4 h-4 text-orange-400" />
                <span className="text-xs font-semibold hidden xl:inline">
                  Step {activeStep - 1}
                </span>
              </button>
            )}

            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-1.5 rounded-lg text-slate-950 shadow-md flex-shrink-0">
              <Flame className="w-4 h-4 fill-slate-950" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <h1 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">Resume Builder</h1>
                <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[9px] font-semibold px-1.5 py-0.2 rounded-full hidden sm:inline">
                  AI
                </span>
              </div>
              <div className="flex items-center space-x-1 mt-0.5">
                <label className="text-[10px] text-slate-400 hidden sm:inline">Role:</label>
                <select
                  value={jobRole}
                  onChange={(e) => {
                    setJobRole(e.target.value);
                    toast.success(`Target role set to: ${e.target.value}`);
                  }}
                  className="bg-slate-800 text-slate-200 text-[11px] font-medium rounded-md px-1.5 py-0.5 border border-slate-700 focus:outline-none focus:border-orange-500 cursor-pointer max-w-[120px] sm:max-w-[150px] truncate"
                >
                  {TARGET_JOB_ROLES.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ATS Score & Completion */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <div className="bg-slate-800/80 border border-slate-700/80 px-2 py-1 rounded-lg flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <div className="flex items-baseline space-x-1">
                <span className="text-[9px] text-slate-400 font-bold uppercase">ATS:</span>
                <span className="text-xs font-extrabold text-emerald-400">{atsScore}/100</span>
              </div>
            </div>

            <div className="hidden xl:flex flex-col w-24">
              <div className="flex justify-between text-[9px] font-medium text-slate-300 mb-0.5">
                <span>Done</span>
                <span className="text-orange-400 font-bold">{completionPercent}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-amber-400 h-1 transition-all duration-500 rounded-full"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => setImportModalOpen(true)}
              title="Import a new PDF resume or JSON backup file"
              className="bg-slate-800 hover:bg-slate-700 text-orange-400 border border-orange-500/30 text-[11px] sm:text-xs font-semibold px-2 sm:px-2.5 py-1 rounded-lg flex items-center space-x-1 transition shadow-sm"
            >
              <UploadCloud className="w-3.5 h-3.5 text-orange-400" />
              <span className="hidden md:inline">Import</span>
            </button>

            <button
              onClick={() => handleSaveSection(true)}
              disabled={saving}
              title="Save Resume Changes"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] sm:text-xs font-semibold px-2 sm:px-2.5 py-1 rounded-lg flex items-center space-x-1 transition"
            >
              <Save className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save'}</span>
            </button>

            <button
              onClick={() => setPreviewMobileModal(true)}
              title="Preview Live Resume Fullscreen"
              className="bg-slate-800 hover:bg-slate-700 text-orange-400 border border-orange-500/30 text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center space-x-1 transition shadow-sm"
            >
              <Eye className="w-3.5 h-3.5 text-orange-400" />
              <span>Preview</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              title="Download ATS-Optimized PDF File"
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-bold text-[11px] sm:text-xs px-2.5 sm:px-3 py-1 rounded-lg flex items-center space-x-1 shadow-md transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>

            <button
              onClick={handleDownloadDOCX}
              title="Download Editable Word DOCX File"
              className="bg-slate-800 hover:bg-slate-700 text-blue-400 border border-blue-500/30 font-semibold text-[11px] sm:text-xs px-2 sm:px-2.5 py-1 rounded-lg flex items-center space-x-1 transition"
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">DOCX</span>
            </button>
          </div>
        </div>
      </header>

      {/* ==================================================
          3-PART RESIZABLE MAIN LAYOUT
      ================================================== */}
      <div 
        ref={containerRef}
        className={`flex-1 w-full mx-auto flex flex-col md:flex-row overflow-hidden relative ${
          isResizingLeft || isResizingRight ? 'select-none cursor-col-resize' : ''
        }`}
      >
        {/* ==================================================
            1. LEFT STEP SIDEBAR
        ================================================== */}
        <aside 
          style={isDesktop ? { width: `${leftWidth}px`, flexShrink: 0 } : undefined}
          className="w-full md:w-auto bg-slate-900/60 p-3 overflow-y-auto h-full min-h-0 border-b md:border-b-0 border-slate-800/80 transition-all duration-75 flex-shrink-0"
        >
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400">
              Builder Steps
            </span>
            <button
              type="button"
              onClick={() => setImportModalOpen(true)}
              className="text-[11px] text-orange-400 hover:text-orange-300 font-semibold flex items-center space-x-1 transition"
              title="Import New Resume File"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Import</span>
            </button>
          </div>
          
          <nav className="space-y-1 mt-1">
            {steps.map((step) => {
              const status = getStepStatus(step.id);
              const IconComp = step.icon;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                    activeStep === step.id
                      ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/10 text-orange-400 border border-orange-500/30 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <span className="text-[10px] font-mono text-slate-500 font-bold">{step.number}</span>
                    <IconComp className={`w-4 h-4 ${activeStep === step.id ? 'text-orange-400' : 'text-slate-400'}`} />
                    <span className="truncate">{step.name}</span>
                  </div>

                  <div className="ml-2 flex-shrink-0">
                    {status === 'completed' && (
                      <span className="text-emerald-400 font-bold text-xs" title="Completed">✓</span>
                    )}
                    {status === 'current' && (
                      <span className="text-orange-400 font-bold text-xs" title="Current">●</span>
                    )}
                    {status === 'pending' && (
                      <span className="text-slate-600 font-bold text-xs" title="Not completed">○</span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Quick AI Advice Box */}
          <div className="mt-6 bg-slate-800/50 border border-slate-700/60 rounded-xl p-3 text-xs text-slate-300 space-y-2">
            <div className="flex items-center space-x-1.5 text-amber-400 font-bold text-[11px] uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              <span>Role Advice</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              For <strong className="text-slate-200">{jobRole}</strong>, emphasize technical stack, quantifiable metrics, and GitHub project repository links.
            </p>
          </div>
        </aside>

        {/* LEFT RESIZER DIVIDER (↔️ Drag to resize) */}
        <div
          onMouseDown={(e) => { e.preventDefault(); setIsResizingLeft(true); }}
          onTouchStart={() => setIsResizingLeft(true)}
          onDoubleClick={handleResetLeft}
          title="Drag ↔ to resize step panel (Double-click to reset)"
          className={`hidden md:flex items-center justify-center w-2.5 hover:w-3 cursor-col-resize select-none bg-slate-950 border-x border-slate-800/80 hover:bg-orange-500/20 active:bg-orange-500/40 transition-colors group relative z-20 ${
            isResizingLeft ? 'bg-orange-500/30 border-orange-500/60 shadow-[0_0_12px_rgba(249,115,22,0.4)]' : ''
          }`}
        >
          <div className={`w-1.5 h-10 rounded-full bg-slate-700 group-hover:bg-orange-400 transition-colors flex flex-col items-center justify-center gap-0.5 shadow-sm ${
            isResizingLeft ? 'bg-orange-400 scale-110 shadow-orange-500/50' : ''
          }`}>
            <GripVertical className="w-3 h-3 text-slate-950 stroke-[3]" />
          </div>

          {isResizingLeft && (
            <div className="absolute top-3 left-3 bg-orange-500 text-slate-950 font-mono font-extrabold text-[10px] px-2 py-0.5 rounded shadow-lg z-30 whitespace-nowrap animate-fadeIn">
              Steps: {leftWidth}px
            </div>
          )}
        </div>

        {/* ==================================================
            2. CENTER RESUME EDITOR
        ================================================== */}
        <main 
          style={isDesktop ? { flex: 1, minWidth: '300px' } : undefined}
          className="w-full bg-slate-950 p-4 md:p-6 overflow-y-auto h-full min-h-0 space-y-6 flex flex-col justify-between"
        >
          
          {/* STEP 01: PERSONAL INFO */}
          {activeStep === 1 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <User className="w-5 h-5 text-orange-400" />
                  <span>Personal Information</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">Add your basic information for your resume.</p>
              </div>

              {/* Form Card */}
              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-4">
                {/* 0. Profile Photo (Optional) */}
                <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
                      <Camera className="w-4 h-4 text-orange-400" />
                      <span>Profile Photo (Optional)</span>
                    </label>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700 font-medium">
                      Passport 3:4 / Circle
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                    {/* Frame / Preview Box */}
                    <div className={`w-20 h-24 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 relative group ${resumeData.contactInfo.photoEnabled && resumeData.contactInfo.profilePhoto ? '' : 'bg-slate-950 border-2 border-dashed border-slate-700'}`}>
                      {resumeData.contactInfo.photoEnabled && resumeData.contactInfo.profilePhoto ? (
                        <img
                          src={resumeData.contactInfo.profilePhoto}
                          alt="Profile Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-2">
                          <Camera className="w-6 h-6 text-slate-500 mx-auto mb-1" />
                          <span className="text-[9px] text-slate-500 font-semibold block">No Photo</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons & Info */}
                    <div className="space-y-2 text-center sm:text-left flex-1">
                      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                        <label className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 flex items-center space-x-1 cursor-pointer transition">
                          <UploadCloud className="w-3.5 h-3.5 text-orange-400" />
                          <span>Upload Photo</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files && e.target.files[0];
                              if (!file) return;
                              if (file.size > 2 * 1024 * 1024) {
                                toast.error('File size exceeds 2MB limit. Please select a smaller photo.');
                                return;
                              }
                              const reader = new FileReader();
                              reader.onload = (evt) => {
                                setRawPhotoFileSrc(evt.target.result);
                                setPhotoModalOpen(true);
                              };
                              reader.readAsDataURL(file);
                              e.target.value = '';
                            }}
                          />
                        </label>

                        {resumeData.contactInfo.photoEnabled && resumeData.contactInfo.profilePhoto && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setRawPhotoFileSrc(resumeData.contactInfo.profilePhoto);
                                setPhotoModalOpen(true);
                              }}
                              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 flex items-center space-x-1 transition"
                            >
                              <Crop className="w-3.5 h-3.5 text-amber-400" />
                              <span>Edit Photo</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setRemoveConfirmModalOpen(true)}
                              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-500/30 flex items-center space-x-1 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove Photo</span>
                            </button>
                          </>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400">
                        Recommended: Passport-size professional photo <br />
                        <span className="text-[10px] text-slate-500">JPG / PNG • Maximum 2MB</span>
                      </p>
                    </div>
                  </div>

                  {/* Photo Frame Size Controls (Chota / Bara) */}
                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200 flex items-center space-x-1.5">
                        <Sliders className="w-3.5 h-3.5 text-orange-400" />
                        <span>Photo Frame Size (Chota / Bara)</span>
                      </span>
                      <span className="text-[10px] text-orange-400 font-mono font-bold bg-orange-950/60 border border-orange-500/30 px-2 py-0.5 rounded-md">
                        {resumeData.contactInfo.photoSize || 76}px × {Math.round((resumeData.contactInfo.photoSize || 76) * 1.333)}px
                      </span>
                    </div>

                    {/* Presets Grid */}
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { label: 'Chota (S)', size: 56 },
                        { label: 'Medium (M)', size: 76 },
                        { label: 'Bara (L)', size: 96 },
                        { label: 'Extra Large (XL)', size: 116 }
                      ].map(preset => (
                        <button
                          key={preset.size}
                          type="button"
                          onClick={() => setResumeData(prev => ({
                            ...prev,
                            contactInfo: { ...prev.contactInfo, photoSize: preset.size }
                          }))}
                          className={`py-1.5 px-1 text-[11px] font-semibold rounded-lg border transition ${
                            (resumeData.contactInfo.photoSize || 76) === preset.size
                              ? 'bg-orange-500/20 border-orange-500 text-orange-400 font-bold shadow-sm'
                              : 'bg-slate-900 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    {/* Range Slider for Fine Adjustment */}
                    <div className="flex items-center space-x-2.5 pt-1">
                      <span className="text-[10px] font-medium text-slate-400">Chota (50px)</span>
                      <input
                        type="range"
                        min="50"
                        max="130"
                        step="2"
                        value={resumeData.contactInfo.photoSize || 76}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, photoSize: parseInt(e.target.value, 10) }
                        }))}
                        className="w-full accent-orange-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                      />
                      <span className="text-[10px] font-medium text-slate-400">Bara (130px)</span>
                    </div>
                  </div>
                </div>
                {/* 1. Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={resumeData.contactInfo.fullName}
                    onChange={(e) => setResumeData(prev => ({
                      ...prev,
                      contactInfo: { ...prev.contactInfo, fullName: e.target.value }
                    }))}
                    className="w-full bg-slate-800 text-white text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-orange-500"
                    placeholder="e.g. Alok Kumar"
                  />
                </div>

                {/* 2. Address */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Address / Location</label>
                  <input
                    type="text"
                    value={resumeData.contactInfo.address}
                    onChange={(e) => setResumeData(prev => ({
                      ...prev,
                      contactInfo: { ...prev.contactInfo, address: e.target.value }
                    }))}
                    className="w-full bg-slate-800 text-white text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-orange-500"
                    placeholder="City, State, Country"
                  />
                </div>

                {/* 3. Email ID and Side-by-Side Phone No */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Email ID</label>
                    <input
                      type="email"
                      value={resumeData.contactInfo.email}
                      onChange={(e) => setResumeData(prev => ({
                        ...prev,
                        contactInfo: { ...prev.contactInfo, email: e.target.value }
                      }))}
                      className="w-full bg-slate-800 text-white text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-orange-500"
                      placeholder="alok@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Phone No</label>
                    <input
                      type="text"
                      value={resumeData.contactInfo.phone}
                      onChange={(e) => setResumeData(prev => ({
                        ...prev,
                        contactInfo: { ...prev.contactInfo, phone: e.target.value }
                      }))}
                      className="w-full bg-slate-800 text-white text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-orange-500"
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>

                <hr className="border-slate-800/80 my-3" />

                {/* 4. Links without heading & Add Link Button */}
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-2.5">
                    <div>
                      <input
                        type="text"
                        value={resumeData.contactInfo.linkedin}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, linkedin: e.target.value }
                        }))}
                        className="w-full bg-slate-800 text-white text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-orange-500"
                        placeholder="LinkedIn URL (e.g. linkedin.com/in/username)"
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        value={resumeData.contactInfo.github}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, github: e.target.value }
                        }))}
                        className="w-full bg-slate-800 text-white text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-orange-500"
                        placeholder="GitHub URL (e.g. github.com/username)"
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        value={resumeData.contactInfo.portfolio}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, portfolio: e.target.value }
                        }))}
                        className="w-full bg-slate-800 text-white text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-orange-500"
                        placeholder="Portfolio Website URL (e.g. myportfolio.dev)"
                      />
                    </div>
                  </div>

                  {/* Custom Added Links */}
                  {resumeData.contactInfo.customLinks?.map((link, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <select
                        value={link.heading}
                        onChange={(e) => {
                          const updated = [...resumeData.contactInfo.customLinks];
                          updated[idx].heading = e.target.value;
                          setResumeData(prev => ({
                            ...prev,
                            contactInfo: { ...prev.contactInfo, customLinks: updated }
                          }));
                        }}
                        className="w-28 bg-slate-800 text-white text-xs rounded-lg px-2 py-2 border border-slate-700 focus:outline-none"
                      >
                        {PRESET_LINK_PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <input
                        type="text"
                        value={link.url}
                        onChange={(e) => {
                          const updated = [...resumeData.contactInfo.customLinks];
                          updated[idx].url = e.target.value;
                          setResumeData(prev => ({
                            ...prev,
                            contactInfo: { ...prev.contactInfo, customLinks: updated }
                          }));
                        }}
                        className="flex-1 bg-slate-800 text-white text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-orange-500"
                        placeholder="URL or profile link"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = resumeData.contactInfo.customLinks.filter((_, i) => i !== idx);
                          setResumeData(prev => ({
                            ...prev,
                            contactInfo: { ...prev.contactInfo, customLinks: updated }
                          }));
                        }}
                        className="text-slate-500 hover:text-red-400 p-1.5 transition"
                        title="Remove link"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {/* Button to Add Link */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setResumeData(prev => ({
                          ...prev,
                          contactInfo: {
                            ...prev.contactInfo,
                            customLinks: [...(prev.contactInfo.customLinks || []), { heading: 'LeetCode', url: '' }]
                          }
                        }));
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-orange-400 border border-orange-500/30 text-xs font-semibold px-3 py-2 rounded-lg flex items-center space-x-1.5 transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Link</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* AI Suggestion Panel */}
              <div className="bg-slate-900/80 border border-amber-500/30 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Personal Info Suggestions</span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-300">
                  {!resumeData.contactInfo.linkedin && (
                    <div className="flex items-center justify-between bg-slate-800/80 p-2 rounded-lg">
                      <span>LinkedIn profile is missing.</span>
                      <button 
                        onClick={() => setResumeData(prev => ({ ...prev, contactInfo: { ...prev.contactInfo, linkedin: 'linkedin.com/in/myprofile' } }))}
                        className="text-orange-400 font-semibold hover:underline text-[11px]"
                      >
                        + Add Suggestion
                      </button>
                    </div>
                  )}
                  {!resumeData.contactInfo.github && (
                    <div className="flex items-center justify-between bg-slate-800/80 p-2 rounded-lg">
                      <span>GitHub link is recommended for technical roles.</span>
                      <button 
                        onClick={() => setResumeData(prev => ({ ...prev, contactInfo: { ...prev.contactInfo, github: 'github.com/mygithub' } }))}
                        className="text-orange-400 font-semibold hover:underline text-[11px]"
                      >
                        + Add Suggestion
                      </button>
                    </div>
                  )}
                  <div className="text-[11px] text-slate-400 italic">
                    ✓ Contact links will automatically wrap neatly across lines in ATS templates.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 02: SUMMARY */}
          {activeStep === 2 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-orange-400" />
                  <span>Professional Summary</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">Craft a compelling summary tailored for {jobRole}.</p>
              </div>

              {/* Large Text Editor */}
              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>ATS Keyword Match: <strong className="text-emerald-400">82%</strong></span>
                  <span>{resumeData.summary.length} chars</span>
                </div>

                <textarea
                  rows={6}
                  value={resumeData.summary}
                  onChange={(e) => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
                  className="w-full bg-slate-800 text-white text-xs rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-orange-500 leading-relaxed font-sans"
                  placeholder="Enter your professional summary..."
                />

                {/* AI Prompt Buttons */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    disabled={aiLoading}
                    onClick={() => triggerAIAction('summary', 'generate', resumeData.summary, { section: 'summary' })}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1 hover:brightness-110 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Generate with AI</span>
                  </button>

                  <button
                    disabled={aiLoading}
                    onClick={() => triggerAIAction('summary', 'improve', resumeData.summary, { section: 'summary' })}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center space-x-1"
                  >
                    <span>✨ Improve</span>
                  </button>

                  <button
                    disabled={aiLoading}
                    onClick={() => triggerAIAction('summary', 'ats_optimize', resumeData.summary, { section: 'summary' })}
                    className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center space-x-1"
                  >
                    <span>✨ ATS Optimize</span>
                  </button>

                  <button
                    disabled={aiLoading}
                    onClick={() => triggerAIAction('summary', 'rewrite', resumeData.summary, { section: 'summary' })}
                    className="bg-slate-800 hover:bg-slate-700 text-blue-400 border border-blue-500/30 text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center space-x-1"
                  >
                    <span>✨ Rewrite</span>
                  </button>

                  <button
                    disabled={aiLoading}
                    onClick={() => triggerAIAction('summary', 'shorten', resumeData.summary, { section: 'summary' })}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold px-2 py-1.5 rounded-lg"
                  >
                    <span>✨ Shorten</span>
                  </button>

                  <button
                    disabled={aiLoading}
                    onClick={() => triggerAIAction('summary', 'expand', resumeData.summary, { section: 'summary' })}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold px-2 py-1.5 rounded-lg"
                  >
                    <span>✨ Expand</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 03: SKILLS */}
          {activeStep === 3 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-orange-400" />
                  <span>Skills & Competencies</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">Group your skills and use ★★★★★ star ratings for proficiency.</p>
              </div>

              {/* AI Recommended Skills Card */}
              <div className="bg-slate-900/80 border border-orange-500/30 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-orange-400 font-bold text-xs">
                    <Sparkles className="w-4 h-4" />
                    <span>Recommended for {jobRole}</span>
                  </div>
                  <button
                    onClick={() => {
                      const recs = ROLE_SKILL_RECOMMENDATIONS[jobRole] || ROLE_SKILL_RECOMMENDATIONS['Java Developer'];
                      const existingNames = new Set((resumeData.skills || []).map(s => typeof s === 'object' ? s.name : s));
                      const newAdditions = recs
                        .filter(r => !existingNames.has(r))
                        .map(r => ({ name: r, rating: 5 }));

                      setResumeData(prev => ({
                        ...prev,
                        skills: [...(prev.skills || []), ...newAdditions]
                      }));
                      toast.success(`Added ${newAdditions.length} recommended skills!`);
                    }}
                    className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 font-bold text-[11px] px-2.5 py-1 rounded-lg border border-orange-500/40 transition"
                  >
                    + Add All Recommended
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(ROLE_SKILL_RECOMMENDATIONS[jobRole] || ROLE_SKILL_RECOMMENDATIONS['Java Developer']).map(skillName => (
                    <button
                      key={skillName}
                      onClick={() => {
                        const existingNames = new Set((resumeData.skills || []).map(s => typeof s === 'object' ? s.name : s));
                        if (!existingNames.has(skillName)) {
                          setResumeData(prev => ({
                            ...prev,
                            skills: [...(prev.skills || []), { name: skillName, rating: 5 }]
                          }));
                          toast.success(`Added ${skillName}`);
                        } else {
                          toast('Already added', { icon: 'ℹ️' });
                        }
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-medium px-2 py-1 rounded-lg flex items-center space-x-1"
                    >
                      <span>+ {skillName}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Technical Skills Section (Left Side of Resume) */}
              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider">Technical Skills (Left Side)</h3>
                  <button
                    onClick={() => {
                      setResumeData(prev => ({
                        ...prev,
                        technicalSkills: [...(prev.technicalSkills || []), '']
                      }));
                    }}
                    className="text-orange-400 hover:text-orange-300 text-xs font-bold flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Technical Skill</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(resumeData.technicalSkills || []).map((skill, idx) => (
                    <div key={idx} className="flex items-center space-x-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700">
                      <input
                        type="text"
                        value={skill}
                        onChange={(e) => {
                          const updated = [...(resumeData.technicalSkills || [])];
                          updated[idx] = e.target.value;
                          setResumeData(prev => ({ ...prev, technicalSkills: updated }));
                        }}
                        className="flex-1 bg-slate-900 text-white text-xs rounded-lg px-3 py-1.5 border border-slate-700 focus:outline-none"
                        placeholder="e.g. Java 17, Spring Boot"
                      />
                      <button
                        onClick={() => {
                          const updated = (resumeData.technicalSkills || []).filter((_, i) => i !== idx);
                          setResumeData(prev => ({ ...prev, technicalSkills: updated }));
                        }}
                        className="text-slate-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Professional / Soft Skills Section (Right Side of Resume) */}
              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider">Professional Skills (Right Side)</h3>
                  <button
                    onClick={() => {
                      setResumeData(prev => ({
                        ...prev,
                        softSkills: [...(prev.softSkills || []), '']
                      }));
                    }}
                    className="text-orange-400 hover:text-orange-300 text-xs font-bold flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Professional Skill</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(resumeData.softSkills || []).map((skill, idx) => (
                    <div key={idx} className="flex items-center space-x-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700">
                      <input
                        type="text"
                        value={skill}
                        onChange={(e) => {
                          const updated = [...(resumeData.softSkills || [])];
                          updated[idx] = e.target.value;
                          setResumeData(prev => ({ ...prev, softSkills: updated }));
                        }}
                        className="flex-1 bg-slate-900 text-white text-xs rounded-lg px-3 py-1.5 border border-slate-700 focus:outline-none"
                        placeholder="e.g. Problem Solving, Leadership"
                      />
                      <button
                        onClick={() => {
                          const updated = (resumeData.softSkills || []).filter((_, i) => i !== idx);
                          setResumeData(prev => ({ ...prev, softSkills: updated }));
                        }}
                        className="text-slate-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills List with Star Ratings */}
              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">General Skills (Star Rated)</h3>
                  <button
                    onClick={() => {
                      setResumeData(prev => ({
                        ...prev,
                        skills: [...(prev.skills || []), { name: '', rating: 5 }]
                      }));
                    }}
                    className="text-orange-400 hover:text-orange-300 text-xs font-bold flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Skill</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {(resumeData.skills || []).map((skillObj, idx) => {
                    const skillName = typeof skillObj === 'object' ? skillObj.name : skillObj;
                    const rating = typeof skillObj === 'object' ? (skillObj.rating || 5) : 5;

                    return (
                      <div key={idx} className="flex items-center justify-between bg-slate-800/80 p-2 rounded-xl space-x-2">
                        <input
                          type="text"
                          value={skillName}
                          onChange={(e) => {
                            const updated = [...(resumeData.skills || [])];
                            if (typeof updated[idx] === 'object') {
                              updated[idx].name = e.target.value;
                            } else {
                              updated[idx] = { name: e.target.value, rating: 5 };
                            }
                            setResumeData(prev => ({ ...prev, skills: updated }));
                          }}
                          className="flex-1 bg-slate-900 text-white text-xs rounded-lg px-3 py-1.5 border border-slate-700 focus:outline-none"
                          placeholder="e.g. Spring Boot"
                        />

                        {/* Star Rating Select */}
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((starVal) => (
                            <button
                              key={starVal}
                              onClick={() => {
                                const updated = [...(resumeData.skills || [])];
                                if (typeof updated[idx] === 'object') {
                                  updated[idx].rating = starVal;
                                } else {
                                  updated[idx] = { name: skillName, rating: starVal };
                                }
                                setResumeData(prev => ({ ...prev, skills: updated }));
                              }}
                              className={`text-sm ${starVal <= rating ? 'text-amber-400 font-bold' : 'text-slate-600'}`}
                            >
                              ★
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={() => {
                            const updated = (resumeData.skills || []).filter((_, i) => i !== idx);
                            setResumeData(prev => ({ ...prev, skills: updated }));
                          }}
                          className="text-slate-500 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 04: EXPERIENCE */}
          {activeStep === 4 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                    <Briefcase className="w-5 h-5 text-orange-400" />
                    <span>Work Experience</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Add your previous work roles and achievement bullet points.</p>
                </div>
                <button
                  onClick={() => {
                    setResumeData(prev => ({
                      ...prev,
                      experience: [
                        ...(prev.experience || []),
                        {
                          company: '',
                          role: '',
                          location: '',
                          startDate: '',
                          endDate: '',
                          currentWorking: false,
                          duration: '',
                          description: [''],
                          achievements: ''
                        }
                      ]
                    }));
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Experience</span>
                </button>
              </div>

              {(resumeData.experience || []).map((exp, expIdx) => (
                <div key={expIdx} className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-orange-400">Experience #{expIdx + 1}</span>
                    <button
                      onClick={() => {
                        const updated = resumeData.experience.filter((_, i) => i !== expIdx);
                        setResumeData(prev => ({ ...prev, experience: updated }));
                      }}
                      className="text-slate-500 hover:text-red-400 text-xs flex items-center space-x-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Company</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => {
                          const updated = [...resumeData.experience];
                          updated[expIdx].company = e.target.value;
                          setResumeData(prev => ({ ...prev, experience: updated }));
                        }}
                        className="w-full bg-slate-800 text-white text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none"
                        placeholder="Company name"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Job Title</label>
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => {
                          const updated = [...resumeData.experience];
                          updated[expIdx].role = e.target.value;
                          setResumeData(prev => ({ ...prev, experience: updated }));
                        }}
                        className="w-full bg-slate-800 text-white text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none"
                        placeholder="Role / Title"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Start Date</label>
                      <input
                        type="text"
                        value={exp.startDate || ''}
                        onChange={(e) => {
                          const updated = [...resumeData.experience];
                          updated[expIdx].startDate = e.target.value;
                          setResumeData(prev => ({ ...prev, experience: updated }));
                        }}
                        className="w-full bg-slate-800 text-white text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none"
                        placeholder="Jan 2024"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">End Date</label>
                      <input
                        type="text"
                        disabled={exp.currentWorking}
                        value={exp.currentWorking ? 'Present' : exp.endDate || ''}
                        onChange={(e) => {
                          const updated = [...resumeData.experience];
                          updated[expIdx].endDate = e.target.value;
                          setResumeData(prev => ({ ...prev, experience: updated }));
                        }}
                        className="w-full bg-slate-800 text-white text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none disabled:opacity-50"
                        placeholder="Jun 2024"
                      />
                    </div>
                  </div>

                  {/* Bullet Descriptions */}
                  <div className="space-y-2 pt-2">
                    <label className="block text-xs font-bold text-slate-300">Bullet Point Descriptions</label>
                    {(exp.description || ['']).map((bullet, bIdx) => (
                      <div key={bIdx} className="flex items-center space-x-2">
                        <span className="text-slate-500 text-xs font-bold">•</span>
                        <input
                          type="text"
                          value={bullet}
                          onChange={(e) => {
                            const updated = [...resumeData.experience];
                            updated[expIdx].description[bIdx] = e.target.value;
                            setResumeData(prev => ({ ...prev, experience: updated }));
                          }}
                          className="flex-1 bg-slate-800 text-white text-xs rounded-lg px-3 py-1.5 border border-slate-700 focus:outline-none"
                          placeholder="Developed RESTful APIs using Spring Boot..."
                        />
                        <button
                          onClick={() => {
                            const updated = [...resumeData.experience];
                            updated[expIdx].description = updated[expIdx].description.filter((_, i) => i !== bIdx);
                            setResumeData(prev => ({ ...prev, experience: updated }));
                          }}
                          className="text-slate-500 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const updated = [...resumeData.experience];
                        updated[expIdx].description.push('');
                        setResumeData(prev => ({ ...prev, experience: updated }));
                      }}
                      className="text-xs text-orange-400 font-bold hover:underline"
                    >
                      + Add Bullet Point
                    </button>
                  </div>

                  {/* AI Options for Experience */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
                    <button
                      disabled={aiLoading}
                      onClick={() => triggerAIAction('experience', 'improve', exp.description, { section: 'experience', field: 'description', index: expIdx })}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-2.5 py-1 rounded-lg"
                    >
                      ✨ Improve Bullet Points
                    </button>

                    <button
                      disabled={aiLoading}
                      onClick={() => triggerAIAction('experience', 'add_metrics', exp.description, { section: 'experience', field: 'description', index: expIdx })}
                      className="bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 text-xs font-semibold px-2.5 py-1 rounded-lg"
                    >
                      ✨ Add Metrics (% / Impact)
                    </button>

                    <button
                      disabled={aiLoading}
                      onClick={() => triggerAIAction('experience', 'ats_optimize', exp.description, { section: 'experience', field: 'description', index: expIdx })}
                      className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs font-semibold px-2.5 py-1 rounded-lg"
                    >
                      ✨ ATS Optimize
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STEP 05: PROJECTS */}
          {activeStep === 5 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                    <FolderKanban className="w-5 h-5 text-orange-400" />
                    <span>Projects</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Highlight key technical projects with repository links.</p>
                </div>
                <button
                  onClick={() => {
                    setResumeData(prev => ({
                      ...prev,
                      projects: [
                        ...(prev.projects || []),
                        {
                          title: '',
                          description: [''],
                          techStack: ['React', 'Node.js'],
                          link: '',
                          github: '',
                          liveDemo: ''
                        }
                      ]
                    }));
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Project</span>
                </button>
              </div>

              {(resumeData.projects || []).map((proj, pIdx) => (
                <div key={pIdx} className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-orange-400">Project #{pIdx + 1}</span>
                    <button
                      onClick={() => {
                        const updated = resumeData.projects.filter((_, i) => i !== pIdx);
                        setResumeData(prev => ({ ...prev, projects: updated }));
                      }}
                      className="text-slate-500 hover:text-red-400 text-xs flex items-center space-x-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Project Name</label>
                      <input
                        type="text"
                        value={proj.title}
                        onChange={(e) => {
                          const updated = [...resumeData.projects];
                          updated[pIdx].title = e.target.value;
                          setResumeData(prev => ({ ...prev, projects: updated }));
                        }}
                        className="w-full bg-slate-800 text-white text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none"
                        placeholder="e.g. ResumeRoast AI"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Tech Stack (comma separated)</label>
                      <input
                        type="text"
                        value={Array.isArray(proj.techStack) ? proj.techStack.join(', ') : proj.techStack || ''}
                        onChange={(e) => {
                          const updated = [...resumeData.projects];
                          updated[pIdx].techStack = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                          setResumeData(prev => ({ ...prev, projects: updated }));
                        }}
                        className="w-full bg-slate-800 text-white text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none"
                        placeholder="Java, Spring Boot, React"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">GitHub / Code URL</label>
                      <input
                        type="text"
                        value={proj.github || proj.link || ''}
                        onChange={(e) => {
                          const updated = [...resumeData.projects];
                          updated[pIdx].github = e.target.value;
                          updated[pIdx].link = e.target.value;
                          setResumeData(prev => ({ ...prev, projects: updated }));
                        }}
                        className="w-full bg-slate-800 text-white text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none"
                        placeholder="github.com/user/project"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Live Demo Link</label>
                      <input
                        type="text"
                        value={proj.liveDemo || ''}
                        onChange={(e) => {
                          const updated = [...resumeData.projects];
                          updated[pIdx].liveDemo = e.target.value;
                          setResumeData(prev => ({ ...prev, projects: updated }));
                        }}
                        className="w-full bg-slate-800 text-white text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none"
                        placeholder="myproject.live"
                      />
                    </div>
                  </div>

                  {/* Bullet Descriptions */}
                  <div className="space-y-2 pt-2">
                    <label className="block text-xs font-bold text-slate-300">Project Description Bullets</label>
                    {(proj.description || ['']).map((bullet, bIdx) => (
                      <div key={bIdx} className="flex items-center space-x-2">
                        <span className="text-slate-500 text-xs font-bold">•</span>
                        <input
                          type="text"
                          value={bullet}
                          onChange={(e) => {
                            const updated = [...resumeData.projects];
                            updated[pIdx].description[bIdx] = e.target.value;
                            setResumeData(prev => ({ ...prev, projects: updated }));
                          }}
                          className="flex-1 bg-slate-800 text-white text-xs rounded-lg px-3 py-1.5 border border-slate-700 focus:outline-none"
                          placeholder="Engineered full-stack AI Resume Analyzer..."
                        />
                        <button
                          onClick={() => {
                            const updated = [...resumeData.projects];
                            updated[pIdx].description = updated[pIdx].description.filter((_, i) => i !== bIdx);
                            setResumeData(prev => ({ ...prev, projects: updated }));
                          }}
                          className="text-slate-500 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const updated = [...resumeData.projects];
                        updated[pIdx].description.push('');
                        setResumeData(prev => ({ ...prev, projects: updated }));
                      }}
                      className="text-xs text-orange-400 font-bold hover:underline"
                    >
                      + Add Bullet Point
                    </button>
                  </div>

                  {/* AI Actions */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
                    <button
                      disabled={aiLoading}
                      onClick={() => triggerAIAction('projects', 'improve', proj.description, { section: 'projects', field: 'description', index: pIdx })}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-2.5 py-1 rounded-lg"
                    >
                      ✨ Improve Project
                    </button>

                    <button
                      disabled={aiLoading}
                      onClick={() => triggerAIAction('projects', 'add_metrics', proj.description, { section: 'projects', field: 'description', index: pIdx })}
                      className="bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 text-xs font-semibold px-2.5 py-1 rounded-lg"
                    >
                      ✨ Add Metrics
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STEP 06: EDUCATION */}
          {activeStep === 6 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                    <GraduationCap className="w-5 h-5 text-orange-400" />
                    <span>Education</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Degrees, college background, and relevant coursework.</p>
                </div>
                <button
                  onClick={() => {
                    setResumeData(prev => ({
                      ...prev,
                      education: [
                        ...(prev.education || []),
                        {
                          institution: '',
                          degree: 'B.Tech',
                          branch: 'Computer Science',
                          gpa: '',
                          startYear: '',
                          endYear: '',
                          location: '',
                          relevantCoursework: []
                        }
                      ]
                    }));
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Education</span>
                </button>
              </div>

              {(resumeData.education || []).map((edu, eduIdx) => (
                <div key={eduIdx} className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-orange-400">Education #{eduIdx + 1}</span>
                    <button
                      onClick={() => {
                        const updated = resumeData.education.filter((_, i) => i !== eduIdx);
                        setResumeData(prev => ({ ...prev, education: updated }));
                      }}
                      className="text-slate-500 hover:text-red-400 text-xs flex items-center space-x-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">College / University</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => {
                          const updated = [...resumeData.education];
                          updated[eduIdx].institution = e.target.value;
                          setResumeData(prev => ({ ...prev, education: updated }));
                        }}
                        className="w-full bg-slate-800 text-white text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none"
                        placeholder="University name"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Degree</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => {
                          const updated = [...resumeData.education];
                          updated[eduIdx].degree = e.target.value;
                          setResumeData(prev => ({ ...prev, education: updated }));
                        }}
                        className="w-full bg-slate-800 text-white text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none"
                        placeholder="e.g. B.Tech"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Branch / Major</label>
                      <input
                        type="text"
                        value={edu.branch}
                        onChange={(e) => {
                          const updated = [...resumeData.education];
                          updated[eduIdx].branch = e.target.value;
                          setResumeData(prev => ({ ...prev, education: updated }));
                        }}
                        className="w-full bg-slate-800 text-white text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none"
                        placeholder="Computer Science"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">CGPA / Percentage</label>
                      <input
                        type="text"
                        value={edu.gpa}
                        onChange={(e) => {
                          const updated = [...resumeData.education];
                          updated[eduIdx].gpa = e.target.value;
                          setResumeData(prev => ({ ...prev, education: updated }));
                        }}
                        className="w-full bg-slate-800 text-white text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none"
                        placeholder="8.45 CGPA"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Start Year</label>
                      <input
                        type="text"
                        value={edu.startYear || ''}
                        onChange={(e) => {
                          const updated = [...resumeData.education];
                          updated[eduIdx].startYear = e.target.value;
                          setResumeData(prev => ({ ...prev, education: updated }));
                        }}
                        className="w-full bg-slate-800 text-white text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none"
                        placeholder="2021"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">End Year</label>
                      <input
                        type="text"
                        value={edu.endYear || ''}
                        onChange={(e) => {
                          const updated = [...resumeData.education];
                          updated[eduIdx].endYear = e.target.value;
                          setResumeData(prev => ({ ...prev, education: updated }));
                        }}
                        className="w-full bg-slate-800 text-white text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none"
                        placeholder="2025"
                      />
                    </div>
                  </div>

                  {/* Coursework */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Relevant Coursework (comma separated)</label>
                    <input
                      type="text"
                      value={Array.isArray(edu.relevantCoursework) ? edu.relevantCoursework.join(', ') : edu.relevantCoursework || ''}
                      onChange={(e) => {
                        const updated = [...resumeData.education];
                        updated[eduIdx].relevantCoursework = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                        setResumeData(prev => ({ ...prev, education: updated }));
                      }}
                      className="w-full bg-slate-800 text-white text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none"
                      placeholder="Data Structures, DBMS, Operating Systems"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STEP 07: CERTIFICATIONS */}
          {activeStep === 7 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                    <Award className="w-5 h-5 text-orange-400" />
                    <span>Certifications</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Verified industry certifications boost your ATS ranking.</p>
                </div>
                <button
                  onClick={() => {
                    setResumeData(prev => ({
                      ...prev,
                      certifications: [
                        ...(prev.certifications || []),
                        { name: '', organization: '', issueDate: '', credentialId: '', credentialUrl: '' }
                      ]
                    }));
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Certification</span>
                </button>
              </div>

              {/* Recommended Certifications for Role */}
              <div className="bg-slate-900/80 border border-orange-500/30 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-400">Recommended Certifications for {jobRole}</span>
                  <button
                    onClick={() => {
                      const recs = ROLE_CERT_RECOMMENDATIONS[jobRole] || ROLE_CERT_RECOMMENDATIONS['Java Developer'];
                      setResumeData(prev => ({
                        ...prev,
                        certifications: [
                          ...(prev.certifications || []),
                          ...recs.map(r => ({ name: r.name, organization: r.organization, issueDate: '2023' }))
                        ]
                      }));
                      toast.success('Added recommended certifications!');
                    }}
                    className="text-[11px] font-bold text-orange-300 hover:underline"
                  >
                    + Add All Recommended
                  </button>
                </div>
                <div className="space-y-1">
                  {(ROLE_CERT_RECOMMENDATIONS[jobRole] || ROLE_CERT_RECOMMENDATIONS['Java Developer']).map((c, i) => (
                    <div key={i} className="flex items-center justify-between text-xs text-slate-300 bg-slate-800/60 p-2 rounded-lg">
                      <span>{c.name} — <strong className="text-slate-400">{c.organization}</strong></span>
                      <button
                        onClick={() => {
                          setResumeData(prev => ({
                            ...prev,
                            certifications: [...(prev.certifications || []), { name: c.name, organization: c.organization, issueDate: '2024' }]
                          }));
                          toast.success(`Added ${c.name}`);
                        }}
                        className="text-orange-400 font-bold text-[11px] hover:underline"
                      >
                        + Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certification List */}
              {(resumeData.certifications || []).map((cert, cIdx) => (
                <div key={cIdx} className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-orange-400">Certification #{cIdx + 1}</span>
                    <button
                      onClick={() => {
                        const updated = resumeData.certifications.filter((_, i) => i !== cIdx);
                        setResumeData(prev => ({ ...prev, certifications: updated }));
                      }}
                      className="text-slate-500 hover:text-red-400 text-xs flex items-center space-x-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Certificate Name</label>
                      <input
                        type="text"
                        value={cert.name || ''}
                        onChange={(e) => {
                          const updated = [...resumeData.certifications];
                          updated[cIdx].name = e.target.value;
                          setResumeData(prev => ({ ...prev, certifications: updated }));
                        }}
                        className="w-full bg-slate-800 text-white text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none"
                        placeholder="e.g. AWS Certified Developer"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Issuing Organization</label>
                      <input
                        type="text"
                        value={cert.organization || ''}
                        onChange={(e) => {
                          const updated = [...resumeData.certifications];
                          updated[cIdx].organization = e.target.value;
                          setResumeData(prev => ({ ...prev, certifications: updated }));
                        }}
                        className="w-full bg-slate-800 text-white text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none"
                        placeholder="Amazon Web Services"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Issue Date / Year</label>
                      <input
                        type="text"
                        value={cert.issueDate || ''}
                        onChange={(e) => {
                          const updated = [...resumeData.certifications];
                          updated[cIdx].issueDate = e.target.value;
                          setResumeData(prev => ({ ...prev, certifications: updated }));
                        }}
                        className="w-full bg-slate-800 text-white text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none"
                        placeholder="2024"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Credential URL</label>
                      <input
                        type="text"
                        value={cert.credentialUrl || ''}
                        onChange={(e) => {
                          const updated = [...resumeData.certifications];
                          updated[cIdx].credentialUrl = e.target.value;
                          setResumeData(prev => ({ ...prev, certifications: updated }));
                        }}
                        className="w-full bg-slate-800 text-white text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none"
                        placeholder="aws.amazon.com/verify/..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STEP 08: ACHIEVEMENTS */}
          {activeStep === 8 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-orange-400" />
                    <span>Achievements</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Honors, coding competition rankings, and hackathon wins.</p>
                </div>
                <button
                  onClick={() => {
                    setResumeData(prev => ({
                      ...prev,
                      achievements: [
                        ...(prev.achievements || []),
                        { title: '', organization: '', date: '', description: '' }
                      ]
                    }));
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Achievement</span>
                </button>
              </div>

              {(resumeData.achievements || []).map((ach, aIdx) => (
                <div key={aIdx} className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-orange-400">Achievement #{aIdx + 1}</span>
                    <button
                      onClick={() => {
                        const updated = resumeData.achievements.filter((_, i) => i !== aIdx);
                        setResumeData(prev => ({ ...prev, achievements: updated }));
                      }}
                      className="text-slate-500 hover:text-red-400 text-xs flex items-center space-x-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Achievement Title</label>
                      <input
                        type="text"
                        value={ach.title || ''}
                        onChange={(e) => {
                          const updated = [...resumeData.achievements];
                          updated[aIdx].title = e.target.value;
                          setResumeData(prev => ({ ...prev, achievements: updated }));
                        }}
                        className="w-full bg-slate-800 text-white text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none"
                        placeholder="e.g. 1st Place in Hackathon"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Organization / Event</label>
                      <input
                        type="text"
                        value={ach.organization || ''}
                        onChange={(e) => {
                          const updated = [...resumeData.achievements];
                          updated[aIdx].organization = e.target.value;
                          setResumeData(prev => ({ ...prev, achievements: updated }));
                        }}
                        className="w-full bg-slate-800 text-white text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none"
                        placeholder="TechFest 2024"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Description / Impact</label>
                    <textarea
                      rows={2}
                      value={ach.description || ''}
                      onChange={(e) => {
                        const updated = [...resumeData.achievements];
                        updated[aIdx].description = e.target.value;
                        setResumeData(prev => ({ ...prev, achievements: updated }));
                      }}
                      className="w-full bg-slate-800 text-white text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none"
                      placeholder="Secured 1st position among 40 teams by developing an AI-powered application..."
                    />
                  </div>

                  {/* AI Option */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      disabled={aiLoading}
                      onClick={() => triggerAIAction('achievements', 'add_metrics', ach.description || ach.title, { section: 'achievements', field: 'description', index: aIdx })}
                      className="bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 text-xs font-semibold px-2.5 py-1 rounded-lg"
                    >
                      ✨ Rewrite Professionally with Impact
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STEP 09: LINKS */}
          {activeStep === 9 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <LinkIcon className="w-5 h-5 text-orange-400" />
                  <span>Custom Links</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">Add profiles like LeetCode, CodeChef, Medium, or personal website.</p>
              </div>

              <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-300">Dedicated Links</span>
                  <button
                    onClick={() => {
                      setResumeData(prev => ({
                        ...prev,
                        links: [...(prev.links || []), { heading: 'LeetCode', url: '' }]
                      }));
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add New Link</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {(resumeData.links || []).map((link, lIdx) => (
                    <div key={lIdx} className="flex items-center space-x-2 bg-slate-800/80 p-2 rounded-xl">
                      <select
                        value={link.heading}
                        onChange={(e) => {
                          const updated = [...(resumeData.links || [])];
                          updated[lIdx].heading = e.target.value;
                          setResumeData(prev => ({ ...prev, links: updated }));
                        }}
                        className="bg-slate-900 text-white text-xs rounded-lg px-2.5 py-1.5 border border-slate-700 focus:outline-none"
                      >
                        {PRESET_LINK_PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <input
                        type="text"
                        value={link.url}
                        onChange={(e) => {
                          const updated = [...(resumeData.links || [])];
                          updated[lIdx].url = e.target.value;
                          setResumeData(prev => ({ ...prev, links: updated }));
                        }}
                        className="flex-1 bg-slate-900 text-white text-xs rounded-lg px-3 py-1.5 border border-slate-700 focus:outline-none"
                        placeholder="leetcode.com/u/username"
                      />
                      <button
                        onClick={() => {
                          const updated = (resumeData.links || []).filter((_, i) => i !== lIdx);
                          setResumeData(prev => ({ ...prev, links: updated }));
                        }}
                        className="text-slate-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 10: REVIEW & EXPORT */}
          {activeStep === 10 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <FileCheck className="w-5 h-5 text-emerald-400" />
                  <span>Finalize & Export Resume</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">Review ATS score comparison, completion checklist, and download exports.</p>
              </div>

              {/* Score Dashboard */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-900/90 border border-emerald-500/30 p-3 rounded-xl text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">ATS Score</div>
                  <div className="text-xl font-extrabold text-emerald-400 mt-1">{atsScore}/100</div>
                  <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">Very Good</div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Grade</div>
                  <div className="text-xl font-extrabold text-amber-400 mt-1">A+</div>
                  <div className="text-[10px] text-slate-400 font-semibold mt-0.5">Top 5%</div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Job Match</div>
                  <div className="text-xl font-extrabold text-blue-400 mt-1">88%</div>
                  <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{jobRole}</div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Score Improvement</div>
                  <div className="text-xl font-extrabold text-orange-400 mt-1">+24</div>
                  <div className="text-[10px] text-slate-400 font-semibold mt-0.5">64 → {atsScore}</div>
                </div>
              </div>

              {/* Completion Checklist */}
              <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl space-y-2">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Section Checklist</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Personal Info</span>
                  </div>
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Summary</span>
                  </div>
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Skills</span>
                  </div>
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Experience</span>
                  </div>
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Projects</span>
                  </div>
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Education</span>
                  </div>
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Certifications</span>
                  </div>
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Achievements</span>
                  </div>
                </div>
              </div>

              {/* Export Buttons */}
              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Export Options</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={handleDownloadPDF}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center space-x-2 shadow-lg transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download ATS PDF</span>
                  </button>

                  <button
                    onClick={handleDownloadDOCX}
                    className="bg-slate-800 hover:bg-slate-700 text-blue-400 border border-blue-500/40 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center space-x-2 transition"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Download DOCX File</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* BOTTOM STEP NAVIGATION */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
            <button
              disabled={activeStep === 1}
              onClick={() => {
                if (activeStep > 1) {
                  setActiveStep(prev => Math.max(1, prev - 1));
                }
              }}
              className="bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition"
              title={activeStep > 1 ? `Pichla Section (Step ${activeStep - 1})` : "First step"}
            >
              <ChevronLeft className="w-4 h-4 text-orange-400" />
              <span>Pichla Section</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleSaveSection(true)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-3.5 py-2 rounded-xl transition"
              >
                Save
              </button>

              <button
                onClick={handleSaveAndNext}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl flex items-center space-x-1.5 shadow-md transition"
              >
                <span>Save & Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </main>

        {/* RIGHT RESIZER DIVIDER (↔️ Drag to resize) */}
        <div
          onMouseDown={(e) => { e.preventDefault(); setIsResizingRight(true); }}
          onTouchStart={() => setIsResizingRight(true)}
          onDoubleClick={handleResetRight}
          title="Drag ↔ to resize preview panel (Double-click to reset)"
          className={`hidden md:flex items-center justify-center w-2.5 hover:w-3 cursor-col-resize select-none bg-slate-950 border-x border-slate-800/80 hover:bg-orange-500/20 active:bg-orange-500/40 transition-colors group relative z-20 ${
            isResizingRight ? 'bg-orange-500/30 border-orange-500/60 shadow-[0_0_12px_rgba(249,115,22,0.4)]' : ''
          }`}
        >
          <div className={`w-1.5 h-10 rounded-full bg-slate-700 group-hover:bg-orange-400 transition-colors flex flex-col items-center justify-center gap-0.5 shadow-sm ${
            isResizingRight ? 'bg-orange-400 scale-110 shadow-orange-500/50' : ''
          }`}>
            <GripVertical className="w-3 h-3 text-slate-950 stroke-[3]" />
          </div>

          {isResizingRight && (
            <div className="absolute top-3 right-3 bg-orange-500 text-slate-950 font-mono font-extrabold text-[10px] px-2 py-0.5 rounded shadow-lg z-30 whitespace-nowrap animate-fadeIn">
              Preview: {rightWidth}px
            </div>
          )}
        </div>

        {/* ==================================================
            3. RIGHT LIVE PREVIEW
        ================================================== */}
        <section 
          style={isDesktop ? { width: `${rightWidth}px`, flexShrink: 0 } : undefined}
          className="hidden md:flex bg-slate-900 p-4 flex-col justify-between overflow-y-auto h-full min-h-0 border-l border-slate-800 transition-all duration-75"
        >
          
          {/* Controls Bar */}
          <div className="bg-slate-950/90 backdrop-blur border border-slate-800 p-2 rounded-xl flex flex-wrap items-center justify-between gap-2 mb-3">
            {/* Template Selector */}
            <div className="flex items-center space-x-1.5 min-w-0">
              <LayoutTemplate className="w-4 h-4 text-orange-400 flex-shrink-0" />
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="bg-slate-800 text-white text-xs font-semibold rounded-lg px-2 py-1 border border-slate-700 focus:outline-none cursor-pointer max-w-[130px] sm:max-w-[170px] truncate"
              >
                <option value="classic">Classic ATS</option>
                <option value="modern">Modern ATS</option>
                <option value="recommended">Recommended ATS</option>
              </select>
            </div>

            {/* Quick Photo Size Adjuster (if photo enabled) */}
            {resumeData.contactInfo.photoEnabled && resumeData.contactInfo.profilePhoto && (
              <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-lg text-[11px]">
                <span className="text-slate-300 font-semibold flex items-center space-x-1">
                  <span>Photo:</span>
                  <span className="text-orange-400 font-mono font-bold">{resumeData.contactInfo.photoSize || 76}px</span>
                </span>
                <button
                  type="button"
                  onClick={() => setResumeData(prev => ({
                    ...prev,
                    contactInfo: { ...prev.contactInfo, photoSize: Math.max(50, (prev.contactInfo.photoSize || 76) - 10) }
                  }))}
                  className="w-4 h-4 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded border border-slate-700"
                  title="Smaller Photo"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => setResumeData(prev => ({
                    ...prev,
                    contactInfo: { ...prev.contactInfo, photoSize: Math.min(130, (prev.contactInfo.photoSize || 76) + 10) }
                  }))}
                  className="w-4 h-4 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded border border-slate-700"
                  title="Larger Photo"
                >
                  +
                </button>
              </div>
            )}

            {/* Zoom & Expand Controls */}
            <div className="flex items-center space-x-1 bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => {
                  const autoScale = Math.min(100, Math.max(45, Math.floor(((rightWidth - 32) / 800) * 100)));
                  setZoomLevel(autoScale);
                }}
                className="text-[10px] text-orange-400 hover:text-orange-300 font-bold px-1 rounded hover:bg-slate-700"
                title="Fit Width"
              >
                Fit
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.max(40, prev - 10))}
                className="text-slate-300 hover:text-white font-bold text-xs px-1"
                title="Zoom Out"
              >
                -
              </button>
              <span className="text-[10px] text-slate-300 font-mono w-7 text-center">{zoomLevel}%</span>
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.min(140, prev + 10))}
                className="text-slate-300 hover:text-white font-bold text-xs px-1"
                title="Zoom In"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => {
                  const nextWidth = rightWidth >= 650 ? 520 : 720;
                  setRightWidth(nextWidth);
                  try { localStorage.setItem('builder_right_width', nextWidth.toString()); } catch {}
                }}
                className="text-[10px] bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/40 px-2 py-0.5 rounded font-semibold transition ml-1 whitespace-nowrap"
                title="Expand Live Preview Width Towards Left Side (Bara Karo)"
              >
                {rightWidth >= 650 ? 'Chota ➔' : 'Bara Karo (Expand ↔)'}
              </button>
            </div>
          </div>

          {/* Live A4 Canvas */}
          <div className="flex-1 flex justify-center items-start overflow-auto p-2">
            <div 
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              className="transition-transform duration-200 shadow-2xl rounded-sm w-full"
            >
              {selectedTemplate === 'modern' ? (
                <ModernATSTemplate data={resumeData} />
              ) : selectedTemplate === 'recommended' ? (
                <RecommendedATSTemplate data={resumeData} />
              ) : (
                <ClassicATSTemplate data={resumeData} />
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-center text-[11px] text-slate-400">
            Live ATS Preview • Updates in real-time
          </div>
        </section>
      </div>

      {/* AI SUGGESTION MODAL OVERLAY */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
              <Sparkles className="w-5 h-5" />
              <span>AI Generated Suggestion</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs text-slate-200 leading-relaxed font-sans max-h-60 overflow-y-auto">
              {typeof aiSuggestionCandidate === 'object' 
                ? JSON.stringify(aiSuggestionCandidate, null, 2)
                : String(aiSuggestionCandidate)}
            </div>

            <div className="flex flex-wrap gap-2 justify-end pt-2">
              <button
                onClick={() => setAiModalOpen(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs px-3.5 py-2 rounded-xl"
              >
                Keep Current
              </button>

              <button
                onClick={() => applyAISuggestion('append')}
                className="bg-slate-800 hover:bg-slate-700 text-orange-400 border border-orange-500/30 font-semibold text-xs px-3.5 py-2 rounded-xl"
              >
                Add Below
              </button>

              <button
                onClick={() => applyAISuggestion('replace')}
                className="bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl shadow-md"
              >
                Replace Text
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE PREVIEW MODAL */}
      {previewMobileModal && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col p-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <span className="font-bold text-sm text-white">Live Resume Preview</span>
            <button
              onClick={() => setPreviewMobileModal(false)}
              className="text-slate-400 hover:text-white font-bold text-sm"
            >
              ✕ Close
            </button>
          </div>
          <div className="flex-1 overflow-y-auto pt-4">
            {selectedTemplate === 'modern' ? (
              <ModernATSTemplate data={resumeData} />
            ) : selectedTemplate === 'recommended' ? (
              <RecommendedATSTemplate data={resumeData} />
            ) : (
              <ClassicATSTemplate data={resumeData} />
            )}
          </div>
        </div>
      )}

      {/* PHOTO EDITOR CROP MODAL */}
      <PhotoEditorModal
        isOpen={photoModalOpen}
        imageSrc={rawPhotoFileSrc}
        initialSettings={{
          zoom: resumeData.contactInfo.photoZoom || 1,
          rotation: resumeData.contactInfo.photoRotation || 0,
          crop: resumeData.contactInfo.photoCrop || { x: 0, y: 0 }
        }}
        onClose={() => setPhotoModalOpen(false)}
        onApply={(cropResult) => {
          setResumeData(prev => ({
            ...prev,
            contactInfo: {
              ...prev.contactInfo,
              profilePhoto: cropResult.dataUrl,
              photoEnabled: true,
              photoZoom: cropResult.zoom,
              photoCrop: cropResult.crop,
              photoRotation: cropResult.rotation
            }
          }));
          setPhotoModalOpen(false);
          toast.success('Profile photo updated!');
        }}
      />

      {/* REMOVE PHOTO CONFIRMATION MODAL */}
      {removeConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl max-w-xs w-full space-y-4 shadow-2xl text-center animate-fadeIn">
            <div className="w-10 h-10 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Remove profile photo?</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                This will remove the photo from your live preview and exported PDF.
              </p>
            </div>
            <div className="flex items-center justify-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setRemoveConfirmModalOpen(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setResumeData(prev => ({
                    ...prev,
                    contactInfo: {
                      ...prev.contactInfo,
                      profilePhoto: '',
                      photoEnabled: false
                    }
                  }));
                  setRemoveConfirmModalOpen(false);
                  toast.success('Profile photo removed');
                }}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg shadow transition"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IMPORT NEW RESUME MODAL */}
      <ImportResumeModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
        defaultJobRole={jobRole}
      />

      {/* AI RESUME CONTENT CURATOR (PURANA + NAYA MERGE) */}
      <ImportCurationModal
        isOpen={curationModalOpen}
        onClose={() => setCurationModalOpen(false)}
        previousData={resumeData}
        importedData={importedCandidateData}
        jobRole={jobRole}
        onApplyCuration={handleApplyCuration}
      />
    </div>
  );
};

export default ResumeBuilder;
