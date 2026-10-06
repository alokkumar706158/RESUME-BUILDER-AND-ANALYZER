import { jsPDF } from 'jspdf';

/**
 * Generates an ATS-friendly, clean, single-column PDF resume.
 * Returns a node Buffer of the PDF.
 */
export const generateResumePDF = (resumeData, userData) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageHeight = 297;
  const pageWidth = 210;
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin; // 180mm
  let y = 15;

  const checkPageBreak = (neededHeight) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = 15;
      return true;
    }
    return false;
  };

  const contactInfo = resumeData.contactInfo || {};
  const name = contactInfo.fullName || userData?.name || 'Your Name';
  const hasPhoto = contactInfo.photoEnabled && contactInfo.profilePhoto;

  // Photo size calculation (default 76px -> ~20mm)
  const photoSizePx = contactInfo.photoSize || 76;
  const photoWidth = (photoSizePx / 76) * 20; // 20mm default
  const photoHeight = photoWidth * 1.333; // 3:4 ratio

  // Render Top-Right Passport Photo if present
  if (hasPhoto) {
    try {
      const imgFormat = contactInfo.profilePhoto.includes('image/png') ? 'PNG' : 'JPEG';
      doc.addImage(contactInfo.profilePhoto, imgFormat, pageWidth - margin - photoWidth, y, photoWidth, photoHeight);
    } catch (photoErr) {
      console.warn('PDF profile photo render warning:', photoErr.message);
    }
  }

  // Header: Name (ALWAYS CENTERED MIDDLE)
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42);
  const nameX = (pageWidth - doc.getTextWidth(name)) / 2;
  doc.text(name, nameX, y + 5);
  y += 5.5;

  // 2. Address (below name - ALWAYS CENTERED MIDDLE)
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  if (contactInfo.address) {
    const addrX = (pageWidth - doc.getTextWidth(contactInfo.address)) / 2;
    doc.text(contactInfo.address, addrX, y);
    y += 4.5;
  }

  // 3. Email & Phone (ALWAYS CENTERED MIDDLE)
  const emailPhoneParts = [];
  if (contactInfo.email || userData?.email) emailPhoneParts.push(contactInfo.email || userData?.email);
  if (contactInfo.phone) emailPhoneParts.push(contactInfo.phone);
  if (emailPhoneParts.length > 0) {
    const epText = emailPhoneParts.join('  |  ');
    const epX = (pageWidth - doc.getTextWidth(epText)) / 2;
    doc.text(epText, epX, y);
    y += 4.5;
  }

  // 4. Links (ALWAYS CENTERED MIDDLE)
  const linkParts = [];
  if (contactInfo.linkedin || userData?.linkedin) linkParts.push(contactInfo.linkedin || userData?.linkedin);
  if (contactInfo.github || userData?.github) linkParts.push(contactInfo.github || userData?.github);
  if (contactInfo.portfolio) linkParts.push(contactInfo.portfolio);

  if (linkParts.length > 0) {
    linkParts.forEach(linkText => {
      const linkX = (pageWidth - doc.getTextWidth(linkText)) / 2;
      doc.text(linkText, linkX, y);
      y += 4.5;
    });
    y += 1;
  }

  // Ensure y clears photo height if photo exists
  if (hasPhoto && y < 15 + photoHeight + 2) {
    y = 15 + photoHeight + 2;
  }

  // Divider Line
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  const printSectionHeader = (title) => {
    checkPageBreak(12);
    y += 2;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(title.toUpperCase(), margin, y);
    y += 1.5;
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.2);
    doc.line(margin, y, pageWidth - margin, y);
    y += 4;
  };

  // 1. Summary
  if (resumeData.summary) {
    printSectionHeader('Professional Summary');
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85); // slate-700
    const summaryLines = doc.splitTextToSize(resumeData.summary, contentWidth);
    for (const line of summaryLines) {
      checkPageBreak(5);
      doc.text(line, margin, y);
      y += 4.5;
    }
    y += 2;
  }

  // 2. Skills
  if (resumeData.skills && resumeData.skills.length > 0) {
    printSectionHeader('Technical Skills');
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    const skillsText = resumeData.skills.join(', ');
    const skillsLines = doc.splitTextToSize(skillsText, contentWidth);
    for (const line of skillsLines) {
      checkPageBreak(5);
      doc.text(line, margin, y);
      y += 4.5;
    }
    y += 2;
  }

  // 3. Experience
  if (resumeData.experience && resumeData.experience.length > 0) {
    printSectionHeader('Professional Experience');
    for (const exp of resumeData.experience) {
      checkPageBreak(16);
      
      // Role & Dates
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(exp.role, margin, y);
      
      doc.setFont('Helvetica', 'normal');
      const durationWidth = doc.getTextWidth(exp.duration || '');
      doc.text(exp.duration || '', pageWidth - margin - durationWidth, y);
      y += 4;

      // Company
      doc.setFont('Helvetica', 'oblique');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text(exp.company || '', margin, y);
      y += 4.5;

      // Bullet descriptions
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      if (exp.description && exp.description.length > 0) {
        for (const desc of exp.description) {
          const bulletText = `•  ${desc}`;
          const bulletLines = doc.splitTextToSize(bulletText, contentWidth - 4);
          for (const line of bulletLines) {
            checkPageBreak(5);
            doc.text(line, margin + 4, y);
            y += 4;
          }
        }
      }
      y += 2.5;
    }
  }

  // 4. Projects
  if (resumeData.projects && resumeData.projects.length > 0) {
    printSectionHeader('Key Projects');
    for (const proj of resumeData.projects) {
      checkPageBreak(16);

      // Title
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      let title = proj.title || '';
      if (proj.techStack && proj.techStack.length > 0) {
        title += ` | [${proj.techStack.join(', ')}]`;
      }
      doc.text(title, margin, y);

      // Link
      if (proj.link) {
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(37, 99, 235); // blue-600
        const linkWidth = doc.getTextWidth(proj.link);
        doc.text(proj.link, pageWidth - margin - linkWidth, y);
      }
      y += 4.5;

      // Bullets
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      if (proj.description && proj.description.length > 0) {
        for (const desc of proj.description) {
          const bulletText = `•  ${desc}`;
          const bulletLines = doc.splitTextToSize(bulletText, contentWidth - 4);
          for (const line of bulletLines) {
            checkPageBreak(5);
            doc.text(line, margin + 4, y);
            y += 4;
          }
        }
      }
      y += 2.5;
    }
  }

  // 5. Education
  if (resumeData.education && resumeData.education.length > 0) {
    printSectionHeader('Education');
    for (const edu of resumeData.education) {
      checkPageBreak(12);

      // Degree & Dates
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(edu.degree || '', margin, y);

      doc.setFont('Helvetica', 'normal');
      const durationWidth = doc.getTextWidth(edu.duration || '');
      doc.text(edu.duration || '', pageWidth - margin - durationWidth, y);
      y += 4;

      // Institution & GPA
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      let schoolText = edu.institution || '';
      if (edu.gpa) {
        schoolText += `  |  GPA: ${edu.gpa}`;
      }
      doc.text(schoolText, margin, y);
      y += 5.5;
    }
  }

  // 6. Achievements & Certifications
  const hasAchievements = resumeData.achievements && resumeData.achievements.length > 0;
  const hasCertifications = resumeData.certifications && resumeData.certifications.length > 0;

  if (hasAchievements || hasCertifications) {
    printSectionHeader('Achievements & Certifications');
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);

    if (hasAchievements) {
      for (const ach of resumeData.achievements) {
        const textStr = typeof ach === 'object' && ach !== null 
          ? `${ach.title || ''}${ach.organization ? ` (${ach.organization})` : ''}${ach.description ? ` — ${ach.description}` : ''}` 
          : String(ach);
        const bulletText = `•  ${textStr}`;
        const bulletLines = doc.splitTextToSize(bulletText, contentWidth - 4);
        for (const line of bulletLines) {
          checkPageBreak(5);
          doc.text(line, margin + 4, y);
          y += 4;
        }
      }
      y += 1.5;
    }

    if (hasCertifications) {
      for (const cert of resumeData.certifications) {
        const textStr = typeof cert === 'object' && cert !== null 
          ? `${cert.name || ''}${cert.organization ? ` — ${cert.organization}` : ''}${cert.issueDate ? ` (${cert.issueDate})` : ''}` 
          : String(cert);
        const bulletText = `•  ${textStr}`;
        const bulletLines = doc.splitTextToSize(bulletText, contentWidth - 4);
        for (const line of bulletLines) {
          checkPageBreak(5);
          doc.text(line, margin + 4, y);
          y += 4;
        }
      }
      y += 1.5;
    }
  }

  const pdfOutput = doc.output('arraybuffer');
  return Buffer.from(pdfOutput);
};
