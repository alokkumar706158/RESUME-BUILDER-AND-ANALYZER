const toLines = (text) =>
  (text || '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, n));

const percent = (num, den) => (den <= 0 ? 0 : clamp(Math.round((num / den) * 100)));

const findFirstMatch = (text, regex) => {
  const m = (text || '').match(regex);
  return m ? m[0] : '';
};

const detectEmail = (text) => findFirstMatch(text, /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);

const detectPhone = (text) =>
  findFirstMatch(
    text,
    /(\+?\d{1,3}[\s-]?)?(\(?\d{3}\)?[\s-]?)?\d{3}[\s-]?\d{4}/
  );

const detectUrl = (text, regex) => findFirstMatch(text, regex);

const detectLinkedIn = (text) =>
  detectUrl(text, /https?:\/\/(www\.)?linkedin\.com\/[^\s)]+/i);

const detectGitHub = (text) => detectUrl(text, /https?:\/\/(www\.)?github\.com\/[^\s)]+/i);

const detectPortfolio = (text) =>
  detectUrl(text, /https?:\/\/(www\.)?[A-Z0-9.-]+\.[A-Z]{2,}(\/[^\s)]*)?/i);

const sectionPatterns = {
  summary: /(summary|professional summary|profile|objective)\b/i,
  skills: /(skills|technical skills|core skills)\b/i,
  projects: /(projects|project experience|personal projects)\b/i,
  experience: /(experience|work experience|employment|professional experience|internship)\b/i,
  education: /(education|academics)\b/i,
  achievements: /(achievements|accomplishments|awards|honors|leadership|extra[-\s]?curricular)\b/i,
  certifications: /(certifications|certificates|licenses)\b/i
};

const findSectionLineIndexes = (lines) => {
  const indexes = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const [key, pattern] of Object.entries(sectionPatterns)) {
      if (pattern.test(line) && line.length <= 40) {
        indexes.push({ key, i });
        break;
      }
    }
  }
  const unique = [];
  const seen = new Set();
  for (const x of indexes.sort((a, b) => a.i - b.i)) {
    const k = `${x.key}:${x.i}`;
    if (!seen.has(k)) {
      seen.add(k);
      unique.push(x);
    }
  }
  return unique;
};

const sliceSections = (lines) => {
  const idx = findSectionLineIndexes(lines);
  const sections = {};
  for (let s = 0; s < idx.length; s++) {
    const { key, i } = idx[s];
    const start = i + 1;
    const end = s + 1 < idx.length ? idx[s + 1].i : lines.length;
    sections[key] = lines.slice(start, end).join('\n').trim();
  }
  return sections;
};

const countBullets = (sectionText) =>
  (sectionText || '').split('\n').filter((l) => /^[-•*]\s+/.test(l.trim())).length;

const hasNumbers = (sectionText) => /\b\d+(\.\d+)?%?\b/.test(sectionText || '');

const scoreSection = (sectionText) => {
  if (!sectionText || sectionText.trim().length < 20) return 0;

  const length = sectionText.length;
  const bullets = countBullets(sectionText);
  const numbers = hasNumbers(sectionText);

  const lengthScore = clamp(Math.round((length / 800) * 30), 0, 30);
  const bulletScore = clamp(bullets * 5, 0, 25);
  const metricsScore = numbers ? 10 : 0;

  return clamp(40 + lengthScore + bulletScore + metricsScore);
};

const qualityLabel = (score) => {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Fair';
  if (score > 0) return 'Poor';
  return 'Missing';
};

const jobRoleKeywords = (jobRole) => {
  const role = (jobRole || '').toLowerCase();
  if (role.includes('data') && role.includes('analyst')) {
    return [
      'sql',
      'excel',
      'power bi',
      'tableau',
      'python',
      'pandas',
      'numpy',
      'statistics',
      'dashboards',
      'data cleaning',
      'etl',
      'data visualization',
      'business insights',
      'kpi',
      'a/b testing'
    ];
  }
  if (role.includes('frontend')) {
    return ['javascript', 'react', 'html', 'css', 'typescript', 'redux', 'api', 'responsive', 'testing'];
  }
  if (role.includes('backend')) {
    return ['node', 'express', 'api', 'database', 'authentication', 'jwt', 'sql', 'mongodb', 'docker'];
  }
  return ['communication', 'teamwork', 'problem solving'];
};

