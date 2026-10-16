export const DUMMY_LINK_PATTERNS = [
  'linkedin.com/in/alokkumar',
  'github.com/alokkumar',
  'alokkumar.dev',
  'linkedin.com/in/myprofile',
  'github.com/mygithub'
];

/**
 * Returns a deduplicated array of { heading, url } link objects,
 * excluding known hardcoded dummy links and empty URLs.
 */
export const getCleanContactLinks = (contactInfo = {}) => {
  if (!contactInfo) return [];

  const rawLinks = [];

  // 1. Gather customLinks if present
  if (Array.isArray(contactInfo.customLinks)) {
    contactInfo.customLinks.forEach(l => {
      if (l && l.url && typeof l.url === 'string' && l.url.trim()) {
        rawLinks.push({ heading: l.heading || 'Link', url: l.url.trim() });
      }
    });
  }

  // 2. Gather legacy fields if present
  const legacyFields = [
    { heading: 'LinkedIn', url: contactInfo.linkedin },
    { heading: 'GitHub', url: contactInfo.github },
    { heading: 'Portfolio', url: contactInfo.portfolio }
  ];

  legacyFields.forEach(item => {
    if (item.url && typeof item.url === 'string' && item.url.trim()) {
      rawLinks.push({ heading: item.heading, url: item.url.trim() });
    }
  });

  // 3. Deduplicate by normalized URL and filter out hardcoded dummy links
  const seenUrls = new Set();
  const cleanLinks = [];

  rawLinks.forEach(item => {
    const norm = item.url.toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '');
    const isDummy = DUMMY_LINK_PATTERNS.some(dummy => norm.includes(dummy.toLowerCase()));
    if (!isDummy && !seenUrls.has(norm)) {
      seenUrls.add(norm);
      cleanLinks.push({
        heading: item.heading,
        url: item.url
      });
    }
  });

  return cleanLinks;
};

/**
 * Sanitizes contactInfo state to ensure no dummy links exist,
 * and normalizes customLinks.
 */
export const sanitizeContactInfo = (contactInfo = {}) => {
  if (!contactInfo) return { customLinks: [] };
  const cleanLinks = getCleanContactLinks(contactInfo);
  return {
    ...contactInfo,
    linkedin: cleanLinks.find(l => l.heading.toLowerCase() === 'linkedin')?.url || '',
    github: cleanLinks.find(l => l.heading.toLowerCase() === 'github')?.url || '',
    portfolio: cleanLinks.find(l => l.heading.toLowerCase() === 'portfolio')?.url || '',
    customLinks: cleanLinks
  };
};
