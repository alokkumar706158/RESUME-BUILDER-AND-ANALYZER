import { jsPDF } from 'jspdf';

// Known dummy links to filter out
const DUMMY_LINK_PATTERNS = [
  'linkedin.com/in/alokkumar',
  'github.com/alokkumar',
  'alokkumar.dev',
  'linkedin.com/in/myprofile',
  'github.com/mygithub'
];

/**
 * Extracts and deduplicates clean contact links.
 */
const getCleanContactLinks = (contactInfo = {}, userData = null) => {
  const rawLinks = [];

  if (Array.isArray(contactInfo?.customLinks)) {
    contactInfo.customLinks.forEach((l) => {
      if (l && l.url && typeof l.url === 'string' && l.url.trim()) {
        rawLinks.push({ heading: l.heading || 'Link', url: l.url.trim() });
      }
    });
  }

  const legacyFields = [
    { heading: 'LinkedIn', url: contactInfo?.linkedin || userData?.linkedin },
    { heading: 'GitHub', url: contactInfo?.github || userData?.github },
    { heading: 'Portfolio', url: contactInfo?.portfolio }
  ];

  legacyFields.forEach((item) => {
    if (item.url && typeof item.url === 'string' && item.url.trim()) {
      rawLinks.push({ heading: item.heading, url: item.url.trim() });
    }
  });

  const seenUrls = new Set();
  const cleanLinks = [];

  rawLinks.forEach((item) => {
    const norm = item.url.toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '');
    const isDummy = DUMMY_LINK_PATTERNS.some((d) => norm === d.toLowerCase());
    if (!isDummy && !seenUrls.has(norm)) {
      seenUrls.add(norm);
      cleanLinks.push({ heading: item.heading, url: item.url });
    }
  });

  return cleanLinks;
};

/**
 * Normalizes education data.
 */
const getCleanEducation = (rawEducation = []) => {
  if (!Array.isArray(rawEducation)) return [];

  return rawEducation
    .map((edu) => {
      if (!edu || (!edu.degree && !edu.institution)) return null;

      const cleanVal = (val) => {
        if (!val) return '';
        const s = String(val).trim();
        return s.toLowerCase() === 'null' || s.toLowerCase() === 'n/a' ? '' : s;
      };

      const degreeStr = cleanVal(edu.degree);
      const branchStr =
        cleanVal(edu.branch) && !degreeStr.toLowerCase().includes(edu.branch.toLowerCase())
          ? ` in ${edu.branch}`
          : '';
      const institution = cleanVal(edu.institution);
      const location = cleanVal(edu.location);
      const gpa = cleanVal(edu.gpa);

      const startY = cleanVal(edu.startYear);
      const endY = cleanVal(edu.endYear);
      const dur = cleanVal(edu.duration);
      const yearDisplay = endY ? (startY ? `${startY} - ${endY}` : endY) : startY || dur;

      const coursework = Array.isArray(edu.relevantCoursework)
        ? edu.relevantCoursework.map(c => String(c || '').trim()).filter(Boolean)
        : [];

      return {
        degree: `${degreeStr}${branchStr}`,
        institution,
        location,
        gpa,
        yearDisplay,
        coursework
      };
    })
    .filter(Boolean);
};

/**
 * Cleans bullet point strings by stripping leading bullet symbols
 * (such as •, -, *, ·, ð, \u00f0, \uF0A7, \uF0B7) and eliminating corrupt font artifacts like ð.
 */
const cleanBulletText = (text) => {

  if (!text) return '';
  let s = String(text).trim();
  // Strip leading bullet symbols and extra spaces
  s = s.replace(/^[•\-\*·\u2022\u25cf\u25aa\u25b8\u00f0\xF0\s]+/, '').trim();
  // Strip any remaining corrupt bullet characters like ð
  s = s.replace(/[\u00f0\xF0]/g, '').trim();
  return s;
};

/**
 * Normalizes experience data.
 */
const getCleanExperience = (rawExperience = []) => {
  if (!Array.isArray(rawExperience)) return [];

  return rawExperience
    .map((exp) => {
      if (!exp || (!exp.role && !exp.company)) return null;

      const role = String(exp.role || '').trim();
      const company = String(exp.company || '').trim();
      const location = String(exp.location || '').trim();

      const startDate = String(exp.startDate || '').trim();
      const endDate = String(exp.endDate || '').trim();
      const dur = String(exp.duration || '').trim();
      const dateRange =
        startDate && endDate
          ? `${startDate} - ${exp.currentWorking ? 'Present' : endDate}`
          : dur || startDate || endDate;

      let description = [];
      if (Array.isArray(exp.description)) {
        description = exp.description.map(cleanBulletText).filter(Boolean);
      } else if (typeof exp.description === 'string' && exp.description.trim()) {
        description = exp.description
          .split('\n')
          .map(cleanBulletText)
          .filter(Boolean);
      }

      const rawAch = String(exp.achievements || '').trim();
      const achievements = cleanBulletText(rawAch.replace(/^(Key Impact:\s*|Impact:\s*)/i, '').trim());

      return {
        role,
        company,
        location,
        dateRange,
        description,
        achievements
      };
    })
    .filter(Boolean);
};

/**
 * Normalizes projects data.
 */
const getCleanProjects = (rawProjects = []) => {
  if (!Array.isArray(rawProjects)) return [];

  return rawProjects
    .map((proj) => {
      if (!proj || !proj.title) return null;

      const title = String(proj.title || '').trim();
      const techStack = Array.isArray(proj.techStack)
        ? proj.techStack.map(t => String(t || '').trim()).filter(Boolean).join(', ')
        : String(proj.techStack || '').trim();

      const link = String(proj.github || proj.link || proj.liveDemo || '').trim();

      const startDate = String(proj.startDate || '').trim();
      const endDate = String(proj.endDate || '').trim();
      const dur = String(proj.duration || '').trim();
      const dateRange =
        startDate && endDate ? `${startDate} – ${endDate}` : dur || startDate || endDate;

      let description = [];
      if (Array.isArray(proj.description)) {
        description = proj.description.map(cleanBulletText).filter(Boolean);
      } else if (typeof proj.description === 'string' && proj.description.trim()) {
        description = proj.description
          .split('\n')
          .map(cleanBulletText)
          .filter(Boolean);
      }

      return {
        title,
        techStack,
        link,
        dateRange,
        description
      };
    })
    .filter(Boolean);
};

/**
 * Normalizes certifications.
 */
const getCleanCertifications = (rawCerts = []) => {
  if (!Array.isArray(rawCerts)) return [];

  return rawCerts
    .map((c) => {
      if (!c) return null;
      if (typeof c === 'string') {
        const str = cleanBulletText(c.trim());
        return str ? { name: str, organization: '', issueDate: '', credentialUrl: '' } : null;
      }
      const name = cleanBulletText(String(c.name || c.title || '').trim());
      if (!name) return null;
      return {
        name,
        organization: String(c.organization || '').trim(),
        issueDate: String(c.issueDate || c.date || '').trim(),
        credentialUrl: String(c.credentialUrl || c.link || '').trim()
      };
    })
    .filter(Boolean);
};

/**
 * Normalizes achievements.
 */
const getCleanAchievements = (rawAchievements = []) => {
  if (!Array.isArray(rawAchievements)) return [];

  return rawAchievements
    .map((a) => {
      if (!a) return null;
      if (typeof a === 'string') {
        const str = cleanBulletText(a.trim());
        return str ? { title: str, organization: '', date: '', description: '' } : null;
      }
      const title = cleanBulletText(String(a.title || '').trim());
      if (!title) return null;
      return {
        title,
        organization: String(a.organization || '').trim(),
        date: String(a.date || '').trim(),
        description: cleanBulletText(String(a.description || '').trim())
      };
    })
    .filter(Boolean);
};


