import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { analyzeResumeTextLocally } from './localAnalyzer.js';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY?.trim();

const genAI = apiKey && !apiKey.startsWith('your_') ? new GoogleGenAI({ apiKey }) : null;

const safeParseJson = (rawText) => {
  if (!rawText) {
    throw new Error('Empty AI response');
  }

  const cleaned = rawText
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      throw new Error('AI response is not valid JSON');
    }
    const candidate = cleaned.slice(firstBrace, lastBrace + 1);
    return JSON.parse(candidate);
  }
};

/**
 * Analyzes resume plain text against a target job role.
 * Returns a detailed structured evaluation with scores, keyword checks, roasts, and an improved resume layout.
 */
export const analyzeResumeText = async (resumeText, jobRole) => {

  const prompt = `
After analyzing the uploaded resume, calculate an ATS score between 0 and 100.

Return ONLY valid JSON.

Evaluate the resume based on these categories for target job role: "${jobRole}".

- ATS Friendliness (atsFriendliness)
- Resume Quality (resumeQuality)
- Job Match (jobMatch)
- Keyword Match (keywordMatch)
- Skills (skills)
- Projects (projects)
- Experience (experience)
- Education (education)
- Grammar (grammar)
- Spelling (spelling)
- Formatting (formatting)
- Readability (readability)
- Professionalism (professionalism)

For each category return a score between 0-100 inside the "progress" object.

Also return a color inside the "colors" object for each category:
90-100 = "green"
70-89 = "blue"
50-69 = "orange"
0-49 = "red"

Return an overall ATS score in "overallATS" (0-100).

Also return an overall status in "status":
90-100 = "Excellent"
75-89 = "Very Good"
60-74 = "Good"
40-59 = "Needs Improvement"
0-39 = "Poor"

Explain in one sentence why the score was given in "summary".

Return the missing keywords in "missingKeywords" (array of strings).

Return the spelling mistakes in "spellingMistakes" (array of objects with "wrong" and "correct").

Return the grammar mistakes in "grammarMistakes" (array of objects with "text" and "fix").

Return the top 10 improvements in "improvements" (array of strings).

Return recruiter decision in "recruiterDecision" (Choose one: "Reject", "Maybe", "Shortlist", "Strong Shortlist").

Return graph data for the dashboard in "graphData".

Return this exact JSON schema structure:
{
  "overallATS": 82,
  "status": "Very Good",
  "summary": "Your resume is ATS-friendly but missing some important keywords and measurable achievements.",

  "progress": {
    "atsFriendliness": 82,
    "resumeQuality": 85,
    "jobMatch": 78,
    "keywordMatch": 70,
    "skills": 88,
    "projects": 76,
    "experience": 69,
    "education": 92,
    "grammar": 95,
    "spelling": 100,
    "formatting": 83,
    "readability": 87,
    "professionalism": 90
  },

  "colors": {
    "atsFriendliness": "blue",
    "resumeQuality": "blue",
    "jobMatch": "blue",
    "keywordMatch": "orange",
    "skills": "blue",
    "projects": "blue",
    "experience": "orange",
    "education": "green",
    "grammar": "green",
    "spelling": "green",
    "formatting": "blue",
    "readability": "blue",
    "professionalism": "green"
  },

  "missingKeywords": [
    "Spring Boot",
    "Docker",
    "REST API"
  ],

  "grammarMistakes": [
    {
      "text": "Develop web application",
      "fix": "Developed web applications"
    }
  ],

  "spellingMistakes": [
    {
      "wrong": "Experiance",
      "correct": "Experience"
    }
  ],

  "improvements": [
    "Add measurable achievements",
    "Improve project descriptions",
    "Add GitHub links",
    "Add portfolio link",
    "Use stronger action verbs",
    "Add certifications",
    "Improve summary",
    "Include ATS keywords",
    "Use consistent formatting",
    "Reduce unnecessary text"
  ],

  "recruiterDecision": "Shortlist",

  "graphData": {
    "atsFriendliness": 82,
    "resumeQuality": 85,
    "jobMatch": 78,
    "keywordMatch": 70,
    "skills": 88,
    "projects": 76,
    "experience": 69,
    "education": 92,
    "grammar": 95,
    "spelling": 100,
    "formatting": 83,
    "readability": 87,
    "professionalism": 90
  },

  "honestRoast": "Honest constructive roast text here.",
  "atsScore": 82,
  "improvedResume": {
    "summary": "Professional profile summary...",
    "skills": ["Skill 1", "Skill 2"],
    "experience": [
      { "company": "", "role": "", "duration": "", "description": [] }
    ],
    "projects": [
      { "title": "", "techStack": [], "description": [], "link": "" }
    ],
    "education": [
      { "institution": "", "degree": "", "duration": "", "gpa": "" }
    ],
    "achievements": [],
    "certifications": []
  }
}

Resume Text:
${resumeText}
`;

  try {
    if (!genAI) {
      console.warn('Gemini API Key missing or invalid. Using local analyzer fallback.');
      return analyzeResumeTextLocally(resumeText, jobRole);
    }

    const response = await genAI.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    const text = response.text;
    const parsed = safeParseJson(text);

    // Enforce score, color, and status rules
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

    const overallATS = Number(parsed.overallATS ?? parsed.atsScore ?? 70);
    parsed.overallATS = overallATS;
    parsed.atsScore = overallATS;
    parsed.status = getStatus(overallATS);

    const categories = [
      'atsFriendliness', 'resumeQuality', 'jobMatch', 'keywordMatch',
      'skills', 'projects', 'experience', 'education', 'grammar',
      'spelling', 'formatting', 'readability', 'professionalism'
    ];

    parsed.progress = parsed.progress || {};
    parsed.colors = parsed.colors || {};

    categories.forEach(cat => {
      if (parsed.progress[cat] === undefined || parsed.progress[cat] === null) {
        parsed.progress[cat] = overallATS;
      }
      parsed.colors[cat] = getColor(parsed.progress[cat]);
    });

    if (!parsed.summary) {
      parsed.summary = `Your resume has an ATS score of ${overallATS}/100 for the ${jobRole} position.`;
    }

    if (!Array.isArray(parsed.missingKeywords)) {
      parsed.missingKeywords = [];
    }

    if (!Array.isArray(parsed.grammarMistakes)) {
      parsed.grammarMistakes = [];
    } else {
      parsed.grammarMistakes = parsed.grammarMistakes.map(g => ({
        text: g.text || g.original || '',
        fix: g.fix || g.correction || ''
      }));
    }

    if (!Array.isArray(parsed.spellingMistakes)) {
      parsed.spellingMistakes = [];
    } else {
      parsed.spellingMistakes = parsed.spellingMistakes.map(s => ({
        wrong: s.wrong || s.wrongWord || '',
        correct: s.correct || s.correctWord || ''
      }));
    }

    if (!Array.isArray(parsed.improvements)) {
      parsed.improvements = [
        "Add measurable achievements",
        "Improve project descriptions",
        "Add GitHub links",
        "Add portfolio link",
        "Use stronger action verbs",
        "Add certifications",
        "Improve summary",
        "Include ATS keywords",
        "Use consistent formatting",
        "Reduce unnecessary text"
      ];
    }

    const validDecisions = ["Reject", "Maybe", "Shortlist", "Strong Shortlist"];
    if (!validDecisions.includes(parsed.recruiterDecision)) {
      parsed.recruiterDecision = overallATS >= 85 ? "Strong Shortlist" : overallATS >= 70 ? "Shortlist" : overallATS >= 50 ? "Maybe" : "Reject";
    }

    if (!parsed.graphData) {
      parsed.graphData = {
        atsFriendliness: parsed.progress.atsFriendliness,
        resumeQuality: parsed.progress.resumeQuality,
        jobMatch: parsed.progress.jobMatch,
        keywordMatch: parsed.progress.keywordMatch,
        skills: parsed.progress.skills,
        projects: parsed.progress.projects,
        experience: parsed.progress.experience,
        education: parsed.progress.education,
        grammar: parsed.progress.grammar,
        spelling: parsed.progress.spelling,
        formatting: parsed.progress.formatting,
        readability: parsed.progress.readability,
        professionalism: parsed.progress.professionalism
      };
    }

    return parsed;
  } catch (error) {
    console.error('Gemini Analysis API Error:', error.message || error);
    console.warn('Falling back to local resume analyzer...');
    return analyzeResumeTextLocally(resumeText, jobRole);
  }
};

