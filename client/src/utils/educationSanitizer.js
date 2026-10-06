export const sanitizeEducationList = (rawList) => {
  if (!Array.isArray(rawList)) return [];

  const cleanList = [];

  rawList.forEach((item) => {
    if (!item) return;

    let degree = String(item.degree || '').trim();
    let institution = String(item.institution || '').trim();
    let branch = String(item.branch || '').trim();
    let location = String(item.location || '').trim();
    let gpa = String(item.gpa || '').trim();
    let startYear = String(item.startYear || '').trim();
    let endYear = String(item.endYear || '').trim();
    let duration = String(item.duration || '').trim();

    // 1. Strip trailing INTERNSHIP / Octanet / garbage underlines
    const stripGarbage = (str) => {
      if (!str) return '';
      return str
        .replace(/(INTERNSHIP|TRAINING|WORK EXPERIENCE)[\s\S]*/i, '')
        .replace(/Octanet[\s\S]*/i, '')
        .replace(/_+/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    };

    degree = stripGarbage(degree);
    institution = stripGarbage(institution);
    location = stripGarbage(location);
    branch = stripGarbage(branch);

    // Clean gpa
    gpa = stripGarbage(gpa)
      .replace(/^(cgpa|gpa|score|percentage|marks)[\s:]*/i, '')
      .replace(/[^\d.%]/g, '')
      .trim();

    // Clean dates (keep only 4 digit year if present)
    const extractYear = (str) => {
      const match = String(str || '').match(/\b(19|20)\d{2}\b/);
      return match ? match[0] : '';
    };

    const cleanEndY = extractYear(endYear) || extractYear(duration);
    const cleanStartY = extractYear(startYear);

    // 2. Pre-check if degree or institution contains concatenated multi-entry blocks
    const degreeSplitRegex = /(?=(?:Bachelor\s+of\s+Technology|B\.?Tech|Intermediate|High\s*School|Class\s*XII|Class\s*X|Secondary))/i;
    const combinedStr = `${degree}, ${institution}, ${location}`;

    if (
      (combinedStr.includes(',') || combinedStr.includes('\n')) &&
      combinedStr.match(/Intermediate|High\s*School|12th|10th|Class\s*X/i) &&
      combinedStr.match(/Bachelor|B\.?Tech|B\.?E/i)
    ) {
      // Split concatenated string into separate degree entries
      const segments = combinedStr.split(degreeSplitRegex).map(s => s.trim()).filter(Boolean);

      segments.forEach((seg) => {
        const parts = seg.split(',').map(p => p.trim()).filter(Boolean);
        if (parts.length === 0) return;

        let segDeg = parts[0] || '';
        let segBranch = '';
        if (segDeg.toLowerCase().includes(' in ')) {
          const bp = segDeg.split(/\s+in\s+/i);
          segDeg = bp[0];
          segBranch = bp[1] || '';
        }

        let segInst = parts[1] || '';
        let segLoc = parts[2] || '';
        let segGpa = '';
        let segYear = '';

        parts.forEach((p) => {
          const yr = extractYear(p);
          if (yr) segYear = yr;

          const numMatch = p.match(/\b(\d{1,2}(\.\d+)?%?)\b/);
          if (numMatch && Number(numMatch[1]) <= 100 && !p.toLowerCase().includes('202') && !p.toLowerCase().includes('201')) {
            segGpa = numMatch[1];
          }
        });

        cleanList.push({
          degree: segDeg,
          branch: segBranch || branch,
          institution: segInst,
          location: segLoc && !/\d{4}/.test(segLoc) ? segLoc : '',
          gpa: segGpa,
          startYear: '',
          endYear: segYear,
          duration: segYear,
          relevantCoursework: item.relevantCoursework || []
        });
      });
    } else {
      cleanList.push({
        ...item,
        degree,
        branch,
        institution,
        location,
        gpa,
        startYear: cleanStartY,
        endYear: cleanEndY,
        duration: cleanEndY
      });
    }
  });

  // Filter out empty entries and any stray internship/octanet items
  return cleanList.filter((edu) => {
    const d = (edu.degree || '').toLowerCase();
    const inst = (edu.institution || '').toLowerCase();
    return d.length > 0 && !d.includes('internship') && !d.includes('octanet') && !inst.includes('octanet');
  });
};