/**
 * Helper to draw a crisp, native PDF vector bullet dot.
 * Guaranteed to never corrupt or render as weird symbols across any PDF reader!
 */
const drawBulletDot = (doc, x, y, radius = 0.55, color = [0, 0, 0]) => {
  const curFill = doc.getFillColor();
  doc.setFillColor(...color);
  doc.circle(x, y - 0.9, radius, 'F');
  doc.setFillColor(curFill);
};

/**
 * Helper to print a clickable link.
 */
const printClickableLink = (doc, text, x, y, url, options = {}) => {
  if (!url) {
    doc.text(text, x, y);
    return;
  }
  let cleanUrl = String(url).trim();
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = cleanUrl.includes('@') ? `mailto:${cleanUrl}` : `https://${cleanUrl}`;
  }

  const textWidth = doc.getTextWidth(text);
  doc.text(text, x, y);
  doc.link(x, y - (options.height || 3.2), textWidth, options.height || 4, { url: cleanUrl });

  if (options.underline) {
    const curDraw = doc.getDrawColor();
    doc.setDrawColor(...(options.underlineColor || [0, 0, 0]));
    doc.setLineWidth(0.15);
    doc.line(x, y + 0.4, x + textWidth, y + 0.4);
    doc.setDrawColor(curDraw);
  }
};

/* ==========================================================================
   1. CLASSIC ATS TEMPLATE (Single Column, Clean Helvetica, Exact Alignment)
   ========================================================================== */