/**
 * Rewrites a single section in the improved resume structure according to instructions.
 * Returns the entire updated improvedResume object.
 */
export const rewriteResumeSection = async (currentResumeData, sectionName, instruction) => {
  const prompt = `
You are an expert resume writer. You are provided with the current state of a structured resume's "improvedResume" data.
Your task is to rewrite the section "${sectionName}" according to this instruction: "${instruction}".

Improve and refine the targeted section, keeping it professional, ATS-friendly, and grammatically perfect. Use action verbs and include metrics where possible.

Return the entire updated "improvedResume" object in JSON format containing all sections. Update only the "${sectionName}" section (and make minor formatting adjustments elsewhere only if necessary for coherence), leaving the rest of the sections unchanged.

Here is the current "improvedResume" data:
${JSON.stringify(currentResumeData, null, 2)}

Ensure the returned JSON structure is a single object with the exact keys:
"summary", "skills", "experience", "projects", "education", "achievements", "certifications"
`;

  try {
    if (!genAI) {
      return currentResumeData;
    }
    const response = await genAI.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    const text = response.text;
    return safeParseJson(text);
  } catch (error) {
    console.error('Gemini Rewrite API Error:', error);
    return currentResumeData;
  }
};

export const rewriteEntireResume = async (currentResumeData, jobRole) => {

  const prompt = `
You are an expert resume writer and ATS optimizer.
You are provided with the current state of a structured resume's "improvedResume" data. Optimize the entire resume for the target job role: "${jobRole}".

Rules:
- Keep it ATS-friendly and professional.
- Use action verbs and add measurable metrics only when they are clearly implied by the existing content. Do not fabricate.
- Do not invent fake employers, colleges, certifications, links, dates, or metrics.

Return ONLY a single JSON object for the updated "improvedResume" with the exact keys:
"summary", "skills", "experience", "projects", "education", "achievements", "certifications"

Current "improvedResume":
${JSON.stringify(currentResumeData, null, 2)}
`;

  try {
    if (!genAI) {
      return safeParseJson(JSON.stringify(currentResumeData));
    }
    const response = await genAI.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    const text = response.text;
    return safeParseJson(text);
  } catch (error) {
    console.error('Gemini Rewrite All API Error:', error);
    return currentResumeData;
  }
};

