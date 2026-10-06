import React from 'react';
import { sanitizeEducationList } from '../../utils/educationSanitizer';

const StarRating = ({ rating = 5 }) => {
  const stars = [];
  const count = Math.max(1, Math.min(5, Number(rating) || 5));
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i} className={i <= count ? 'text-amber-400 font-bold' : 'text-slate-600 font-normal'}>
        ★
      </span>
    );
  }
  return <span className="inline-flex space-x-0.5 text-xs">{stars}</span>;
};

const ModernATSTemplate = ({ data = {} }) => {
  const contact = data.contactInfo || {};
  const fullName = contact.fullName || 'ALOK KUMAR';
  const email = contact.email || '';
  const phone = contact.phone || '';
  const linkedin = contact.linkedin || '';
  const github = contact.github || '';
  const portfolio = contact.portfolio || '';
  const address = contact.address || '';

  const customLinks = Array.isArray(contact.customLinks) ? contact.customLinks.filter(l => l.heading && l.url) : [];
  const dedicatedLinks = Array.isArray(data.links) ? data.links.filter(l => l.heading && l.url) : [];
  const allCustomLinks = [...customLinks, ...dedicatedLinks];

  // Skills processing with star ratings (NO percentage bars)
  const skillsList = Array.isArray(data.skills)
    ? data.skills.map((s, idx) => {
        if (typeof s === 'object' && s !== null) return { name: s.name, rating: s.rating || 5 };
        return { name: s, rating: 5 - (idx % 2) };
      }).filter(s => s.name)
    : [];

  const languagesList = Array.isArray(data.languages) && data.languages.length > 0
    ? data.languages.filter(l => l.name)
    : [
        { name: 'English', rating: 5 },
        { name: 'Hindi', rating: 5 }
      ];

  return (
    <div className="bg-white text-slate-900 grid grid-cols-12 max-w-[800px] mx-auto shadow-xl rounded-sm min-h-[950px] font-sans text-xs print:p-0 print:shadow-none">
      {/* LEFT SIDEBAR */}
      <div className="col-span-4 bg-slate-900 text-slate-100 p-6 space-y-6 flex flex-col justify-between">
        <div className="space-y-6">
          {/* USER PROFILE PHOTO & NAME */}
          <div className="text-center border-b border-slate-700 pb-4 space-y-3">
            {contact.photoEnabled && contact.profilePhoto && (
              <div 
                style={{ width: `${contact.photoSize || 80}px`, height: `${contact.photoSize || 80}px` }}
                className="rounded-full mx-auto overflow-hidden transition-all duration-150"
              >
                <img
                  src={contact.profilePhoto}
                  alt={fullName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <h1 className="text-xl font-extrabold uppercase tracking-wide text-white leading-tight">
              {fullName}
            </h1>
          </div>

          {/* CONTACT INFO */}
          <div className="space-y-2 text-[11px] text-slate-300">
            {address && <div className="text-slate-300 font-medium">📍 {address}</div>}
            {(email || phone) && (
              <div className="space-y-1">
                {email && <div className="truncate">✉️ {email}</div>}
                {phone && <div className="truncate">📞 {phone}</div>}
              </div>
            )}
            {linkedin && <div className="truncate font-medium text-slate-200">🔗 {linkedin}</div>}
            {github && <div className="truncate">💻 {github}</div>}
            {portfolio && <div className="truncate">🌐 {portfolio}</div>}
          </div>

          {/* SKILLS WITH STAR RATINGS (★★★★★) - NO PERCENTAGE BARS */}
          {skillsList.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1 mb-2">
                Skills
              </h2>
              <div className="space-y-1.5">
                {skillsList.map((skill, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="truncate pr-1 text-slate-200 font-medium">{skill.name}</span>
                    <StarRating rating={skill.rating} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LANGUAGES */}
          {languagesList.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1 mb-2">
                Languages
              </h2>
              <div className="space-y-1.5">
                {languagesList.map((lang, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-slate-200">{lang.name}</span>
                    <StarRating rating={lang.rating} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="text-[10px] text-slate-500 pt-4 border-t border-slate-800 flex items-center justify-between">
          <span>ATS Optimized</span>
          <span className="text-emerald-400 font-semibold">100% Valid</span>
        </div>
      </div>

      {/* RIGHT MAIN PANEL */}
      <div className="col-span-8 p-6 space-y-5 bg-white text-slate-900">
        {/* SUMMARY */}
        {data.summary && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-900 pb-0.5 mb-2">
              Summary
            </h2>
            <p className="text-slate-700 leading-normal">{data.summary}</p>
          </div>
        )}

        {/* WORK EXPERIENCE */}
        {Array.isArray(data.experience) && data.experience.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-900 pb-0.5 mb-2">
              Experience
            </h2>
            <div className="space-y-3">
              {data.experience.map((exp, idx) => {
                if (!exp.role && !exp.company) return null;
                const dateRange = exp.startDate && exp.endDate ? `${exp.startDate} - ${exp.currentWorking ? 'Present' : exp.endDate}` : exp.duration;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-baseline font-bold text-slate-900">
                      <span>
                        {exp.role} {exp.company && <span className="font-normal text-slate-600">| {exp.company}</span>}
                      </span>
                      {dateRange && <span className="text-[11px] font-normal text-slate-500">{dateRange}</span>}
                    </div>
                    {Array.isArray(exp.description) && exp.description.length > 0 && (
                      <ul className="list-disc list-inside space-y-0.5 text-slate-700 text-xs">
                        {exp.description.map((b, bIdx) => (
                          <li key={bIdx}>{b}</li>
                        ))}
                      </ul>
                    )}
                    {exp.achievements && (
                      <p className="text-[11px] text-slate-600 italic">Impact: {exp.achievements}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* KEY PROJECTS */}
        {Array.isArray(data.projects) && data.projects.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-900 pb-0.5 mb-2">
              Projects
            </h2>
            <div className="space-y-3">
              {data.projects.map((proj, idx) => {
                if (!proj.title) return null;
                const tech = Array.isArray(proj.techStack) && proj.techStack.length > 0 ? ` (${proj.techStack.join(', ')})` : '';
                const linkDisplay = proj.link || proj.github || proj.liveDemo;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-baseline font-bold text-slate-900">
                      <span>
                        {proj.title}
                        <span className="font-normal text-[11px] text-slate-600">{tech}</span>
                      </span>
                      {linkDisplay && <span className="text-[11px] font-normal text-blue-600 underline">{linkDisplay}</span>}
                    </div>
                    {Array.isArray(proj.description) && proj.description.length > 0 && (
                      <ul className="list-disc list-inside space-y-0.5 text-slate-700 text-xs">
                        {proj.description.map((b, bIdx) => (
                          <li key={bIdx}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* EDUCATION */}
        {Array.isArray(data.education) && data.education.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-900 pb-0.5 mb-2">
              Education
            </h2>
            <div className="space-y-2">
              {sanitizeEducationList(data.education).map((edu, idx) => {
                if (!edu.institution && !edu.degree) return null;

                const cleanVal = (val) => {
                  if (!val) return '';
                  const s = String(val).trim();
                  return (s.toLowerCase() === 'null' || s.toLowerCase() === 'n/a') ? '' : s;
                };

                const startY = cleanVal(edu.startYear);
                const endY = cleanVal(edu.endYear);
                const dur = cleanVal(edu.duration);
                const yearDisplay = endY 
                  ? (startY ? `${startY} - ${endY}` : endY)
                  : (startY || dur);

                const gpaDisplay = cleanVal(edu.gpa);

                const degreeStr = edu.degree || '';
                const branchStr = edu.branch && !degreeStr.toLowerCase().includes(edu.branch.toLowerCase())
                  ? ` in ${edu.branch}`
                  : '';

                return (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between items-baseline font-bold text-slate-900">
                      <span>
                        {degreeStr}{branchStr}
                        {edu.institution && <span className="font-normal text-slate-700">, {edu.institution}</span>}
                        {edu.location && <span className="font-normal text-slate-600">, {edu.location}</span>}
                      </span>
                      {yearDisplay && <span className="text-[11px] font-normal text-slate-500 ml-4 flex-shrink-0">— {yearDisplay}</span>}
                    </div>
                    {gpaDisplay && <div className="text-[11px] text-slate-600">CGPA/Percentage: {gpaDisplay}</div>}
                    {Array.isArray(edu.relevantCoursework) && edu.relevantCoursework.length > 0 && (
                      <div className="text-[11px] text-slate-600">
                        <span className="font-semibold text-slate-700">Coursework: </span>
                        {edu.relevantCoursework.join(', ')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CERTIFICATIONS */}
        {Array.isArray(data.certifications) && data.certifications.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-900 pb-0.5 mb-2">
              Certifications
            </h2>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              {data.certifications.map((cert, idx) => {
                if (typeof cert === 'object' && cert !== null) {
                  if (!cert.name) return null;
                  return (
                    <li key={idx}>
                      <span className="font-bold text-slate-900">{cert.name}</span>
                      {cert.organization && <span> — {cert.organization}</span>}
                      {cert.issueDate && <span className="text-[11px] text-slate-500"> ({cert.issueDate})</span>}
                      {cert.credentialUrl && <span className="text-[11px] text-blue-600 underline ml-1">{cert.credentialUrl}</span>}
                    </li>
                  );
                }
                return <li key={idx}>{cert}</li>;
              })}
            </ul>
          </div>
        )}

        {/* ACHIEVEMENTS */}
        {Array.isArray(data.achievements) && data.achievements.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-900 pb-0.5 mb-2">
              Achievements
            </h2>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              {data.achievements.map((ach, idx) => {
                if (typeof ach === 'object' && ach !== null) {
                  if (!ach.title) return null;
                  return (
                    <li key={idx}>
                      <span className="font-bold text-slate-900">{ach.title}</span>
                      {ach.organization && <span className="text-slate-600"> ({ach.organization})</span>}
                      {ach.date && <span className="text-slate-500 text-[11px]"> [{ach.date}]</span>}
                      {ach.description && <span className="text-slate-700"> — {ach.description}</span>}
                    </li>
                  );
                }
                return <li key={idx}>{ach}</li>;
              })}
            </ul>
          </div>
        )}

        {/* DECLARATION */}
        <div className="pt-3 border-t-2 border-slate-900 mt-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1">
            Declaration
          </h2>
          <p className="text-slate-700 text-xs italic leading-relaxed">
            I hereby declare that all the information mentioned above is true and correct to the best of my knowledge and belief.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModernATSTemplate;