const buildClassicPDF = (doc, resumeData, userData) => {
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - 2 * margin; // 182mm
  let y = margin;

  const checkPageBreak = (neededHeight) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
      return true;
    }
    return false;
  };

  const contact = resumeData.contactInfo || {};
  const fullName = contact.fullName || userData?.name || 'ALOK KUMAR';
  const email = contact.email || userData?.email || '';
  const phone = contact.phone || '';
  const address = contact.address || '';
  const cleanLinks = getCleanContactLinks(contact, userData);

  // Profile Photo (Top Right)
  const hasPhoto = Boolean(contact.photoEnabled && contact.profilePhoto);
  const photoSize = contact.photoSize || 76;
  const photoWidth = (photoSize / 76) * 19;
  const photoHeight = photoWidth * 1.333;

  if (hasPhoto) {
    try {
      const format = contact.profilePhoto.includes('image/png') ? 'PNG' : 'JPEG';
      doc.addImage(contact.profilePhoto, format, pageWidth - margin - photoWidth, y, photoWidth, photoHeight);
    } catch (e) {
      console.warn('Classic ATS photo warning:', e.message);
    }
  }

  // Header: Full Name (Centered, Bold 18pt, uppercase)
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  const nameStr = fullName.toUpperCase();
  const nameX = (pageWidth - doc.getTextWidth(nameStr)) / 2;
  doc.text(nameStr, nameX, y + 4.5);
  y += 5.5;

  // Address
  if (address) {
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(50, 50, 50);
    const addrX = (pageWidth - doc.getTextWidth(address)) / 2;
    doc.text(address, addrX, y + 3.2);
    y += 3.8;
  }

  // Email & Phone (deduplicated against address)
  const emailPhoneItems = [];
  const normAddr = (address || '').toLowerCase();
  const normAddrDigits = (address || '').replace(/\D/g, '');
  const phoneDigits = (phone || '').replace(/\D/g, '');

  if (email && !normAddr.includes(email.toLowerCase())) {
    emailPhoneItems.push(email);
  }
  if (phone && (!phoneDigits || !normAddrDigits.includes(phoneDigits))) {
    emailPhoneItems.push(phone);
  }


  if (emailPhoneItems.length > 0) {
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(20, 20, 20);

    const epText = emailPhoneItems.join('  •  ');
    const epX = (pageWidth - doc.getTextWidth(epText)) / 2;

    if (emailPhoneItems.length === 2) {
      printClickableLink(doc, emailPhoneItems[0], epX, y + 3.2, emailPhoneItems[0]);
      const sep = '  •  ';
      const sepX = epX + doc.getTextWidth(emailPhoneItems[0]);
      doc.text(sep, sepX, y + 3.2);
      const phoneX = sepX + doc.getTextWidth(sep);
      doc.text(emailPhoneItems[1], phoneX, y + 3.2);
    } else {
      printClickableLink(doc, epText, epX, y + 3.2, emailPhoneItems[0]);
    }
    y += 3.8;
  }

  // Links (Centered, Clickable)
  if (cleanLinks.length > 0) {
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(0, 0, 0);

    cleanLinks.forEach((linkObj) => {
      const linkLabel = linkObj.url;
      const lX = (pageWidth - doc.getTextWidth(linkLabel)) / 2;
      printClickableLink(doc, linkLabel, lX, y + 3.2, linkObj.url, { underline: true, underlineColor: [120, 120, 120] });
      y += 3.6;
    });
  }

  // Ensure header clears photo
  if (hasPhoto && y < margin + photoHeight + 2) {
    y = margin + photoHeight + 2;
  }

  // Header Divider
  y += 2;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.35);
  doc.line(margin, y, pageWidth - margin, y);
  y += 4;

  const printSectionHeader = (title) => {
    checkPageBreak(18);
    y += 1.5;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(0, 0, 0);
    doc.text(title.toUpperCase(), margin, y + 2.5);
    y += 3.5;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.line(margin, y, pageWidth - margin, y);
    y += 3.5;
  };

  // 1. Professional Summary
  if (resumeData.summary && resumeData.summary.trim()) {
    printSectionHeader('Professional Summary');
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(20, 20, 20);
    const lines = doc.splitTextToSize(resumeData.summary.trim(), contentWidth);
    for (const line of lines) {
      checkPageBreak(4.2);
      doc.text(line, margin, y + 2.8);
      y += 3.8;
    }
    y += 2;
  }

  // 2. Skills & Competencies
  const techSkills = Array.isArray(resumeData.technicalSkills) ? resumeData.technicalSkills.filter(Boolean) : [];
  const toolsTech = Array.isArray(resumeData.toolsAndTech) ? resumeData.toolsAndTech.filter(Boolean) : [];
  const softSkills = Array.isArray(resumeData.softSkills) ? resumeData.softSkills.filter(Boolean) : [];

  const combinedSkills = [
    techSkills.length > 0 ? `Technical Skills: ${techSkills.join(', ')}` : null,
    toolsTech.length > 0 ? `Tools & Technologies: ${toolsTech.join(', ')}` : null,
    softSkills.length > 0 ? `Soft Skills: ${softSkills.join(', ')}` : null
  ].filter(Boolean);

  if (combinedSkills.length > 0) {

    printSectionHeader('Skills & Competencies');
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(20, 20, 20);
    combinedSkills.forEach((lineText) => {
      const lines = doc.splitTextToSize(lineText, contentWidth);
      for (const line of lines) {
        checkPageBreak(4.2);
        doc.text(line, margin, y + 2.8);
        y += 3.8;
      }
    });
    y += 2;
  }

  // 3. Work Experience
  const experiences = getCleanExperience(resumeData.experience);
  if (experiences.length > 0) {
    printSectionHeader('Work Experience');
    experiences.forEach((exp) => {
      checkPageBreak(16);

      // Measure date width to prevent overlap
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      const dateW = exp.dateRange ? doc.getTextWidth(exp.dateRange) : 0;
      const maxRoleW = contentWidth - (dateW > 0 ? dateW + 6 : 0);

      // Role | Company (Location)
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);

      const titleLeft = `${exp.role}${exp.company ? ` | ${exp.company}` : ''}${exp.location ? ` (${exp.location})` : ''}`;
      const roleLines = doc.splitTextToSize(titleLeft, maxRoleW);

      doc.text(roleLines[0], margin, y + 2.8);

      if (exp.dateRange) {
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(60, 60, 60);
        doc.text(exp.dateRange, pageWidth - margin - dateW, y + 2.8);
      }
      y += 3.8;

      // Print any additional lines of role text
      if (roleLines.length > 1) {
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        for (let r = 1; r < roleLines.length; r++) {
          doc.text(roleLines[r], margin, y + 2.5);
          y += 3.6;
        }
      }

      // Bullets
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(20, 20, 20);

      exp.description.forEach((bullet) => {
        const cleanB = cleanBulletText(bullet);
        if (!cleanB) return;
        const wrapped = doc.splitTextToSize(cleanB, contentWidth - 6);
        for (let i = 0; i < wrapped.length; i++) {
          checkPageBreak(4.2);
          if (i === 0) {
            drawBulletDot(doc, margin + 1.5, y + 2.8, 0.55, [0, 0, 0]);
          }
          doc.text(wrapped[i], margin + 5, y + 2.8);
          y += 3.6;
        }
      });

      // Key Impact
      if (exp.achievements) {
        checkPageBreak(4.5);
        doc.setFont('Helvetica', 'bold');
        doc.text('Key Impact: ', margin + 5, y + 2.8);
        const prefixW = doc.getTextWidth('Key Impact: ');
        doc.setFont('Helvetica', 'italic');
        const wrappedImpact = doc.splitTextToSize(exp.achievements, contentWidth - 5 - prefixW);
        for (let i = 0; i < wrappedImpact.length; i++) {
          if (i > 0) checkPageBreak(4);
          doc.text(wrappedImpact[i], margin + 5 + (i === 0 ? prefixW : 0), y + 2.8);
          y += 3.6;
        }
      }
      y += 2.5;
    });
  }

  // 4. Projects
  const projects = getCleanProjects(resumeData.projects);
  if (projects.length > 0) {
    printSectionHeader('Projects');
    projects.forEach((proj) => {
      checkPageBreak(16);

      // Check if project link is already contained in the project title
      const rawTitle = proj.title || '';
      const rawLink = proj.link || '';
      const normLink = rawLink.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
      const linkAlreadyInTitle = Boolean(normLink && rawTitle.toLowerCase().includes(normLink.toLowerCase()));
      const showLinkOnRight = Boolean(rawLink && !linkAlreadyInTitle);

      // Measure right link width
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      const linkW = showLinkOnRight ? doc.getTextWidth(rawLink) : 0;
      const maxTitleW = contentWidth - (linkW > 0 ? linkW + 6 : 0);

      // Title & Tech stack
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);

      const titleStr = rawTitle;
      const techStr = proj.techStack ? ` (${proj.techStack})` : '';
      const fullProjectHeader = `${titleStr}${techStr}`;
      const projLines = doc.splitTextToSize(fullProjectHeader, maxTitleW);

      doc.text(projLines[0], margin, y + 2.8);

      // Project Link right-aligned on first line (only if not already part of title)
      if (showLinkOnRight) {
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        printClickableLink(doc, rawLink, pageWidth - margin - linkW, y + 2.8, rawLink, { underline: true });
      }
      y += 3.8;

      if (projLines.length > 1) {
        doc.setFont('Helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(60, 60, 60);
        for (let p = 1; p < projLines.length; p++) {
          doc.text(projLines[p], margin, y + 2.5);
          y += 3.6;
        }
      }

      // Bullets
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(20, 20, 20);

      proj.description.forEach((bullet) => {
        const cleanB = cleanBulletText(bullet);
        if (!cleanB) return;
        const wrapped = doc.splitTextToSize(cleanB, contentWidth - 6);
        for (let i = 0; i < wrapped.length; i++) {
          checkPageBreak(4.2);
          if (i === 0) {
            drawBulletDot(doc, margin + 1.5, y + 2.8, 0.55, [0, 0, 0]);
          }
          doc.text(wrapped[i], margin + 5, y + 2.8);
          y += 3.6;
        }
      });
      y += 2.5;
    });
  }


  // 5. Education
  const educations = getCleanEducation(resumeData.education);
  if (educations.length > 0) {
    printSectionHeader('Education');
    educations.forEach((edu) => {
      checkPageBreak(14);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      const yrW = edu.yearDisplay ? doc.getTextWidth(`— ${edu.yearDisplay}`) : 0;
      const maxEduW = contentWidth - (yrW > 0 ? yrW + 6 : 0);

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);

      const leftText = `${edu.degree}${edu.institution ? `, ${edu.institution}` : ''}${edu.location ? `, ${edu.location}` : ''}`;
      const eduLines = doc.splitTextToSize(leftText, maxEduW);

      doc.text(eduLines[0], margin, y + 2.8);

      if (edu.yearDisplay) {
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(60, 60, 60);
        const yrText = `— ${edu.yearDisplay}`;
        doc.text(yrText, pageWidth - margin - yrW, y + 2.8);
      }
      y += 3.8;

      if (eduLines.length > 1) {
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(40, 40, 40);
        for (let e = 1; e < eduLines.length; e++) {
          doc.text(eduLines[e], margin, y + 2.5);
          y += 3.5;
        }
      }

      if (edu.gpa) {
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(60, 60, 60);
        doc.text(`CGPA/Score: ${edu.gpa}`, margin, y + 2.5);
        y += 3.5;
      }

      if (edu.coursework.length > 0) {
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(60, 60, 60);
        const cwText = `Coursework: ${edu.coursework.join(', ')}`;
        const cwLines = doc.splitTextToSize(cwText, contentWidth);
        for (const line of cwLines) {
          checkPageBreak(4);
          doc.text(line, margin, y + 2.5);
          y += 3.5;
        }
      }
      y += 2;
    });
  }

  // 6. Certifications
  const certs = getCleanCertifications(resumeData.certifications);
  if (certs.length > 0) {
    printSectionHeader('Certifications');
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(20, 20, 20);

    certs.forEach((cert) => {
      checkPageBreak(5);
      drawBulletDot(doc, margin + 1.5, y + 2.8, 0.55, [0, 0, 0]);

      doc.setFont('Helvetica', 'bold');
      doc.text(cert.name, margin + 5, y + 2.8);
      let certOffset = margin + 5 + doc.getTextWidth(cert.name);

      doc.setFont('Helvetica', 'normal');
      if (cert.organization) {
        const orgText = ` — ${cert.organization}`;
        doc.text(orgText, certOffset, y + 2.8);
        certOffset += doc.getTextWidth(orgText);
      }
      if (cert.issueDate) {
        const dtText = ` (${cert.issueDate})`;
        doc.text(dtText, certOffset, y + 2.8);
        certOffset += doc.getTextWidth(dtText);
      }
      if (cert.credentialUrl) {
        printClickableLink(doc, ` [${cert.credentialUrl}]`, certOffset, y + 2.8, cert.credentialUrl, { underline: true });
      }
      y += 3.8;
    });
    y += 2;
  }

  // 7. Key Achievements
  const achievements = getCleanAchievements(resumeData.achievements);
  if (achievements.length > 0) {
    printSectionHeader('Key Achievements');
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(20, 20, 20);

    achievements.forEach((ach) => {
      checkPageBreak(5);
      drawBulletDot(doc, margin + 1.5, y + 2.8, 0.55, [0, 0, 0]);

      doc.setFont('Helvetica', 'bold');
      doc.text(ach.title, margin + 5, y + 2.8);
      let achOffset = margin + 5 + doc.getTextWidth(ach.title);

      doc.setFont('Helvetica', 'normal');
      if (ach.organization) {
        const orgStr = ` (${ach.organization})`;
        doc.text(orgStr, achOffset, y + 2.8);
        achOffset += doc.getTextWidth(orgStr);
      }
      if (ach.date) {
        const dtStr = ` [${ach.date}]`;
        doc.text(dtStr, achOffset, y + 2.8);
        achOffset += doc.getTextWidth(dtStr);
      }
      if (ach.description) {
        const fullDesc = ` — ${ach.description}`;
        const descLines = doc.splitTextToSize(fullDesc, contentWidth - (achOffset - margin));
        if (descLines.length > 0) {
          doc.text(descLines[0], achOffset, y + 2.8);
          for (let i = 1; i < descLines.length; i++) {
            y += 3.6;
            checkPageBreak(4.2);
            doc.text(descLines[i], margin + 5, y + 2.8);
          }
        }
      }
      y += 3.8;
    });
    y += 2;
  }

  // 8. Declaration
  checkPageBreak(16);
  y += 2;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.2);
  doc.line(margin, y, pageWidth - margin, y);
  y += 3.5;

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text('DECLARATION', margin, y + 2.5);
  y += 3.5;

  doc.setFont('Helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(40, 40, 40);
  doc.text(
    'I hereby declare that all the information mentioned above is true and correct to the best of my knowledge and belief.',
    margin,
    y + 2.5
  );
};