export const executeSectionAIAction = async (sectionName, actionType, content, jobRole = '') => {
  const instructionsMap = {
    generate: `Generate high-quality, professional, ATS-optimized content for section "${sectionName}" tailored for target job role "${jobRole}". Include industry standard keywords, strong action verbs, and quantifiable metrics.`,
    fix: 'Fix all grammar, spelling, and punctuation errors, keeping the factual meaning intact.',
    rewrite: 'Rewrite with strong action verbs and high impact phrasing while preserving key details.',
    improve: 'Enhance clarity, formatting, and overall quality for modern tech recruiters.',
    expand: 'Expand this content slightly with relevant context, keywords, and professional details.',
    shorten: 'Condense and shorten this content to be concise and punchy without losing key achievements.',
    professional_tone: 'Rephrase to ensure an executive, highly professional tone suitable for senior recruiters.',
    ats_optimize: `Optimize specifically for ATS parsing and search relevance for target role: "${jobRole}". Include core skills and technical terminology.`,
    add_metrics: `Enhance content by incorporating realistic, quantifiable metrics, percentages, throughput numbers, latency reductions, and business impact metrics suitable for "${jobRole}".`,
    suggest_skills: `Based on target job role "${jobRole}", provide a list of top recommended technical and soft skills.`,
    suggest_certifications: `Based on target job role "${jobRole}", provide a list of top recognized certifications with organization names.`,
    suggest_coursework: `Based on target job role "${jobRole}", suggest 5-8 relevant academic computer science/engineering courses.`
  };

  const actionInstruction = instructionsMap[actionType] || instructionsMap.improve;

  const prompt = `
You are an expert ATS Resume Optimization Specialist & Senior Technical Recruiter.
Target Role: "${jobRole || 'Software Engineer'}"
Section: "${sectionName}"
Action: "${actionType}"
Instruction: "${actionInstruction}"

Content to process:
${typeof content === 'object' ? JSON.stringify(content, null, 2) : String(content)}

Return ONLY valid JSON with a single key "updatedContent".
- If input content was a string, "updatedContent" MUST be a string (or markdown formatted bullet points if bullet list).
- If input content was an array or object, "updatedContent" MUST be an array or object matching that structure.
`;

  try {
    if (!genAI) {
      return content;
    }
    const response = await genAI.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    const parsed = safeParseJson(response.text);
    return parsed.updatedContent !== undefined ? parsed.updatedContent : content;
  } catch (err) {
    console.error('AI Section Action error:', err);
    return content;
  }
};

