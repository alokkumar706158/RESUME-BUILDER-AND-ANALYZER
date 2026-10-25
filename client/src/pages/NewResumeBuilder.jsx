import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  Briefcase,
  Eye,
  FileText,
  FolderGit2,
  GraduationCap,
  History,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Trophy,
  User,
  Wrench,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Loader from '../components/Loader';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_PATTERN = /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(:\d+)?([/?#][^\s]*)?$/i;
const PHONE_PATTERN = /^[+()\d][\d\s().-]{4,24}$/;

const ENTRY_FIELDS = {
  education: ['institution', 'degree', 'fieldOfStudy', 'startYear', 'endYear', 'description'],
  experience: ['company', 'jobTitle', 'startDate', 'endDate', 'responsibilities'],
  projects: ['name', 'description', 'technologies', 'url'],
  certifications: ['name', 'organization', 'date']
};

const createEntry = (section) =>
  ENTRY_FIELDS[section].reduce((entry, field) => {
    entry[field] = '';
    return entry;
  }, {});

const createEmptyResume = () => ({
  personalInfo: {
    fullName: '',
    professionalTitle: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: ''
  },
  summary: '',
  education: [createEntry('education')],
  experience: [createEntry('experience')],
  projects: [createEntry('projects')],
  skills: {
    programmingLanguages: '',
    frameworks: '',
    databases: '',
    tools: ''
  },
  certifications: [createEntry('certifications')],
  achievements: ''
});

const normalizeEntries = (value, section) => {
  if (!Array.isArray(value)) return [];

  return value.map((entry) => {
    const source = entry && typeof entry === 'object' ? entry : {};
    return ENTRY_FIELDS[section].reduce((normalized, field) => {
      normalized[field] = typeof source[field] === 'string' ? source[field] : '';
      return normalized;
    }, {});
  });
};

const normalizeResume = (data = {}) => {
  const fallback = createEmptyResume();
  const personalInfo =
    data.personalInfo && typeof data.personalInfo === 'object' ? data.personalInfo : {};
  const skills = data.skills && typeof data.skills === 'object' ? data.skills : {};

  return {
    personalInfo: Object.keys(fallback.personalInfo).reduce((result, field) => {
      result[field] = typeof personalInfo[field] === 'string' ? personalInfo[field] : '';
      return result;
    }, {}),
    summary: typeof data.summary === 'string' ? data.summary : '',
    education: normalizeEntries(data.education, 'education'),
    experience: normalizeEntries(data.experience, 'experience'),
    projects: normalizeEntries(data.projects, 'projects'),
    skills: Object.keys(fallback.skills).reduce((result, field) => {
      result[field] = typeof skills[field] === 'string' ? skills[field] : '';
      return result;
    }, {}),
    certifications: normalizeEntries(data.certifications, 'certifications'),
    achievements: typeof data.achievements === 'string' ? data.achievements : ''
  };
};

const hasAnyValue = (entry) =>
  Object.values(entry).some((value) => typeof value === 'string' && value.trim() !== '');

const splitList = (value) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const validateResume = (data) => {
  const errors = {};
  const { personalInfo } = data;

  if (!personalInfo.fullName.trim()) {
    errors['personalInfo.fullName'] = 'Full name is required.';
  }

  if (!personalInfo.email.trim()) {
    errors['personalInfo.email'] = 'Email is required.';
  } else if (!EMAIL_PATTERN.test(personalInfo.email.trim())) {
    errors['personalInfo.email'] = 'Enter a valid email address.';
  }

  if (personalInfo.phone.trim() && !PHONE_PATTERN.test(personalInfo.phone.trim())) {
    errors['personalInfo.phone'] = 'Enter a valid phone number.';
  }

  ['linkedin', 'github', 'portfolio'].forEach((field) => {
    const value = personalInfo[field].trim();
    if (value && !URL_PATTERN.test(value)) {
      errors[`personalInfo.${field}`] = 'Enter a valid URL, e.g. https://example.com.';
    }
  });

  data.education.forEach((entry, index) => {
    if (!hasAnyValue(entry)) return;
    if (!entry.institution.trim()) {
      errors[`education.${index}.institution`] = 'Institution is required.';
    }
    if (!entry.degree.trim()) {
      errors[`education.${index}.degree`] = 'Degree is required.';
    }
  });

  data.experience.forEach((entry, index) => {
    if (!hasAnyValue(entry)) return;
    if (!entry.company.trim()) {
      errors[`experience.${index}.company`] = 'Company is required.';
    }
    if (!entry.jobTitle.trim()) {
      errors[`experience.${index}.jobTitle`] = 'Job title is required.';
    }
  });

  data.projects.forEach((entry, index) => {
    if (!hasAnyValue(entry)) return;
    if (!entry.name.trim()) {
      errors[`projects.${index}.name`] = 'Project name is required.';
    }
    if (entry.url.trim() && !URL_PATTERN.test(entry.url.trim())) {
      errors[`projects.${index}.url`] = 'Enter a valid project URL.';
    }
  });

  data.certifications.forEach((entry, index) => {
    if (!hasAnyValue(entry)) return;
    if (!entry.name.trim()) {
      errors[`certifications.${index}.name`] = 'Certification name is required.';
    }
  });

  return errors;
};

const inputClasses =
  'w-full rounded-xl border bg-slate-950/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-brandPurple focus:ring-2 focus:ring-brandPurple/20';

const Field = ({
  label,
  value,
  onChange,
  error,
  placeholder,
  type = 'text',
  textarea = false,
  rows = 3,
  hint,
  required = false,
  maxLength,
  inputMode,
  autoComplete
}) => {
  const className = `${inputClasses} ${error ? 'border-rose-500/70' : 'border-slate-800'}`;
  const sharedProps = {
    value,
    onChange: (event) => onChange(event.target.value),
    placeholder,
    maxLength,
    'aria-invalid': Boolean(error)
  };

  return (
    <label className="block min-w-0 space-y-1.5">
      <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
        {required && <span className="text-rose-400">*</span>}
      </span>
      {textarea ? (
        <textarea {...sharedProps} rows={rows} className={`${className} resize-y`} />
      ) : (
        <input
          {...sharedProps}
          type={type}
          inputMode={inputMode}
          autoComplete={autoComplete}
          className={className}
        />
      )}
      {hint && <span className="block text-[11px] text-slate-500">{hint}</span>}
      {error && <span className="block text-xs font-medium text-rose-400">{error}</span>}
    </label>
  );
};

const SectionCard = ({ icon: Icon, title, description, action, children }) => (
  <section className="glass-panel rounded-2xl border border-slate-800 p-5 sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-brandPurple/20 bg-brandPurple/10">
          <Icon className="h-5 w-5 text-brandPurple" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white sm:text-lg">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
        </div>
      </div>
      {action}
    </div>
    <div className="mt-5 space-y-4">{children}</div>
  </section>
);

const AddAnotherButton = ({ onClick, label = 'Add Another' }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center gap-1.5 rounded-lg border border-brandPurple/30 bg-brandPurple/10 px-2.5 py-1.5 text-xs font-semibold text-brandPurple transition-colors hover:bg-brandPurple/20"
  >
    <Plus className="h-3.5 w-3.5" />
    {label}
  </button>
);

const RemoveButton = ({ onClick, label }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={`Remove ${label}`}
    className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
  >
    <Trash2 className="h-4 w-4" />
  </button>
);

const EntryCard = ({ title, onRemove, removeLabel, children }) => (
  <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
    <div className="flex items-center justify-between gap-3">
      <h3 className="text-sm font-bold text-slate-200">{title}</h3>
      <RemoveButton onClick={onRemove} label={removeLabel} />
    </div>
    {children}
  </div>
);

const PreviewSection = ({ title, children }) => (
  <section className="mt-5">
    <h4 className="mb-2 border-b border-slate-300 pb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-700">
      {title}
    </h4>
    <div className="space-y-3">{children}</div>
  </section>
);

const NewResumeBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [resume, setResume] = useState(createEmptyResume);
  const [draftId, setDraftId] = useState(id || null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [loadingLatest, setLoadingLatest] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [savedFingerprint, setSavedFingerprint] = useState(() =>
    JSON.stringify(createEmptyResume())
  );

  const loadedIdRef = useRef(null);
  const isDirty = useMemo(
    () => JSON.stringify(resume) !== savedFingerprint,
    [resume, savedFingerprint]
  );
  const isDirtyRef = useRef(isDirty);

  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return undefined;
    }

    if (loadedIdRef.current === id) {
      setLoading(false);
      return undefined;
    }

    let active = true;
    setLoading(true);

    api
      .get(`/builder/${id}`)
      .then(({ data }) => {
        if (!active) return;
        const normalized = normalizeResume(data);
        loadedIdRef.current = id;
        setResume(normalized);
        setDraftId(data._id || id);
        setSavedFingerprint(JSON.stringify(normalized));
        setErrors({});
      })
      .catch((error) => {
        if (!active) return;
        loadedIdRef.current = null;
        toast.error(
          error.response?.data?.message || 'Failed to load this resume draft.'
        );

        if (error.response?.status === 404 || error.response?.status === 400) {
          const empty = createEmptyResume();
          setResume(empty);
          setDraftId(null);
          setSavedFingerprint(JSON.stringify(empty));
          navigate('/builder/new', { replace: true });
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, navigate]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!isDirtyRef.current) return;
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(() => {
    if (!showPreview) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setShowPreview(false);
    };
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [showPreview]);

  const clearError = (key) => {
    setErrors((previous) => {
      if (!previous[key]) return previous;
      const next = { ...previous };
      delete next[key];
      return next;
    });
  };

  const updatePersonalInfo = (field, value) => {
    setResume((previous) => ({
      ...previous,
      personalInfo: { ...previous.personalInfo, [field]: value }
    }));
    clearError(`personalInfo.${field}`);
  };

  const updateField = (field, value) => {
    setResume((previous) => ({ ...previous, [field]: value }));
    clearError(field);
  };

  const updateSkills = (field, value) => {
    setResume((previous) => ({
      ...previous,
      skills: { ...previous.skills, [field]: value }
    }));
    clearError(`skills.${field}`);
  };

  const updateEntry = (section, index, field, value) => {
    setResume((previous) => ({
      ...previous,
      [section]: previous[section].map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, [field]: value } : entry
      )
    }));
    clearError(`${section}.${index}.${field}`);
  };

  const addEntry = (section) => {
    setResume((previous) => ({
      ...previous,
      [section]: [...previous[section], createEntry(section)]
    }));
    setErrors({});
  };

  const removeEntry = (section, index) => {
    setResume((previous) => ({
      ...previous,
      [section]: previous[section].filter((_, entryIndex) => entryIndex !== index)
    }));
    setErrors({});
  };

  const handleBack = () => {
    if (
      isDirtyRef.current &&
      !window.confirm('You have unsaved changes. Discard them and leave this page?')
    ) {
      return;
    }
    navigate('/dashboard');
  };

  const handleLoadLatest = async () => {
    if (
      isDirtyRef.current &&
      !window.confirm('You have unsaved changes. Discard them and open your last saved draft?')
    ) {
      return;
    }

    setLoadingLatest(true);

    try {
      const { data } = await api.get('/builder/latest');
      const normalized = normalizeResume(data);

      loadedIdRef.current = data._id || null;
      setResume(normalized);
      setDraftId(data._id || null);
      setSavedFingerprint(JSON.stringify(normalized));
      setErrors({});

      if (data._id) {
        navigate(`/builder/new/${data._id}`, { replace: true });
      }

      toast.success('Last saved draft loaded.');
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error('No saved drafts yet. Save this resume first.');
      } else {
        toast.error(
          error.response?.data?.message || 'Failed to load your last saved draft.'
        );
      }
    } finally {
      setLoadingLatest(false);
    }
  };

  const handleSave = async () => {
    const validationErrors = validateResume(resume);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast.error('Please fix the highlighted fields before saving.');
      return;
    }

    setSaving(true);

    try {
      const response = draftId
        ? await api.put(`/builder/${draftId}`, resume)
        : await api.post('/builder', resume);
      const data = response.data;
      const normalized = normalizeResume(data);
      const nextDraftId = data._id || draftId;

      setResume(normalized);
      setDraftId(nextDraftId);
      setSavedFingerprint(JSON.stringify(normalized));
      setErrors({});

      if (!draftId && nextDraftId) {
        loadedIdRef.current = nextDraftId;
        navigate(`/builder/new/${nextDraftId}`, { replace: true });
      }

      toast.success(draftId ? 'Resume draft updated.' : 'Resume draft saved.');
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to save your resume. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    handleSave();
  };

  const skillGroups = [
    { label: 'Programming Languages', value: resume.skills.programmingLanguages },
    { label: 'Frameworks & Libraries', value: resume.skills.frameworks },
    { label: 'Databases', value: resume.skills.databases },
    { label: 'Tools & Platforms', value: resume.skills.tools }
  ].filter((group) => group.value.trim());

  const filledEducation = resume.education.filter(hasAnyValue);
  const filledExperience = resume.experience.filter(hasAnyValue);
  const filledProjects = resume.projects.filter(hasAnyValue);
  const filledCertifications = resume.certifications.filter(hasAnyValue);
  const contactItems = [
    resume.personalInfo.email,
    resume.personalInfo.phone,
    resume.personalInfo.location,
    resume.personalInfo.linkedin,
    resume.personalInfo.github,
    resume.personalInfo.portfolio
  ].filter((item) => item.trim());

  return (
    <div className="mx-auto w-full max-w-[1500px] pb-10 text-left">
      {loading && <Loader fullScreen />}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-extrabold text-white sm:text-3xl">
                <Sparkles className="h-6 w-6 text-brandPurple" />
                {draftId ? 'Edit Resume Draft' : 'Create a New Resume'}
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-400">
                Build your resume from scratch. Your draft is saved privately to your
                account and can be updated at any time.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {draftId && (
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/50 px-3 py-1.5 text-xs font-medium text-slate-400">
                <span
                  className={`h-2 w-2 rounded-full ${
                    isDirty ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                />
                {isDirty ? 'Unsaved changes' : 'All changes saved'}
              </span>
            )}

            <button
              type="button"
              onClick={handleLoadLatest}
              disabled={loadingLatest || saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-950/50 px-3.5 py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <History className={`h-4 w-4 ${loadingLatest ? 'animate-spin' : ''}`} />
              {loadingLatest ? 'Loading...' : 'Open Last Draft'}
            </button>

            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm font-semibold text-slate-100 transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Eye className="h-4 w-4" />
              Preview Resume
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brandPurple px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brandPurple/20 transition-colors hover:bg-brandPurple/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? 'Saving...' : 'Save Resume'}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
            <SectionCard
              icon={User}
              title="Personal Information"
              description="The essentials recruiters use to contact you."
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label="Full Name"
                  required
                  value={resume.personalInfo.fullName}
                  onChange={(value) => updatePersonalInfo('fullName', value)}
                  placeholder="e.g. Alex Johnson"
                  error={errors['personalInfo.fullName']}
                  maxLength={200}
                  autoComplete="name"
                />
                <Field
                  label="Professional Title"
                  value={resume.personalInfo.professionalTitle}
                  onChange={(value) => updatePersonalInfo('professionalTitle', value)}
                  placeholder="e.g. Full Stack Developer"
                  error={errors['personalInfo.professionalTitle']}
                  maxLength={200}
                />
                <Field
                  label="Email"
                  required
                  type="email"
                  value={resume.personalInfo.email}
                  onChange={(value) => updatePersonalInfo('email', value)}
                  placeholder="you@example.com"
                  error={errors['personalInfo.email']}
                  maxLength={320}
                  autoComplete="email"
                />
                <Field
                  label="Phone"
                  type="tel"
                  value={resume.personalInfo.phone}
                  onChange={(value) => updatePersonalInfo('phone', value)}
                  placeholder="+91 98765 43210"
                  error={errors['personalInfo.phone']}
                  maxLength={80}
                  autoComplete="tel"
                />
                <Field
                  label="Location"
                  value={resume.personalInfo.location}
                  onChange={(value) => updatePersonalInfo('location', value)}
                  placeholder="City, Country"
                  error={errors['personalInfo.location']}
                  maxLength={200}
                  autoComplete="address-level2"
                />
                <Field
                  label="LinkedIn"
                  value={resume.personalInfo.linkedin}
                  onChange={(value) => updatePersonalInfo('linkedin', value)}
                  placeholder="linkedin.com/in/username"
                  error={errors['personalInfo.linkedin']}
                  maxLength={500}
                />
                <Field
                  label="GitHub"
                  value={resume.personalInfo.github}
                  onChange={(value) => updatePersonalInfo('github', value)}
                  placeholder="github.com/username"
                  error={errors['personalInfo.github']}
                  maxLength={500}
                />
                <Field
                  label="Portfolio / Website"
                  value={resume.personalInfo.portfolio}
                  onChange={(value) => updatePersonalInfo('portfolio', value)}
                  placeholder="yourportfolio.com"
                  error={errors['personalInfo.portfolio']}
                  maxLength={500}
                />
              </div>
            </SectionCard>

            <SectionCard
              icon={FileText}
              title="Professional Summary"
              description="A short pitch that highlights who you are and what you bring."
            >
              <Field
                label="Summary"
                textarea
                rows={5}
                value={resume.summary}
                onChange={(value) => updateField('summary', value)}
                placeholder="Write 2-4 sentences about your experience, strengths, and what you are looking for."
                hint="Keep it focused and easy to scan."
                maxLength={5000}
              />
            </SectionCard>

            <SectionCard
              icon={GraduationCap}
              title="Education"
              description="Add your degrees, courses, or academic training."
              action={
                <AddAnotherButton onClick={() => addEntry('education')} />
              }
            >
              {resume.education.map((entry, index) => (
                <EntryCard
                  key={`education-${index}`}
                  title={`Education ${index + 1}`}
                  onRemove={() => removeEntry('education', index)}
                  removeLabel={`education ${index + 1}`}
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field
                      label="Institution"
                      value={entry.institution}
                      onChange={(value) =>
                        updateEntry('education', index, 'institution', value)
                      }
                      placeholder="e.g. ABC Institute of Technology"
                      error={errors[`education.${index}.institution`]}
                      maxLength={250}
                    />
                    <Field
                      label="Degree"
                      value={entry.degree}
                      onChange={(value) => updateEntry('education', index, 'degree', value)}
                      placeholder="e.g. B.Tech"
                      error={errors[`education.${index}.degree`]}
                      maxLength={250}
                    />
                    <Field
                      label="Field of Study"
                      value={entry.fieldOfStudy}
                      onChange={(value) =>
                        updateEntry('education', index, 'fieldOfStudy', value)
                      }
                      placeholder="e.g. Computer Science"
                      error={errors[`education.${index}.fieldOfStudy`]}
                      maxLength={250}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Field
                        label="Start Year"
                        value={entry.startYear}
                        onChange={(value) =>
                          updateEntry('education', index, 'startYear', value)
                        }
                        placeholder="2021"
                        error={errors[`education.${index}.startYear`]}
                        maxLength={40}
                        inputMode="numeric"
                      />
                      <Field
                        label="End Year"
                        value={entry.endYear}
                        onChange={(value) =>
                          updateEntry('education', index, 'endYear', value)
                        }
                        placeholder="2025"
                        error={errors[`education.${index}.endYear`]}
                        maxLength={40}
                        inputMode="numeric"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Field
                        label="Description"
                        textarea
                        rows={3}
                        value={entry.description}
                        onChange={(value) =>
                          updateEntry('education', index, 'description', value)
                        }
                        placeholder="Relevant coursework, honors, or academic achievements."
                        error={errors[`education.${index}.description`]}
                        maxLength={5000}
                      />
                    </div>
                  </div>
                </EntryCard>
              ))}
            </SectionCard>

            <SectionCard
              icon={Briefcase}
              title="Work Experience"
              description="Showcase your roles, responsibilities, and impact."
              action={
                <AddAnotherButton onClick={() => addEntry('experience')} />
              }
            >
              {resume.experience.map((entry, index) => (
                <EntryCard
                  key={`experience-${index}`}
                  title={`Experience ${index + 1}`}
                  onRemove={() => removeEntry('experience', index)}
                  removeLabel={`experience ${index + 1}`}
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field
                      label="Company"
                      value={entry.company}
                      onChange={(value) =>
                        updateEntry('experience', index, 'company', value)
                      }
                      placeholder="e.g. Acme Corp"
                      error={errors[`experience.${index}.company`]}
                      maxLength={250}
                    />
                    <Field
                      label="Job Title"
                      value={entry.jobTitle}
                      onChange={(value) =>
                        updateEntry('experience', index, 'jobTitle', value)
                      }
                      placeholder="e.g. Software Engineer"
                      error={errors[`experience.${index}.jobTitle`]}
                      maxLength={250}
                    />
                    <Field
                      label="Start Date"
                      value={entry.startDate}
                      onChange={(value) =>
                        updateEntry('experience', index, 'startDate', value)
                      }
                      placeholder="e.g. Jan 2023"
                      error={errors[`experience.${index}.startDate`]}
                      maxLength={80}
                    />
                    <Field
                      label="End Date"
                      value={entry.endDate}
                      onChange={(value) =>
                        updateEntry('experience', index, 'endDate', value)
                      }
                      placeholder="e.g. Present"
                      error={errors[`experience.${index}.endDate`]}
                      maxLength={80}
                    />
                    <div className="sm:col-span-2">
                      <Field
                        label="Responsibilities / Achievements"
                        textarea
                        rows={5}
                        value={entry.responsibilities}
                        onChange={(value) =>
                          updateEntry('experience', index, 'responsibilities', value)
                        }
                        placeholder="Describe what you did and the impact you had. One achievement per line works well."
                        error={errors[`experience.${index}.responsibilities`]}
                        maxLength={6000}
                      />
                    </div>
                  </div>
                </EntryCard>
              ))}
            </SectionCard>

            <SectionCard
              icon={FolderGit2}
              title="Projects"
              description="Highlight projects that demonstrate your skills."
              action={<AddAnotherButton onClick={() => addEntry('projects')} />}
            >
              {resume.projects.map((entry, index) => (
                <EntryCard
                  key={`project-${index}`}
                  title={`Project ${index + 1}`}
                  onRemove={() => removeEntry('projects', index)}
                  removeLabel={`project ${index + 1}`}
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field
                      label="Project Name"
                      value={entry.name}
                      onChange={(value) => updateEntry('projects', index, 'name', value)}
                      placeholder="e.g. ResumeRoast AI"
                      error={errors[`projects.${index}.name`]}
                      maxLength={250}
                    />
                    <Field
                      label="Technologies Used"
                      value={entry.technologies}
                      onChange={(value) =>
                        updateEntry('projects', index, 'technologies', value)
                      }
                      placeholder="React, Node.js, MongoDB"
                      error={errors[`projects.${index}.technologies`]}
                      maxLength={500}
                      hint="Separate each technology with a comma."
                    />
                    <div className="sm:col-span-2">
                      <Field
                        label="Project URL"
                        value={entry.url}
                        onChange={(value) => updateEntry('projects', index, 'url', value)}
                        placeholder="github.com/username/project"
                        error={errors[`projects.${index}.url`]}
                        maxLength={500}
                        inputMode="url"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Field
                        label="Description"
                        textarea
                        rows={4}
                        value={entry.description}
                        onChange={(value) =>
                          updateEntry('projects', index, 'description', value)
                        }
                        placeholder="What the project does, the problem it solves, and your key contributions."
                        error={errors[`projects.${index}.description`]}
                        maxLength={5000}
                      />
                    </div>
                  </div>
                </EntryCard>
              ))}
            </SectionCard>

            <SectionCard
              icon={Wrench}
              title="Technical Skills"
              description="Group your skills so recruiters can scan them quickly."
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label="Programming Languages"
                  value={resume.skills.programmingLanguages}
                  onChange={(value) => updateSkills('programmingLanguages', value)}
                  placeholder="JavaScript, Python, Java"
                  error={errors['skills.programmingLanguages']}
                  maxLength={1000}
                  hint="Separate each skill with a comma."
                />
                <Field
                  label="Frameworks & Libraries"
                  value={resume.skills.frameworks}
                  onChange={(value) => updateSkills('frameworks', value)}
                  placeholder="React, Node.js, Express"
                  error={errors['skills.frameworks']}
                  maxLength={1000}
                  hint="Separate each skill with a comma."
                />
                <Field
                  label="Databases"
                  value={resume.skills.databases}
                  onChange={(value) => updateSkills('databases', value)}
                  placeholder="MongoDB, PostgreSQL, Redis"
                  error={errors['skills.databases']}
                  maxLength={1000}
                  hint="Separate each skill with a comma."
                />
                <Field
                  label="Tools & Platforms"
                  value={resume.skills.tools}
                  onChange={(value) => updateSkills('tools', value)}
                  placeholder="Git, Docker, AWS"
                  error={errors['skills.tools']}
                  maxLength={1000}
                  hint="Separate each skill with a comma."
                />
              </div>
            </SectionCard>

            <SectionCard
              icon={Award}
              title="Certifications"
              description="Add certifications that support your expertise."
              action={
                <AddAnotherButton onClick={() => addEntry('certifications')} />
              }
            >
              {resume.certifications.map((entry, index) => (
                <EntryCard
                  key={`certification-${index}`}
                  title={`Certification ${index + 1}`}
                  onRemove={() => removeEntry('certifications', index)}
                  removeLabel={`certification ${index + 1}`}
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field
                      label="Certification Name"
                      value={entry.name}
                      onChange={(value) =>
                        updateEntry('certifications', index, 'name', value)
                      }
                      placeholder="e.g. AWS Certified Developer"
                      error={errors[`certifications.${index}.name`]}
                      maxLength={250}
                    />
                    <Field
                      label="Issuing Organization"
                      value={entry.organization}
                      onChange={(value) =>
                        updateEntry('certifications', index, 'organization', value)
                      }
                      placeholder="e.g. Amazon Web Services"
                      error={errors[`certifications.${index}.organization`]}
                      maxLength={250}
                    />
                    <div className="sm:col-span-2">
                      <Field
                        label="Date"
                        value={entry.date}
                        onChange={(value) =>
                          updateEntry('certifications', index, 'date', value)
                        }
                        placeholder="e.g. March 2025"
                        error={errors[`certifications.${index}.date`]}
                        maxLength={80}
                      />
                    </div>
                  </div>
                </EntryCard>
              ))}
            </SectionCard>

            <SectionCard
              icon={Trophy}
              title="Achievements"
              description="Optional awards, recognitions, or standout moments."
            >
              <Field
                label="Achievements"
                textarea
                rows={4}
                value={resume.achievements}
                onChange={(value) => updateField('achievements', value)}
                placeholder="e.g. Won Smart India Hackathon 2024; Top 5% in coding contest."
                hint="Optional — one achievement per line works well."
                maxLength={5000}
              />
            </SectionCard>
        </div>

        <div className="flex flex-col justify-end gap-3 border-t border-slate-800 pt-6 sm:flex-row">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-100 transition-colors hover:bg-slate-800"
          >
            <Eye className="h-4 w-4" />
            Preview Resume
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brandPurple px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brandPurple/20 transition-colors hover:bg-brandPurple/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? 'Saving...' : 'Save Resume'}
          </button>
        </div>
      </form>

      {showPreview && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="resume-preview-title"
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/80 p-3 backdrop-blur-sm sm:items-center sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowPreview(false);
          }}
        >
          <div className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white text-slate-900 shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur">
              <div>
                <h2
                  id="resume-preview-title"
                  className="text-sm font-bold uppercase tracking-wider text-slate-900"
                >
                  Resume Preview
                </h2>
                <p className="text-xs text-slate-500">
                  A live preview of your current draft.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                aria-label="Close resume preview"
                className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 sm:p-10">
              <div className="border-b border-slate-200 pb-5 text-center">
                <h3 className="text-2xl font-black tracking-tight text-slate-900">
                  {resume.personalInfo.fullName || 'Your Name'}
                </h3>
                {resume.personalInfo.professionalTitle && (
                  <p className="mt-1 text-sm font-medium text-slate-600">
                    {resume.personalInfo.professionalTitle}
                  </p>
                )}
                {contactItems.length > 0 && (
                  <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-slate-600">
                    {contactItems.map((item, index) => (
                      <span key={`${item}-${index}`}>{item}</span>
                    ))}
                  </div>
                )}
              </div>

              {resume.summary.trim() && (
                <PreviewSection title="Professional Summary">
                  <p className="whitespace-pre-line text-xs leading-relaxed text-slate-700">
                    {resume.summary}
                  </p>
                </PreviewSection>
              )}

              {skillGroups.length > 0 && (
                <PreviewSection title="Technical Skills">
                  {skillGroups.map((group) => (
                    <p key={group.label} className="text-xs leading-relaxed text-slate-700">
                      <span className="font-bold text-slate-900">{group.label}: </span>
                      {splitList(group.value).join(' · ')}
                    </p>
                  ))}
                </PreviewSection>
              )}

              {filledExperience.length > 0 && (
                <PreviewSection title="Work Experience">
                  {filledExperience.map((entry, index) => (
                    <div key={`preview-experience-${index}`}>
                      <div className="flex flex-wrap items-baseline justify-between gap-1">
                        <p className="text-sm font-bold text-slate-900">
                          {entry.jobTitle || 'Job Title'}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {[entry.startDate, entry.endDate].filter(Boolean).join(' - ')}
                        </p>
                      </div>
                      {entry.company && (
                        <p className="text-xs font-medium text-slate-600">{entry.company}</p>
                      )}
                      {entry.responsibilities && (
                        <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-slate-600">
                          {entry.responsibilities}
                        </p>
                      )}
                    </div>
                  ))}
                </PreviewSection>
              )}

              {filledProjects.length > 0 && (
                <PreviewSection title="Projects">
                  {filledProjects.map((entry, index) => (
                    <div key={`preview-project-${index}`}>
                      <div className="flex flex-wrap items-baseline justify-between gap-1">
                        <p className="text-sm font-bold text-slate-900">
                          {entry.name || 'Project Name'}
                        </p>
                        {entry.url && (
                          <p className="break-all text-[11px] text-slate-500">
                            {entry.url}
                          </p>
                        )}
                      </div>
                      {entry.technologies && (
                        <p className="text-xs font-medium text-slate-600">
                          {entry.technologies}
                        </p>
                      )}
                      {entry.description && (
                        <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-slate-600">
                          {entry.description}
                        </p>
                      )}
                    </div>
                  ))}
                </PreviewSection>
              )}

              {filledEducation.length > 0 && (
                <PreviewSection title="Education">
                  {filledEducation.map((entry, index) => (
                    <div key={`preview-education-${index}`}>
                      <div className="flex flex-wrap items-baseline justify-between gap-1">
                        <p className="text-sm font-bold text-slate-900">
                          {entry.institution || 'Institution'}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {[entry.startYear, entry.endYear].filter(Boolean).join(' - ')}
                        </p>
                      </div>
                      {(entry.degree || entry.fieldOfStudy) && (
                        <p className="text-xs font-medium text-slate-600">
                          {[entry.degree, entry.fieldOfStudy].filter(Boolean).join(' · ')}
                        </p>
                      )}
                      {entry.description && (
                        <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-slate-600">
                          {entry.description}
                        </p>
                      )}
                    </div>
                  ))}
                </PreviewSection>
              )}

              {filledCertifications.length > 0 && (
                <PreviewSection title="Certifications">
                  {filledCertifications.map((entry, index) => (
                    <div
                      key={`preview-certification-${index}`}
                      className="flex flex-wrap items-baseline justify-between gap-1"
                    >
                      <p className="text-xs text-slate-700">
                        <span className="font-bold text-slate-900">
                          {entry.name || 'Certification'}
                        </span>
                        {entry.organization ? ` — ${entry.organization}` : ''}
                      </p>
                      {entry.date && (
                        <p className="text-[11px] text-slate-500">{entry.date}</p>
                      )}
                    </div>
                  ))}
                </PreviewSection>
              )}

              {resume.achievements.trim() && (
                <PreviewSection title="Achievements">
                  <p className="whitespace-pre-line text-xs leading-relaxed text-slate-700">
                    {resume.achievements}
                  </p>
                </PreviewSection>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewResumeBuilder;