/* ==========================================================================
   2. MODERN ATS TEMPLATE (Two Columns, Dark Left Sidebar, Star Ratings)
   ========================================================================== */
const buildModernPDF = (doc, resumeData, userData) => {
  const pageWidth = 210;
  const pageHeight = 297;
  const sidebarWidth = 62;
  const rightMarginLeft = 70;
  const rightWidth = pageWidth - rightMarginLeft - 12; // 128mm
  const margin = 14;

  const drawSidebarBackground = () => {
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, sidebarWidth, pageHeight, 'F');
  };

  // Draw initial page sidebar
  drawSidebarBackground();

  let yRight = margin;
  let yLeft = margin;

  const checkPageBreakRight = (neededHeight) => {
    if (yRight + neededHeight > pageHeight - margin) {
      doc.addPage();
      drawSidebarBackground();
      yRight = margin;
      return true;
    }
    return false;
  };

  const contact = resumeData.contactInfo || {};
  const fullName = contact.fullName || userData?.name || 'ALOK KUMAR';
  const email = contact.email || userData?.email || '';
  const phone = contact.phone || '';
  const address = contact.address || '';
  const cleanLinks = getCleanContactLinks(contact, userData);

  // ------------------ LEFT SIDEBAR CONTENT ------------------
  // 1. Profile Photo
  if (contact.photoEnabled && contact.profilePhoto) {
    try {
      const format = contact.profilePhoto.includes('image/png') ? 'PNG' : 'JPEG';
      const pDim = 22;
      const pX = (sidebarWidth - pDim) / 2;
      doc.addImage(contact.profilePhoto, format, pX, yLeft, pDim, pDim);
      yLeft += pDim + 4;
    } catch (e) {
      console.warn('Modern ATS photo warning:', e.message);
    }
  }

  // 2. Candidate Name
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12.5);
  doc.setTextColor(255, 255, 255);
  const nameLines = doc.splitTextToSize(fullName.toUpperCase(), sidebarWidth - 12);
  nameLines.forEach((nLine) => {
    const nw = doc.getTextWidth(nLine);
    doc.text(nLine, (sidebarWidth - nw) / 2, yLeft + 3.5);
    yLeft += 4.8;
  });
  yLeft += 2;

  // Sidebar Separator
  doc.setDrawColor(51, 65, 85); // slate-700
  doc.setLineWidth(0.3);
  doc.line(7, yLeft, sidebarWidth - 7, yLeft);
  yLeft += 4.5;

  // 3. Contact Info
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(203, 213, 225); // slate-300

  if (address) {
    const addrLines = doc.splitTextToSize(`Loc: ${address}`, sidebarWidth - 14);
    addrLines.forEach((l) => {
      doc.text(l, 8, yLeft + 2.5);
      yLeft += 3.5;
    });
    yLeft += 0.5;
  }

  if (email) {
    const emLines = doc.splitTextToSize(`Email: ${email}`, sidebarWidth - 14);
    emLines.forEach((l) => {
      printClickableLink(doc, l, 8, yLeft + 2.5, email, { height: 3.5 });
      yLeft += 3.5;
    });
    yLeft += 0.5;
  }

  if (phone) {
    doc.text(`Phone: ${phone}`, 8, yLeft + 2.5);
    yLeft += 4;
  }

  // Clean Links
  if (cleanLinks.length > 0) {
    cleanLinks.forEach((lObj) => {
      const heading = lObj.heading || 'Link';
      const label = `${heading}: ${lObj.url}`;
      const wrapped = doc.splitTextToSize(label, sidebarWidth - 14);
      wrapped.forEach((w) => {
        printClickableLink(doc, w, 8, yLeft + 2.5, lObj.url, { underline: true, underlineColor: [100, 116, 139] });
        yLeft += 3.5;
      });
      yLeft += 0.5;
    });
  }

  yLeft += 3;

  // 4. Skills with Star Ratings (★ ★ ★ ★ ★)
  const skillsList = Array.isArray(resumeData.skills)
    ? resumeData.skills.map((s, idx) => {
        if (typeof s === 'object' && s !== null) return { name: s.name, rating: Math.max(1, Math.min(5, Number(s.rating) || 5)) };
        return { name: String(s), rating: 5 - (idx % 2) };
      }).filter((s) => s.name)
    : [];

  if (skillsList.length > 0) {
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('SKILLS', 8, yLeft + 2.5);
    yLeft += 3.5;
    doc.setDrawColor(51, 65, 85);
    doc.setLineWidth(0.2);
    doc.line(8, yLeft, sidebarWidth - 8, yLeft);
    yLeft += 3;

    skillsList.slice(0, 14).forEach((skill) => {
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(241, 245, 249);
      const sName = doc.splitTextToSize(skill.name, 30)[0];
      doc.text(sName, 8, yLeft + 2.5);

      const starsX = sidebarWidth - 20;
      for (let starIdx = 1; starIdx <= 5; starIdx++) {
        const curStarX = starsX + (starIdx - 1) * 3.5;
        if (starIdx <= skill.rating) {
          doc.setTextColor(245, 158, 11); // amber-500
          doc.text('★', curStarX, yLeft + 2.5);
        } else {
          doc.setTextColor(71, 85, 105); // slate-600
          doc.text('★', curStarX, yLeft + 2.5);
        }
      }
      yLeft += 4;
    });
    yLeft += 2;
  }

  // 5. Languages
  const languagesList = Array.isArray(resumeData.languages) && resumeData.languages.length > 0
    ? resumeData.languages.filter((l) => l.name)
    : [
        { name: 'English', rating: 5 },
        { name: 'Hindi', rating: 5 }
      ];

  if (languagesList.length > 0 && yLeft < pageHeight - 35) {
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('LANGUAGES', 8, yLeft + 2.5);
    yLeft += 3.5;
    doc.setDrawColor(51, 65, 85);
    doc.setLineWidth(0.2);
    doc.line(8, yLeft, sidebarWidth - 8, yLeft);
    yLeft += 3;

    languagesList.forEach((lang) => {
      const r = Math.max(1, Math.min(5, Number(lang.rating) || 5));
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(241, 245, 249);
      doc.text(lang.name, 8, yLeft + 2.5);

      const starsX = sidebarWidth - 20;
      for (let starIdx = 1; starIdx <= 5; starIdx++) {
        const curStarX = starsX + (starIdx - 1) * 3.5;
        if (starIdx <= r) {
          doc.setTextColor(245, 158, 11);
          doc.text('★', curStarX, yLeft + 2.5);
        } else {
          doc.setTextColor(71, 85, 105);
          doc.text('★', curStarX, yLeft + 2.5);
        }
      }
      yLeft += 4;
    });
  }

  // ------------------ RIGHT MAIN COLUMN CONTENT ------------------
  const printRightHeader = (title) => {
    checkPageBreakRight(18);
    yRight += 1.5;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(title.toUpperCase(), rightMarginLeft, yRight + 2.5);
    yRight += 3.5;
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.4);
    doc.line(rightMarginLeft, yRight, rightMarginLeft + rightWidth, yRight);
    yRight += 4;
  };

  // 1. Summary
  if (resumeData.summary && resumeData.summary.trim()) {
    printRightHeader('Summary');
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85); // slate-700
    const lines = doc.splitTextToSize(resumeData.summary.trim(), rightWidth);
    for (const line of lines) {
      checkPageBreakRight(4.2);
      doc.text(line, rightMarginLeft, yRight + 2.8);
      yRight += 3.8;
    }
    yRight += 2;
  }

  // 2. Experience
  const experiences = getCleanExperience(resumeData.experience);
  if (experiences.length > 0) {
    printRightHeader('Experience');
    experiences.forEach((exp) => {
      checkPageBreakRight(16);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      const dateW = exp.dateRange ? doc.getTextWidth(exp.dateRange) : 0;
      const maxRoleW = rightWidth - (dateW > 0 ? dateW + 6 : 0);

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);

      const titleLeft = `${exp.role}${exp.company ? ` | ${exp.company}` : ''}`;
      const roleLines = doc.splitTextToSize(titleLeft, maxRoleW);

      doc.text(roleLines[0], rightMarginLeft, yRight + 2.8);

      if (exp.dateRange) {
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(exp.dateRange, rightMarginLeft + rightWidth - dateW, yRight + 2.8);
      }
      yRight += 3.8;

      if (roleLines.length > 1) {
        for (let r = 1; r < roleLines.length; r++) {
          doc.text(roleLines[r], rightMarginLeft, yRight + 2.5);
          yRight += 3.5;
        }
      }

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.2);
      doc.setTextColor(51, 65, 85);

      exp.description.forEach((bullet) => {
        const wrapped = doc.splitTextToSize(bullet, rightWidth - 6);
        for (let i = 0; i < wrapped.length; i++) {
          checkPageBreakRight(4);
          if (i === 0) {
            drawBulletDot(doc, rightMarginLeft + 1.5, yRight + 2.8, 0.55, [71, 85, 105]);
          }
          doc.text(wrapped[i], rightMarginLeft + 5, yRight + 2.8);
          yRight += 3.6;
        }
      });

      if (exp.achievements) {
        checkPageBreakRight(4.5);
        doc.setFont('Helvetica', 'bold');
        doc.text('Impact: ', rightMarginLeft + 5, yRight + 2.8);
        const pW = doc.getTextWidth('Impact: ');
        doc.setFont('Helvetica', 'italic');
        const wrappedImp = doc.splitTextToSize(exp.achievements, rightWidth - 5 - pW);
        for (let i = 0; i < wrappedImp.length; i++) {
          if (i > 0) checkPageBreakRight(4);
          doc.text(wrappedImp[i], rightMarginLeft + 5 + (i === 0 ? pW : 0), yRight + 2.8);
          yRight += 3.6;
        }
      }
      yRight += 2.5;
    });
  }

  // 3. Projects
  const projects = getCleanProjects(resumeData.projects);
  if (projects.length > 0) {
    printRightHeader('Projects');
    projects.forEach((proj) => {
      checkPageBreakRight(16);

      // Check if project link is already contained in the project title
      const rawTitle = proj.title || '';
      const rawLink = proj.link || '';
      const normLink = rawLink.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
      const linkAlreadyInTitle = Boolean(normLink && rawTitle.toLowerCase().includes(normLink.toLowerCase()));
      const showLinkOnRight = Boolean(rawLink && !linkAlreadyInTitle);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      const linkW = showLinkOnRight ? doc.getTextWidth(rawLink) : 0;
      const maxTitleW = rightWidth - (linkW > 0 ? linkW + 6 : 0);

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);

      const titleStr = rawTitle;
      const techStr = proj.techStack ? ` (${proj.techStack})` : '';
      const fullProjectHeader = `${titleStr}${techStr}`;
      const projLines = doc.splitTextToSize(fullProjectHeader, maxTitleW);

      doc.text(projLines[0], rightMarginLeft, yRight + 2.8);

      if (showLinkOnRight) {
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(37, 99, 235);
        printClickableLink(doc, rawLink, rightMarginLeft + rightWidth - linkW, yRight + 2.8, rawLink, { underline: true, underlineColor: [37, 99, 235] });
      }
      yRight += 3.8;

      if (projLines.length > 1) {
        doc.setFont('Helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        for (let p = 1; p < projLines.length; p++) {
          doc.text(projLines[p], rightMarginLeft, yRight + 2.5);
          yRight += 3.5;
        }
      }

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.2);
      doc.setTextColor(51, 65, 85);

      proj.description.forEach((bullet) => {
        const cleanB = cleanBulletText(bullet);
        if (!cleanB) return;
        const wrapped = doc.splitTextToSize(cleanB, rightWidth - 6);
        for (let i = 0; i < wrapped.length; i++) {
          checkPageBreakRight(4);
          if (i === 0) {
            drawBulletDot(doc, rightMarginLeft + 1.5, yRight + 2.8, 0.55, [71, 85, 105]);
          }
          doc.text(wrapped[i], rightMarginLeft + 5, yRight + 2.8);
          yRight += 3.6;
        }
      });
      yRight += 2.5;
    });
  }


  // 4. Education
  const educations = getCleanEducation(resumeData.education);
  if (educations.length > 0) {
    printRightHeader('Education');
    educations.forEach((edu) => {
      checkPageBreakRight(14);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      const yrW = edu.yearDisplay ? doc.getTextWidth(`— ${edu.yearDisplay}`) : 0;
      const maxEduW = rightWidth - (yrW > 0 ? yrW + 6 : 0);

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);

      const leftText = `${edu.degree}${edu.institution ? `, ${edu.institution}` : ''}`;
      const eduLines = doc.splitTextToSize(leftText, maxEduW);

      doc.text(eduLines[0], rightMarginLeft, yRight + 2.8);

      if (edu.yearDisplay) {
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        const yrText = `— ${edu.yearDisplay}`;
        doc.text(yrText, rightMarginLeft + rightWidth - yrW, yRight + 2.8);
      }
      yRight += 3.8;

      if (eduLines.length > 1) {
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        for (let e = 1; e < eduLines.length; e++) {
          doc.text(eduLines[e], rightMarginLeft, yRight + 2.5);
          yRight += 3.5;
        }
      }

      if (edu.gpa) {
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        doc.text(`CGPA/Percentage: ${edu.gpa}`, rightMarginLeft, yRight + 2.5);
        yRight += 3.5;
      }

      if (edu.coursework.length > 0) {
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        const cwText = `Coursework: ${edu.coursework.join(', ')}`;
        const cwLines = doc.splitTextToSize(cwText, rightWidth);
        for (const line of cwLines) {
          checkPageBreakRight(4);
          doc.text(line, rightMarginLeft, yRight + 2.5);
          yRight += 3.5;
        }
      }
      yRight += 2;
    });
  }

  // 5. Certifications
  const certs = getCleanCertifications(resumeData.certifications);
  if (certs.length > 0) {
    printRightHeader('Certifications');
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.2);
    doc.setTextColor(51, 65, 85);

    certs.forEach((cert) => {
      checkPageBreakRight(5);
      drawBulletDot(doc, rightMarginLeft + 1.5, yRight + 2.8, 0.55, [71, 85, 105]);

      doc.setFont('Helvetica', 'bold');
      doc.text(cert.name, rightMarginLeft + 5, yRight + 2.8);
      let certOffset = rightMarginLeft + 5 + doc.getTextWidth(cert.name);

      doc.setFont('Helvetica', 'normal');
      if (cert.organization) {
        const orgText = ` — ${cert.organization}`;
        doc.text(orgText, certOffset, yRight + 2.8);
        certOffset += doc.getTextWidth(orgText);
      }
      if (cert.issueDate) {
        const dtText = ` (${cert.issueDate})`;
        doc.text(dtText, certOffset, yRight + 2.8);
        certOffset += doc.getTextWidth(dtText);
      }
      if (cert.credentialUrl) {
        printClickableLink(doc, ` [${cert.credentialUrl}]`, certOffset, yRight + 2.8, cert.credentialUrl, { underline: true, underlineColor: [37, 99, 235] });
      }
      yRight += 3.8;
    });
    yRight += 2;
  }


  // 6. Achievements
  const achievements = getCleanAchievements(resumeData.achievements);
  if (achievements.length > 0) {
    printRightHeader('Achievements');
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.2);
    doc.setTextColor(51, 65, 85);

    achievements.forEach((ach) => {
      checkPageBreakRight(5);
      drawBulletDot(doc, rightMarginLeft + 1.5, yRight + 2.8, 0.55, [71, 85, 105]);

      doc.setFont('Helvetica', 'bold');
      doc.text(ach.title, rightMarginLeft + 5, yRight + 2.8);
      let achOffset = rightMarginLeft + 5 + doc.getTextWidth(ach.title);

      doc.setFont('Helvetica', 'normal');
      if (ach.organization) {
        const orgStr = ` (${ach.organization})`;
        doc.text(orgStr, achOffset, yRight + 2.8);
        achOffset += doc.getTextWidth(orgStr);
      }
      if (ach.date) {
        const dtStr = ` [${ach.date}]`;
        doc.text(dtStr, achOffset, yRight + 2.8);
        achOffset += doc.getTextWidth(dtStr);
      }
      if (ach.description) {
        const fullDesc = ` — ${ach.description}`;
        const descLines = doc.splitTextToSize(fullDesc, rightWidth - (achOffset - rightMarginLeft));
        if (descLines.length > 0) {
          doc.text(descLines[0], achOffset, yRight + 2.8);
          for (let i = 1; i < descLines.length; i++) {
            yRight += 3.6;
            checkPageBreakRight(4);
            doc.text(descLines[i], rightMarginLeft + 5, yRight + 2.8);
          }
        }
      }
      yRight += 3.8;
    });
    yRight += 2;
  }

  // 7. Declaration
  checkPageBreakRight(16);
  yRight += 2;
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.4);
  doc.line(rightMarginLeft, yRight, rightMarginLeft + rightWidth, yRight);
  yRight += 3.5;

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('DECLARATION', rightMarginLeft, yRight + 2.5);
  yRight += 3.5;

  doc.setFont('Helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(
    'I hereby declare that all the information mentioned above is true and correct to the best of my knowledge and belief.',
    rightMarginLeft,
    yRight + 2.5
  );
};