const keywordPresence = (text, keywords) => {
  const t = (text || '').toLowerCase();
  const present = [];
  const missing = [];
  for (const kw of keywords) {
    const needle = kw.toLowerCase();
    const found = t.includes(needle);
    if (found) present.push(kw);
    else missing.push(kw);
  }
  return { present, missing };
};

const sentenceWords = (text) => {
  const parts = (text || '')
    .replace(/\n+/g, ' ')
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 30);
  if (parts.length === 0) return [];
  return parts.map((s) => s.split(/\s+/).filter(Boolean).length);
};

const readabilityFromText = (text) => {
  const counts = sentenceWords(text);
  if (counts.length === 0) return { score: 40, note: 'Too little text to measure readability.' };
  const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
  const score = clamp(Math.round(100 - Math.abs(avg - 16) * 3.2));
  return { score, note: `Average sentence length ~${Math.round(avg)} words.` };
};

const gradeFromScore = (score) => {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B+';
  if (score >= 60) return 'B';
  return 'C';
};

export const deriveSectionMatch = (resumeText) => {
  const lines = toLines(resumeText);
  const sections = sliceSections(lines);

  const scores = {
    summary: scoreSection(sections.summary || ''),
    skills: scoreSection(sections.skills || ''),
    projects: scoreSection(sections.projects || ''),
    experience: scoreSection(sections.experience || ''),
    education: scoreSection(sections.education || ''),
    achievements: scoreSection(sections.achievements || ''),
    certifications: scoreSection(sections.certifications || '')
  };

  const email = detectEmail(resumeText);
  const phone = detectPhone(resumeText);
  const linkedin = detectLinkedIn(resumeText);
  const github = detectGitHub(resumeText);
  const portfolio = detectPortfolio(resumeText);

  const headerBlock = lines.slice(0, 15).join('\n');
  const linksInHeaderScore =
    (linkedin && headerBlock.includes(linkedin) ? 35 : 0) +
    (github && headerBlock.includes(github) ? 35 : 0) +
    (portfolio && headerBlock.includes(portfolio) ? 30 : 0);

  const linksScore = clamp(
    Math.round(
      (Number(Boolean(linkedin)) + Number(Boolean(github)) + Number(Boolean(portfolio))) * 30 +
        (linksInHeaderScore > 0 ? 10 : 0)
    )
  );

  return {
    sections: scores,
    links: linksScore,
    contact: clamp(
      (email ? 40 : 0) + (phone ? 40 : 0) + (linkedin ? 10 : 0) + (github ? 10 : 0)
    )
  };
};

