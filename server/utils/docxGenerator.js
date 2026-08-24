import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  AlignmentType, 
  BorderStyle 
} from 'docx';

export const generateResumeDOCX = async (resumeData, user) => {
  const contact = resumeData.contactInfo || {};
  const fullName = contact.fullName || user?.name || 'ALOK KUMAR';
  const email = contact.email || user?.email || '';
  const phone = contact.phone || '';
  const linkedin = contact.linkedin || '';
  const github = contact.github || '';
  const portfolio = contact.portfolio || '';
  const customLinks = Array.isArray(contact.customLinks) ? contact.customLinks.filter(l => l.url) : [];
  const allLinks = [
    linkedin,
    github,
    portfolio,
    ...customLinks.map(l => l.heading ? `${l.heading}: ${l.url}` : l.url)
  ].filter(Boolean);
  const emailPhoneLine = [email, phone].filter(Boolean).join('  |  ');

  const children = [
    // 1. Name
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: fullName.toUpperCase(),
          bold: true,
          size: 32,
          font: 'Calibri'
        })
      ]
    })
  ];

  // 2. Address
  if (address) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spaceAfter: 60,
        children: [
          new TextRun({
            text: address,
            size: 20,
            color: '555555',
            font: 'Calibri'
          })
        ]
      })
    );
  }

  // 3. Email & Phone
  if (emailPhoneLine) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spaceAfter: 60,
        children: [
          new TextRun({
            text: emailPhoneLine,
            size: 20,
            color: '555555',
            font: 'Calibri'
          })
        ]
      })
    );
  }

  // 4. Links (each link on its own line)
  if (allLinks.length > 0) {
    allLinks.forEach((linkText, idx) => {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spaceAfter: idx === allLinks.length - 1 ? 300 : 60,
          children: [
            new TextRun({
              text: linkText,
              size: 20,
              color: '555555',
              font: 'Calibri'
            })
          ]
        })
      );
    });
  }

  const addHeading = (title) => {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spaceBefore: 240,
        spaceAfter: 120,
        border: {
          bottom: { color: 'CCCCCC', space: 1, value: BorderStyle.SINGLE, size: 6 }
        },
        children: [
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            size: 22,
            color: '1F2937',
            font: 'Calibri'
          })
        ]
      })
    );
  };

  // Summary
  if (resumeData.summary) {
    addHeading('Professional Summary');
    children.push(
      new Paragraph({
        spaceAfter: 200,
        children: [
          new TextRun({
            text: resumeData.summary,
            size: 20,
            font: 'Calibri'
          })
        ]
      })
    );
  }

  // Skills
  const skillsList = Array.isArray(resumeData.skills)
    ? resumeData.skills.map(s => typeof s === 'object' ? s.name : s).filter(Boolean)
    : [];

  if (skillsList.length > 0) {
    addHeading('Technical Skills');
    children.push(
      new Paragraph({
        spaceAfter: 200,
        children: [
          new TextRun({
            text: skillsList.join(', '),
            size: 20,
            font: 'Calibri'
          })
        ]
      })
    );
  }

  // Experience
  if (Array.isArray(resumeData.experience) && resumeData.experience.length > 0) {
    addHeading('Work Experience');
    resumeData.experience.forEach(exp => {
      if (!exp.role && !exp.company) return;
      children.push(
        new Paragraph({
          spaceBefore: 120,
          spaceAfter: 60,
          children: [
            new TextRun({ text: exp.role || 'Position', bold: true, size: 20, font: 'Calibri' }),
            new TextRun({ text: exp.company ? `  —  ${exp.company}` : '', italic: true, size: 20, font: 'Calibri' }),
            new TextRun({ text: exp.duration ? ` (${exp.duration})` : '', size: 18, color: '666666', font: 'Calibri' })
          ]
        })
      );
      if (Array.isArray(exp.description)) {
        exp.description.forEach(bullet => {
          if (!bullet) return;
          children.push(
            new Paragraph({
              bullet: { level: 0 },
              spaceAfter: 40,
              children: [
                new TextRun({ text: bullet, size: 19, font: 'Calibri' })
              ]
            })
          );
        });
      }
    });
  }

  // Projects
  if (Array.isArray(resumeData.projects) && resumeData.projects.length > 0) {
    addHeading('Key Projects');
    resumeData.projects.forEach(proj => {
      if (!proj.title) return;
      const tech = Array.isArray(proj.techStack) && proj.techStack.length > 0 ? ` [${proj.techStack.join(', ')}]` : '';
      children.push(
        new Paragraph({
          spaceBefore: 120,
          spaceAfter: 60,
          children: [
            new TextRun({ text: proj.title, bold: true, size: 20, font: 'Calibri' }),
            new TextRun({ text: tech, italic: true, size: 18, color: '4B5563', font: 'Calibri' }),
            new TextRun({ text: proj.link ? ` — ${proj.link}` : '', size: 18, color: '2563EB', font: 'Calibri' })
          ]
        })
      );
      if (Array.isArray(proj.description)) {
        proj.description.forEach(bullet => {
          if (!bullet) return;
          children.push(
            new Paragraph({
              bullet: { level: 0 },
              spaceAfter: 40,
              children: [
                new TextRun({ text: bullet, size: 19, font: 'Calibri' })
              ]
            })
          );
        });
      }
    });
  }

  // Education
  if (Array.isArray(resumeData.education) && resumeData.education.length > 0) {
    addHeading('Education');
    resumeData.education.forEach(edu => {
      if (!edu.institution && !edu.degree) return;
      children.push(
        new Paragraph({
          spaceBefore: 100,
          spaceAfter: 60,
          children: [
            new TextRun({ text: edu.degree || 'Degree', bold: true, size: 20, font: 'Calibri' }),
            new TextRun({ text: edu.institution ? `, ${edu.institution}` : '', size: 20, font: 'Calibri' }),
            new TextRun({ text: edu.duration ? ` (${edu.duration})` : '', size: 18, color: '666666', font: 'Calibri' }),
            new TextRun({ text: edu.gpa ? ` — GPA: ${edu.gpa}` : '', italic: true, size: 18, font: 'Calibri' })
          ]
        })
      );
    });
  }

  // Certifications
  if (Array.isArray(resumeData.certifications) && resumeData.certifications.length > 0) {
    addHeading('Certifications');
    resumeData.certifications.forEach(cert => {
      if (!cert) return;
      const certText = typeof cert === 'object' && cert !== null 
        ? `${cert.name || ''}${cert.organization ? ` — ${cert.organization}` : ''}${cert.issueDate ? ` (${cert.issueDate})` : ''}` 
        : String(cert);
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          spaceAfter: 40,
          children: [new TextRun({ text: certText, size: 19, font: 'Calibri' })]
        })
      );
    });
  }

  // Achievements
  if (Array.isArray(resumeData.achievements) && resumeData.achievements.length > 0) {
    addHeading('Achievements');
    resumeData.achievements.forEach(ach => {
      if (!ach) return;
      const achText = typeof ach === 'object' && ach !== null 
        ? `${ach.title || ''}${ach.organization ? ` (${ach.organization})` : ''}${ach.description ? ` — ${ach.description}` : ''}` 
        : String(ach);
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          spaceAfter: 40,
          children: [new TextRun({ text: achText, size: 19, font: 'Calibri' })]
        })
      );
    });
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, bottom: 720, left: 720, right: 720 }
          }
        },
        children
      }
    ]
  });

  return await Packer.toBuffer(doc);
};