/* ==========================================================================
   3. RECOMMENDED ATS TEMPLATE (Serif Times, Navy Blue #0f4c81, Golden Links)
   ========================================================================== */
const buildRecommendedPDF = (doc, resumeData, userData) => {
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - 2 * margin; // 182mm
  let y = margin;

  const NAVY = [15, 76, 129]; // #0f4c81
  const GOLD = [161, 98, 7];  // #a16207
  const TEXT = [15, 23, 42];  // slate-900

  const checkPageBreak = (neededHeight) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
      return true;
    }
    return false;
  };

  const contact = resumeData.contactInfo || {};
  const fullName = contact.fullName || userData?.name || 'ALOK KUMAR';
  const email = contact.email || userData?.email || '';
  const phone = contact.phone || '';
  const address = contact.address || '';
  const cleanLinks = getCleanContactLinks(contact, userData);

  // Profile Photo (Top Right with Navy Border)
  const hasPhoto = Boolean(contact.photoEnabled && contact.profilePhoto);
  const photoSize = contact.photoSize || 76;
  const photoWidth = (photoSize / 76) * 19;
  const photoHeight = photoWidth * 1.333;

  if (hasPhoto) {
    try {
      const format = contact.profilePhoto.includes('image/png') ? 'PNG' : 'JPEG';
      doc.setDrawColor(...NAVY);
      doc.setLineWidth(0.4);
      doc.rect(pageWidth - margin - photoWidth - 0.5, y - 0.5, photoWidth + 1, photoHeight + 1, 'S');
      doc.addImage(contact.profilePhoto, format, pageWidth - margin - photoWidth, y, photoWidth, photoHeight);
    } catch (e) {
      console.warn('Recommended ATS photo warning:', e.message);
    }
  }

  // Header: Name (Centered, Navy Blue, Times Bold 19pt)
  doc.setFont('Times', 'bold');
  doc.setFontSize(19);
  doc.setTextColor(...NAVY);
  const nameX = (pageWidth - doc.getTextWidth(fullName)) / 2;
  doc.text(fullName, nameX, y + 4.5);
  y += 5.5;

  // Contact Details (Address, Phone, Email)
  const contactParts = [address, phone, email].filter(Boolean);
  if (contactParts.length > 0) {
    doc.setFont('Times', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...TEXT);
    const cText = contactParts.join(', ');
    const cX = (pageWidth - doc.getTextWidth(cText)) / 2;
    doc.text(cText, cX, y + 3.2);
    y += 3.8;
  }

  // Clean Links (Golden Brown #a16207, Clickable)
  if (cleanLinks.length > 0) {
    doc.setFont('Times', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...GOLD);

    cleanLinks.forEach((lObj) => {
      const label = `${lObj.heading || 'Link'}: ${lObj.url}`;
      const lX = (pageWidth - doc.getTextWidth(label)) / 2;
      printClickableLink(doc, label, lX, y + 3.2, lObj.url, { underline: true, underlineColor: GOLD });
      y += 3.6;
    });
  }

  // Ensure header clears photo
  if (hasPhoto && y < margin + photoHeight + 2) {
    y = margin + photoHeight + 2;
  }
  y += 2.5;

  const printSectionHeader = (title) => {
    checkPageBreak(18);
    y += 1.5;
    doc.setFont('Times', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...NAVY);
    doc.text(title.toUpperCase(), margin, y + 2.5);
    y += 3.5;
    doc.setDrawColor(...NAVY);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 4;
  };

  // 1. SUMMARY
  if (resumeData.summary && resumeData.summary.trim()) {
    printSectionHeader('SUMMARY');
    doc.setFont('Times', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...TEXT);
    const lines = doc.splitTextToSize(resumeData.summary.trim(), contentWidth);
    for (const line of lines) {
      checkPageBreak(4.2);
      doc.text(line, margin, y + 2.8);
      y += 3.8;
    }
    y += 2;
  }

  // 2. EDUCATION (Placed 2nd in Recommended ATS)
  const educations = getCleanEducation(resumeData.education);
  if (educations.length > 0) {
    printSectionHeader('EDUCATION');
    educations.forEach((edu) => {
      checkPageBreak(14);

      doc.setFont('Times', 'normal');
      doc.setFontSize(9);
      const yrW = edu.yearDisplay ? doc.getTextWidth(`— ${edu.yearDisplay}`) : 0;
      const maxEduW = contentWidth - (yrW > 0 ? yrW + 6 : 0);

      doc.setFont('Times', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...TEXT);

      const degStr = edu.degree;
      const instStr = edu.institution ? `, ${edu.institution}` : '';
      const locStr = edu.location ? `, ${edu.location}` : '';
      const gpaStr = edu.gpa ? ` (${edu.gpa})` : '';
      const fullEduText = `${degStr}${instStr}${locStr}${gpaStr}`;

      const eduLines = doc.splitTextToSize(fullEduText, maxEduW);
      doc.text(eduLines[0], margin, y + 2.8);

      if (edu.yearDisplay) {
        doc.setFont('Times', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        const yrText = `— ${edu.yearDisplay}`;
        doc.text(yrText, pageWidth - margin - yrW, y + 2.8);
      }
      y += 3.8;

      if (eduLines.length > 1) {
        doc.setFont('Times', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...TEXT);
        for (let e = 1; e < eduLines.length; e++) {
          doc.text(eduLines[e], margin, y + 2.5);
          y += 3.5;
        }
      }

      if (edu.coursework.length > 0) {
        doc.setFont('Times', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(70, 70, 70);
        const cwText = `Coursework: ${edu.coursework.join(', ')}`;
        const cwLines = doc.splitTextToSize(cwText, contentWidth - 4);
        for (const line of cwLines) {
          checkPageBreak(4);
          doc.text(line, margin + 4, y + 2.5);
          y += 3.5;
        }
      }
      y += 2;
    });
  }

  // 3. INTERNSHIP/ TRAINING EXPERIENCE
  const experiences = getCleanExperience(resumeData.experience);
  if (experiences.length > 0) {
    printSectionHeader('INTERNSHIP/ TRAINING EXPERIENCE');
    experiences.forEach((exp) => {
      checkPageBreak(16);

      doc.setFont('Times', 'normal');
      doc.setFontSize(9);
      const dateW = exp.dateRange ? doc.getTextWidth(exp.dateRange) : 0;
      const maxRoleW = contentWidth - (dateW > 0 ? dateW + 6 : 0);

      doc.setFont('Times', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...TEXT);

      const titleLeft = `${exp.role || 'Internship'}${exp.company ? ` At ${exp.company}` : ''}${exp.location ? `, ${exp.location}` : ''}`;
      const roleLines = doc.splitTextToSize(titleLeft, maxRoleW);

      doc.text(roleLines[0], margin, y + 2.8);

      if (exp.dateRange) {
        doc.setFont('Times', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        doc.text(exp.dateRange, pageWidth - margin - dateW, y + 2.8);
      }
      y += 3.8;

      if (roleLines.length > 1) {
        doc.setFont('Times', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...TEXT);
        for (let r = 1; r < roleLines.length; r++) {
          doc.text(roleLines[r], margin, y + 2.5);
          y += 3.5;
        }
      }

      doc.setFont('Times', 'normal');
      doc.setFontSize(8.8);
      doc.setTextColor(...TEXT);

      exp.description.forEach((bullet) => {
        const wrapped = doc.splitTextToSize(bullet, contentWidth - 6);
        for (let i = 0; i < wrapped.length; i++) {
          checkPageBreak(4.2);
          if (i === 0) {
            drawBulletDot(doc, margin + 1.5, y + 2.8, 0.55, TEXT);
          }
          doc.text(wrapped[i], margin + 5, y + 2.8);
          y += 3.6;
        }
      });

      if (exp.achievements) {
        checkPageBreak(4.5);
        doc.setFont('Times', 'bold');
        doc.text('Key Impact: ', margin + 5, y + 2.8);
        const pW = doc.getTextWidth('Key Impact: ');
        doc.setFont('Times', 'italic');
        const wrappedImp = doc.splitTextToSize(exp.achievements, contentWidth - 5 - pW);
        for (let i = 0; i < wrappedImp.length; i++) {
          if (i > 0) checkPageBreak(4);
          doc.text(wrappedImp[i], margin + 5 + (i === 0 ? pW : 0), y + 2.8);
          y += 3.6;
        }
      }
      y += 2.5;
    });
  }

  // 4. PROJECTS
  const projects = getCleanProjects(resumeData.projects);
  if (projects.length > 0) {
    printSectionHeader('PROJECTS');
    projects.forEach((proj) => {
      checkPageBreak(16);

      // In Recommended ATS, dateRange is on the right
      doc.setFont('Times', 'normal');
      doc.setFontSize(9);
      const dateW = proj.dateRange ? doc.getTextWidth(proj.dateRange) : 0;
      const maxTitleW = contentWidth - (dateW > 0 ? dateW + 6 : 0);

      doc.setFont('Times', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...TEXT);

      const titleStr = proj.title;
      const techStr = proj.techStack ? ` (${proj.techStack})` : '';
      const fullProjHeader = `${titleStr}${techStr}`;
      const projLines = doc.splitTextToSize(fullProjHeader, maxTitleW);

      doc.text(projLines[0], margin, y + 2.8);

      if (proj.dateRange) {
        doc.setFont('Times', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        doc.text(proj.dateRange, pageWidth - margin - dateW, y + 2.8);
      }
      y += 3.8;

      if (projLines.length > 1) {
        doc.setFont('Times', 'italic');
        doc.setFontSize(8.5);
        doc.setTextColor(80, 80, 80);
        for (let p = 1; p < projLines.length; p++) {
          doc.text(projLines[p], margin, y + 2.5);
          y += 3.5;
        }
      }

      // Clickable Link placed cleanly below title to prevent collision (only if not already in title)
      const rawTitle = proj.title || '';
      const rawLink = proj.link || '';
      const normLink = rawLink.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
      const linkAlreadyInTitle = Boolean(normLink && rawTitle.toLowerCase().includes(normLink.toLowerCase()));

      if (rawLink && !linkAlreadyInTitle) {
        doc.setFont('Times', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(...TEXT);
        const ghLabel = 'GitHub: ';
        doc.text(ghLabel, margin + 5, y + 2.5);
        const ghW = doc.getTextWidth(ghLabel);

        doc.setFont('Times', 'normal');
        doc.setTextColor(...GOLD);
        printClickableLink(doc, rawLink, margin + 5 + ghW, y + 2.5, rawLink, { underline: true, underlineColor: GOLD });
        y += 3.5;
      }

      // Bullets
      doc.setFont('Times', 'normal');
      doc.setFontSize(8.8);
      doc.setTextColor(...TEXT);

      proj.description.forEach((bullet) => {
        const cleanB = cleanBulletText(bullet);
        if (!cleanB) return;
        const wrapped = doc.splitTextToSize(cleanB, contentWidth - 6);
        for (let i = 0; i < wrapped.length; i++) {
          checkPageBreak(4.2);
          if (i === 0) {
            drawBulletDot(doc, margin + 1.5, y + 2.8, 0.55, TEXT);
          }
          doc.text(wrapped[i], margin + 5, y + 2.8);
          y += 3.6;
        }
      });
      y += 2.5;
    });
  }

  // 5. SKILLS (Two Columns Layout matching RecommendedATSTemplate)
  const techSkills = Array.isArray(resumeData.technicalSkills) ? resumeData.technicalSkills.filter(Boolean) : [];
  const toolsTech = Array.isArray(resumeData.toolsAndTech) ? resumeData.toolsAndTech.filter(Boolean) : [];
  const softSkills = Array.isArray(resumeData.softSkills) ? resumeData.softSkills.filter(Boolean) : [];

  const allTechSkills = [...techSkills, ...toolsTech];

  if (allTechSkills.length > 0 || softSkills.length > 0) {
    printSectionHeader('SKILLS');
    checkPageBreak(25);

    const colWidth = (contentWidth - 12) / 2; // 85mm each
    const col2X = margin + colWidth + 12;
    const skillsStartY = y;

    // Left Column: Technical (max Top 5)
    let leftY = skillsStartY;
    doc.setFont('Times', 'bold');
    doc.setFontSize(8.8);
    doc.setTextColor(...NAVY);
    doc.text('Technical (max Top 5)', margin, leftY + 2.5);
    leftY += 3.8;

    doc.setFont('Times', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...TEXT);

    const topTech = allTechSkills.slice(0, 5);
    if (topTech.length > 0) {
      topTech.forEach((sk) => {
        doc.text(sk, margin, leftY + 2.5);
        leftY += 3.5;
      });
    } else {
      doc.setFont('Times', 'italic');
      doc.setTextColor(120, 120, 120);
      doc.text('None specified', margin, leftY + 2.5);
      leftY += 3.5;
    }

    // Right Column: Professional (Top 3)
    let rightY = skillsStartY;
    doc.setFont('Times', 'bold');
    doc.setFontSize(8.8);
    doc.setTextColor(...NAVY);
    doc.text('Professional (Top 3)', col2X, rightY + 2.5);
    rightY += 3.8;

    doc.setFont('Times', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...TEXT);

    const topSoft = softSkills.slice(0, 3);
    if (topSoft.length > 0) {
      topSoft.forEach((sk) => {
        doc.text(sk, col2X, rightY + 2.5);
        rightY += 3.5;
      });
    } else {
      doc.setFont('Times', 'italic');
      doc.setTextColor(120, 120, 120);
      doc.text('None specified', col2X, rightY + 2.5);
      rightY += 3.5;
    }

    y = Math.max(leftY, rightY) + 2.5;
  }


  // 6. PROFESSIONAL ACHIEVEMENTS/ INSIGHTS
  const achievements = getCleanAchievements(resumeData.achievements);
  if (achievements.length > 0) {
    printSectionHeader('PROFESSIONAL ACHIEVEMENTS/ INSIGHTS');
    doc.setFont('Times', 'normal');
    doc.setFontSize(8.8);
    doc.setTextColor(...TEXT);

    achievements.forEach((ach) => {
      checkPageBreak(5);
      drawBulletDot(doc, margin + 1.5, y + 2.8, 0.55, TEXT);

      doc.setFont('Times', 'bold');
      doc.text(ach.title, margin + 5, y + 2.8);
      let achOffset = margin + 5 + doc.getTextWidth(ach.title);

      doc.setFont('Times', 'normal');
      if (ach.organization) {
        const orgStr = ` (${ach.organization})`;
        doc.text(orgStr, achOffset, y + 2.8);
        achOffset += doc.getTextWidth(orgStr);
      }
      if (ach.date) {
        const dtStr = ` [${ach.date}]`;
        doc.text(dtStr, achOffset, y + 2.8);
        achOffset += doc.getTextWidth(dtStr);
      }
      if (ach.description) {
        const fullDesc = ` — ${ach.description}`;
        const descLines = doc.splitTextToSize(fullDesc, contentWidth - (achOffset - margin));
        if (descLines.length > 0) {
          doc.text(descLines[0], achOffset, y + 2.8);
          for (let i = 1; i < descLines.length; i++) {
            y += 3.6;
            checkPageBreak(4.2);
            doc.text(descLines[i], margin + 5, y + 2.8);
          }
        }
      }
      y += 3.8;
    });
    y += 2;
  }

  // 7. CERTIFICATIONS
  const certs = getCleanCertifications(resumeData.certifications);
  if (certs.length > 0) {
    printSectionHeader('CERTIFICATIONS');
    doc.setFont('Times', 'normal');
    doc.setFontSize(8.8);
    doc.setTextColor(...TEXT);

    certs.forEach((cert) => {
      checkPageBreak(5);
      drawBulletDot(doc, margin + 1.5, y + 2.8, 0.55, TEXT);

      doc.setFont('Times', 'bold');
      doc.text(cert.name, margin + 5, y + 2.8);
      let certOffset = margin + 5 + doc.getTextWidth(cert.name);

      doc.setFont('Times', 'normal');
      if (cert.organization) {
        const orgText = ` — ${cert.organization}`;
        doc.text(orgText, certOffset, y + 2.8);
        certOffset += doc.getTextWidth(orgText);
      }
      if (cert.issueDate) {
        const dtText = ` (${cert.issueDate})`;
        doc.text(dtText, certOffset, y + 2.8);
        certOffset += doc.getTextWidth(dtText);
      }
      if (cert.credentialUrl) {
        printClickableLink(doc, ` [${cert.credentialUrl}]`, certOffset, y + 2.8, cert.credentialUrl, { underline: true, underlineColor: GOLD });
      }
      y += 3.8;
    });
    y += 2;
  }

  // 8. DECLARATION
  checkPageBreak(16);
  y += 2;
  doc.setDrawColor(...NAVY);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 3.5;

  doc.setFont('Times', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...NAVY);
  doc.text('DECLARATION', margin, y + 2.5);
  y += 3.8;

  doc.setFont('Times', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...TEXT);
  doc.text(
    resumeData.declaration ||
      'I hereby declare that all the above mentioned information is true and correct to the best of my knowledge.',
    margin,
    y + 2.5
  );
};

/**
 * Main PDF Generator entry point.
 * Generates an ATS-compliant, pixel-accurate PDF matching the selected template.
 * Returns a Node.js Buffer.
 */
export const generateResumePDF = (resumeData = {}, userData = null, template = 'classic') => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  let user = userData;
  let tpl = template;

  // Support 2-argument signature: generateResumePDF(resumeData, template)
  if (typeof userData === 'string' && (template === 'classic' || !template)) {
    tpl = userData;
    user = null;
  }

  const normalized = String(tpl || 'classic').toLowerCase().trim();

  if (normalized.includes('modern')) {
    buildModernPDF(doc, resumeData, user);
  } else if (normalized.includes('recommended')) {
    buildRecommendedPDF(doc, resumeData, user);
  } else {
    buildClassicPDF(doc, resumeData, user);
  }

  const pdfOutput = doc.output('arraybuffer');
  return Buffer.from(pdfOutput);
};