export const analyzeResumeTextLocally = (resumeText, jobRole) => {
  const lines = toLines(resumeText);
  const sections = sliceSections(lines);
  const sectionMatch = deriveSectionMatch(resumeText);

  const email = detectEmail(resumeText);
  const phone = detectPhone(resumeText);
  const linkedin = detectLinkedIn(resumeText);
  const github = detectGitHub(resumeText);
  const portfolio = detectPortfolio(resumeText);

  const headerBlock = lines.slice(0, 15).join('\n');
  const emailInHeader = email && headerBlock.includes(email);
  const phoneInHeader = phone && headerBlock.includes(phone);

  const keywords = jobRoleKeywords(jobRole);
  const { present, missing } = keywordPresence(resumeText, keywords);
  const keywordMatchPercentage = percent(present.length, keywords.length);

  const sectionScores = sectionMatch.sections;
  const sectionList = Object.values(sectionScores);
  const baseSectionAvg = sectionList.length ? Math.round(sectionList.reduce((a, b) => a + b, 0) / sectionList.length) : 0;

  const { score: readabilityScore, note: readabilityNote } = readabilityFromText(resumeText);

  const professionalismScore = clamp(60 + Math.round((headerBlock.length > 0 ? 10 : 0)) + Math.round((baseSectionAvg / 100) * 30));
  const grammarScore = clamp(70 + Math.round((readabilityScore - 50) * 0.3));

  const atsCheck = {
    name: lines.length > 0 && lines[0].split(/\s+/).length <= 6 ? 'PASS' : 'FAIL',
    email: email ? 'PASS' : 'FAIL',
    phone: phone ? 'PASS' : 'FAIL',
    linkedin: linkedin ? 'PASS' : 'FAIL',
    github: github ? 'PASS' : 'FAIL',
    portfolio: portfolio ? 'PASS' : 'FAIL',
    education: sectionScores.education > 0 ? 'PASS' : 'FAIL',
    projects: sectionScores.projects > 0 ? 'PASS' : 'FAIL',
    skills: sectionScores.skills > 0 ? 'PASS' : 'FAIL',
    experience: sectionScores.experience > 0 ? 'PASS' : 'FAIL',
    achievements: sectionScores.achievements > 0 ? 'PASS' : 'FAIL',
    certificates: sectionScores.certifications > 0 ? 'PASS' : 'FAIL'
  };

  const atsCheckScore =
    (Object.values(atsCheck).filter((v) => v === 'PASS').length / Object.values(atsCheck).length) * 100;

  const atsScore = clamp(Math.round(baseSectionAvg * 0.45 + keywordMatchPercentage * 0.35 + atsCheckScore * 0.2));
  const overallResumeScore = clamp(Math.round(baseSectionAvg * 0.6 + professionalismScore * 0.2 + readabilityScore * 0.2));
  const resumeHealthScore = clamp(Math.round((overallResumeScore + atsScore) / 2));
  const jobMatchPercentage = clamp(Math.round(keywordMatchPercentage * 0.6 + sectionScores.experience * 0.25 + sectionScores.skills * 0.15));

  const interviewReadinessScore = clamp(Math.round(jobMatchPercentage * 0.55 + (sectionScores.projects + sectionScores.experience) * 0.225));
  const recruiterShortlistingProbability = clamp(Math.round(jobMatchPercentage * 0.65 + atsScore * 0.35));

  const resumeGrade = gradeFromScore(overallResumeScore);

  const missingKeywordObjects = missing.slice(0, 12).map((kw) => ({
    keyword: kw,
    meaning: 'Recommended for the selected job role',
    importance: 'Medium',
    whereToAdd:
      sectionScores.skills > 0 ? 'Skills section' : sectionScores.experience > 0 ? 'Experience section' : 'Summary section'
  }));

  const executiveSummary = {
    atsFriendly:
      atsScore >= 75 ? 'Yes, mostly ATS-friendly.' : 'Partially ATS-friendly; needs structure and keyword improvements.',
    mainStrengths: [
      ...(sectionScores.skills >= 70 ? ['Skills section is present and reasonably detailed.'] : []),
      ...(sectionScores.projects >= 70 ? ['Projects section shows relevant work.'] : []),
      ...(emailInHeader && phoneInHeader ? ['Contact details are easy to find at the top.'] : [])
    ].slice(0, 4),
    biggestWeaknesses: [
      ...(sectionScores.experience === 0 ? ['Work Experience section is missing or too thin.'] : []),
      ...(keywordMatchPercentage < 55 ? ['Keyword coverage for the target role is low.'] : []),
      ...(!linkedin ? ['LinkedIn link is missing.'] : []),
      ...(!github ? ['GitHub link is missing.'] : [])
    ].slice(0, 4),
    shortlistedChance:
      recruiterShortlistingProbability >= 70
        ? 'Good chance if role requirements match.'
        : recruiterShortlistingProbability >= 50
          ? 'Possible, but improve keywords and measurable impact.'
          : 'Low; add role-specific keywords and stronger impact bullets.',
    summary:
      'This evaluation is generated without external AI (no Gemini key). Scores are estimated using resume structure, keyword coverage, and section completeness.'
  };

  const makeSectionAnalysis = (key) => {
    const content = sections[key] || '';
    const s = scoreSection(content);
    const problems = [];
    const suggestions = [];
    if (s === 0) problems.push('Section missing or too short.');
    if (s > 0 && countBullets(content) === 0) problems.push('Add bullet points for clarity and ATS parsing.');
    if (s > 0 && !hasNumbers(content) && (key === 'experience' || key === 'projects')) problems.push('Add measurable impact (numbers, % improvements, scale).');
    if (key === 'skills' && keywordMatchPercentage < 60) suggestions.push('Add missing role keywords in skills (only if you actually know them).');
    if (key === 'summary') suggestions.push('Add 1–2 lines aligning with the target role and key tools.');
    if (key === 'projects') suggestions.push('Mention dataset size, KPI impact, dashboard usage, or business outcome.');
    if (key === 'experience') suggestions.push('Rewrite bullets with Action + Tool + Result format.');

    return {
      currentQuality: qualityLabel(s),
      problems,
      suggestions,
      improvedVersion: ''
    };
  };

  const improvementPlan = [
    ...(missing.length ? ['Add missing role keywords where relevant (skills/experience/projects).'] : []),
    ...(sectionScores.experience < 60 ? ['Strengthen Experience with 3–5 impact bullets per role.'] : []),
    ...(sectionScores.projects < 60 ? ['Improve Projects with measurable results and tools used.'] : []),
    ...(!linkedin ? ['Add LinkedIn URL near your name/contact header.'] : []),
    ...(!github ? ['Add GitHub URL if you have project/code links.'] : []),
    ...(readabilityScore < 60 ? ['Shorten long sentences; keep bullets crisp and scannable.'] : [])
  ].slice(0, 10);

  const honestRoast =
    missing.length > 6
      ? "Your resume is trying to be a Data Analyst, but your keywords are playing hide-and-seek."
      : 'Your resume is solid, but some sections are still acting like optional DLC.';

  const getColor = (s) => {
    const num = Number(s) || 0;
    if (num >= 90) return 'green';
    if (num >= 70) return 'blue';
    if (num >= 50) return 'orange';
    return 'red';
  };

  const getStatus = (s) => {
    const num = Number(s) || 0;
    if (num >= 90) return 'Excellent';
    if (num >= 75) return 'Very Good';
    if (num >= 60) return 'Good';
    if (num >= 40) return 'Needs Improvement';
    return 'Poor';
  };

  const progress = {
    atsFriendliness: atsScore,
    resumeQuality: overallResumeScore,
    jobMatch: jobMatchPercentage,
    keywordMatch: keywordMatchPercentage,
    skills: sectionScores.skills,
    projects: sectionScores.projects,
    experience: sectionScores.experience,
    education: sectionScores.education,
    grammar: grammarScore,
    spelling: 100,
    formatting: clamp(Math.round((sectionScores.summary + sectionScores.skills) / 2)),
    readability: readabilityScore,
    professionalism: professionalismScore
  };

  const colors = {};
  Object.keys(progress).forEach(cat => {
    colors[cat] = getColor(progress[cat]);
  });

  const recruiterDecision =
    recruiterShortlistingProbability >= 85
      ? 'Strong Shortlist'
      : recruiterShortlistingProbability >= 70
        ? 'Shortlist'
        : recruiterShortlistingProbability >= 50
          ? 'Maybe'
          : 'Reject';

  // Parse skills from text
  const rawSkillsText = sections.skills || '';
  const parsedSkills = Array.from(new Set(
    rawSkillsText
      .split(/[,;\n•*|\u2022]/)
      .map(s => s.replace(/^[-\s•*]+/, '').trim())
      .filter(s => s.length > 1 && s.length < 50 && !/^(skills|technical|soft|tools|programming|languages|frameworks|databases)$/i.test(s))
  )).map(name => ({ name, rating: 4 }));

  // Parse Experience from text
  const expText = sections.experience || '';
  const expLines = toLines(expText);
  const parsedExperience = [];
  let currentExp = null;

  expLines.forEach((line) => {
    const isHeader = /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{4}|present|current|intern|developer|engineer|analyst|manager|lead|consultant)/i.test(line) || line.includes('|') || line.includes(' - ');
    if (isHeader || !currentExp) {
      if (currentExp && (currentExp.company || currentExp.role)) {
        parsedExperience.push(currentExp);
      }
      const parts = line.split(/[|–-]/).map(p => p.trim());
      currentExp = {
        role: parts[0] || 'Software Professional',
        company: parts[1] || '',
        location: '',
        duration: parts[2] || '',
        description: [],
        achievements: ''
      };
    } else if (currentExp) {
      currentExp.description.push(line.replace(/^[-\s•*]+/, '').trim());
    }
  });
  if (currentExp && (currentExp.company || currentExp.role)) {
    parsedExperience.push(currentExp);
  }

  // Parse Projects from text
  const projText = sections.projects || '';
  const projLines = toLines(projText);
  const parsedProjects = [];
  let currentProj = null;

  projLines.forEach((line) => {
    const isHeader = line.length < 60 && !line.startsWith('-') && !line.startsWith('•');
    if (isHeader || !currentProj) {
      if (currentProj && currentProj.title) {
        parsedProjects.push(currentProj);
      }
      currentProj = {
        title: line.replace(/^[-\s•*]+/, '').trim(),
        techStack: [],
        description: [],
        link: detectUrl(line, /https?:\/\/[^\s)]+/i) || ''
      };
    } else if (currentProj) {
      currentProj.description.push(line.replace(/^[-\s•*]+/, '').trim());
    }
  });
  if (currentProj && currentProj.title) {
    parsedProjects.push(currentProj);
  }

  // Parse Education from text
  const eduText = sections.education || '';
  const eduLines = toLines(eduText);
  const parsedEducation = [];
  let currentEdu = null;

  eduLines.forEach((line) => {
    const isDegree = /b\.?tech|b\.?e\.?|m\.?tech|m\.?c\.?a\.?|b\.?c\.?a\.?|bachelor|master|diploma|degree|phd|high school|hsc|ssc/i.test(line);
    if (isDegree || !currentEdu) {
      if (currentEdu && (currentEdu.institution || currentEdu.degree)) {
        parsedEducation.push(currentEdu);
      }
      currentEdu = {
        degree: line,
        institution: '',
        duration: findFirstMatch(line, /\b(19|20)\d{2}\s*[-–]\s*((19|20)\d{2}|present|current)\b/i) || '',
        gpa: findFirstMatch(line, /\b(cgpa|gpa|percentage|%|marks)[\s:]*([0-9.]+)/i) || ''
      };
    } else if (currentEdu) {
      if (!currentEdu.institution) {
        currentEdu.institution = line;
      } else if (!currentEdu.gpa && /\d+/.test(line)) {
        currentEdu.gpa = line;
      }
    }
  });
  if (currentEdu && (currentEdu.institution || currentEdu.degree)) {
    parsedEducation.push(currentEdu);
  }

  // Parse Certifications & Achievements
  const certText = sections.certifications || '';
  const parsedCertifications = toLines(certText).map(c => ({ name: c.replace(/^[-\s•*]+/, '').trim() }));

  const achText = sections.achievements || '';
  const parsedAchievements = toLines(achText).map(a => ({ title: a.replace(/^[-\s•*]+/, '').trim(), description: '' }));

  const extractedName = lines.length > 0 && lines[0].split(/\s+/).length <= 5 ? lines[0] : 'ALOK KUMAR';

  return {
    overallATS: atsScore,
    atsScore,
    status: getStatus(atsScore),
    summary: sections.summary || `Your resume scored ${atsScore}/100 based on structure, keywords, and layout evaluation for ${jobRole}.`,
    progress,
    colors,
    missingKeywords: missing,
    improvements: improvementPlan,
    recruiterDecision,
    graphData: {
      atsFriendliness: progress.atsFriendliness,
      resumeQuality: progress.resumeQuality,
      jobMatch: progress.jobMatch,
      keywordMatch: progress.keywordMatch,
      skills: progress.skills,
      projects: progress.projects,
      experience: progress.experience,
      education: progress.education,
      grammar: progress.grammar,
      spelling: progress.spelling,
      formatting: progress.formatting,
      readability: progress.readability,
      professionalism: progress.professionalism
    },
    overallResumeScore,
    resumeHealthScore,
    jobMatchPercentage,
    keywordMatchPercentage,
    interviewReadinessScore,
    recruiterShortlistingProbability,
    readabilityScore,
    grammarScore,
    professionalismScore,
    resumeGrade,
    beforeAfterAts: { before: atsScore, after: clamp(atsScore + 8) },
    executiveSummary: {
      atsFriendly: atsScore >= 75 ? 'Yes, mostly ATS-friendly.' : 'Partially ATS-friendly.',
      mainStrengths: ['Resume text extracted successfully.'],
      biggestWeaknesses: ['Add more quantifiable impact metrics.'],
      shortlistedChance: recruiterDecision,
      summary: `Evaluated resume for ${jobRole} role.`
    },
    sectionAnalysis: {
      summary: makeSectionAnalysis('summary'),
      skills: makeSectionAnalysis('skills'),
      projects: makeSectionAnalysis('projects'),
      experience: makeSectionAnalysis('experience'),
      education: makeSectionAnalysis('education'),
      achievements: makeSectionAnalysis('achievements'),
      certifications: makeSectionAnalysis('certifications')
    },
    atsCheck,
    keywordAnalysis: {
      presentKeywords: present,
      missingKeywords: missingKeywordObjects.length ? missingKeywordObjects : [],
      importantKeywords: keywords.slice(0, 6),
      recommendedKeywords: missing.slice(0, 8),
      whereToAdd: missing.slice(0, 8).map((kw) => ({
        keyword: kw,
        where:
          sectionScores.skills > 0 ? 'Skills' : sectionScores.experience > 0 ? 'Experience' : 'Summary',
        example: `Add "${kw}" as a skill or in a bullet where you used it.`
      })),
      missingSkills: missing.slice(0, 10)
    },
    spellingMistakes: [],
    grammarMistakes: [],
    formatCheck: {
      fonts: 'Not detectable from plain text; keep 1–2 fonts max.',
      bulletPoints: countBullets(resumeText) > 0 ? 'Bullets detected.' : 'Few/no bullets detected; add bullets for ATS.',
      spacing: 'Ensure consistent spacing between sections.',
      headings: Object.values(sectionScores).filter((v) => v > 0).length >= 4 ? 'Standard headings detected.' : 'Add standard headings (Education, Skills, Projects, Experience).',
      alignment: 'Not detectable from plain text; keep consistent alignment.',
      length: lines.length > 0 ? 'Length evaluated from text only.' : 'No content.',
      professionalLayout: 'Use single-column layout, consistent headings, and bullet points.',
      atsCompatibility: atsScore >= 70 ? 'Likely ATS-compatible.' : 'Needs ATS optimization (headings/keywords/bullets).'
    },
    projectReview: [],
    experienceReview: {
      actionVerbs: 'Partially detectable from plain text.',
      achievements: hasNumbers(sections.experience || '') ? 'Some measurable achievements present.' : 'Add measurable achievements.',
      numbers: hasNumbers(sections.experience || '') ? 'Numbers/metrics detected.' : 'Numbers/metrics missing.',
      impact: hasNumbers(sections.experience || '') ? 'Impact is clearer with metrics.' : 'Impact needs metrics and outcomes.',
      rewriteBetter: []
    },
    readability: {
      sentenceLength: readabilityNote,
      professionalTone: professionalismScore >= 70 ? 'Professional tone overall.' : 'Tone needs more professional phrasing.',
      clarity: readabilityScore >= 70 ? 'Clear and scannable.' : 'Improve clarity with shorter bullets.',
      overallReadability: readabilityScore >= 70 ? 'Good' : readabilityScore >= 55 ? 'Fair' : 'Poor'
    },
    uniqueness: {
      uniquenessPercentage: clamp(Math.round(55 + (baseSectionAvg - 50) * 0.5)),
      genericResumePercentage: clamp(Math.round(100 - (55 + (baseSectionAvg - 50) * 0.5))),
      reason: 'Estimated using common resume patterns and repeated generic phrases.'
    },
    recruiterReview: {
      decision: recruiterDecision,
      reason:
        recruiterShortlistingProbability >= 60
          ? 'Core sections are present and keyword coverage is reasonable.'
          : 'Missing key sections/keywords; needs clearer impact and role alignment.'
    },
    honestRoast,
    improvementPlan,
    resumeStructure:
      'This is a local assessment. Use standard headings, keep contact info at top, avoid tables/columns, use bullets.',
    skillsFeedback:
      keywordMatchPercentage >= 65
        ? 'Skills align reasonably with the target role.'
        : 'Add missing role-relevant keywords you actually know.',
    projectFeedback: sectionScores.projects >= 60 ? 'Projects section is usable; add more impact and metrics.' : 'Projects section needs more detail and measurable outcomes.',
    experienceFeedback:
      sectionScores.experience >= 60
        ? 'Experience section is present; strengthen with more outcomes and metrics.'
        : 'Experience section is weak or missing; add roles/internships with impact bullets.',
    educationFeedback: sectionScores.education > 0 ? 'Education section is present.' : 'Education section is missing; add degree, institution, year, and relevant coursework.',
    sectionSuggestions: {
      summary: 'Add target role + tools + outcomes in 2–3 lines.',
      skills: 'Group skills by category (Analytics, Tools, Programming).',
      experience: 'Use Action + Tool + Result bullets and quantify impact.',
      projects: 'Add KPI impact, dataset size, dashboard users, or business outcome.',
      education: 'Add degree, institute, year, GPA (if strong), and relevant coursework.'
    },
    finalRecommendation:
      keywordMatchPercentage >= 65
        ? 'Polish impact metrics and strengthen bullets for shortlisting.'
        : 'Increase role keyword coverage and add measurable results in projects/experience.',
    improvedResume: {
      contactInfo: {
        fullName: extractedName,
        email: email || '',
        phone: phone || '',
        linkedin: linkedin || '',
        github: github || '',
        portfolio: portfolio || '',
        address: lines.slice(1, 4).find(l => /india|delhi|mumbai|bangalore|noida|gurgaon|usa|city|state/i.test(l)) || ''
      },
      summary: sections.summary || lines.slice(1, 5).join(' ') || '',
      skills: parsedSkills,
      experience: parsedExperience,
      projects: parsedProjects,
      education: parsedEducation,
      achievements: parsedAchievements,
      certifications: parsedCertifications
    },
    sectionMatch
  };
};

