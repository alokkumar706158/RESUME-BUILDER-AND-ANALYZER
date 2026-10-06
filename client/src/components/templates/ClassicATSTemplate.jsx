import React from 'react';
import { sanitizeEducationList } from '../../utils/educationSanitizer';

const ClassicATSTemplate = ({ data = {} }) => {
  const contact = data.contactInfo || {};
  const fullName = contact.fullName || 'ALOK KUMAR';
  const email = contact.email || '';
  const phone = contact.phone || '';
  const linkedin = contact.linkedin || '';
  const github = contact.github || '';
  const portfolio = contact.portfolio || '';
  const address = contact.address || '';

  // Group contact lines: Name -> Address -> Email & Phone -> Each Link on its own line
  const lineAddress = [address].filter(Boolean);
  const lineEmailPhone = [email, phone].filter(Boolean);
  const allLinks = [
    linkedin,
    github,
    portfolio
  ].filter(Boolean);

  const contactLines = [
    lineAddress,
    lineEmailPhone,
    ...allLinks.map(link => [link])
  ].filter(line => line.length > 0);

  // Normalize skills
  const skillsList = Array.isArray(data.skills)
    ? data.skills.map(s => (typeof s === 'object' ? s.name : s)).filter(Boolean)
    : [];

  const softSkills = Array.isArray(data.softSkills) ? data.softSkills.filter(Boolean) : [];
  const techSkills = Array.isArray(data.technicalSkills) ? data.technicalSkills.filter(Boolean) : [];
  const toolsTech = Array.isArray(data.toolsAndTech) ? data.toolsAndTech.filter(Boolean) : [];

  const combinedSkills = [
    skillsList.length > 0 ? `Core Competencies: ${skillsList.join(', ')}` : null,
    techSkills.length > 0 ? `Technical Skills: ${techSkills.join(', ')}` : null,
    toolsTech.length > 0 ? `Tools & Technologies: ${toolsTech.join(', ')}` : null,
    softSkills.length > 0 ? `Soft Skills: ${softSkills.join(', ')}` : null
  ].filter(Boolean);

  const hasPhoto = contact.photoEnabled && contact.profilePhoto;
  const photoSize = contact.photoSize || 76;
  const photoHeight = Math.round(photoSize * 1.333);

  return (
    <div className="bg-white text-black p-8 font-sans text-xs leading-relaxed max-w-[800px] mx-auto shadow-xl rounded-sm print:p-0 print:shadow-none min-h-[950px]">
      {/* HEADER */}
      <div className="relative border-b border-black pb-3 mb-4">
        {hasPhoto && (
          <div 
            style={{ width: `${photoSize}px`, height: `${photoHeight}px` }}
            className="absolute top-0 right-0 flex-shrink-0 overflow-hidden transition-all duration-150"
          >
            <img
              src={contact.profilePhoto}
              alt={fullName}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div 
          style={{
            paddingLeft: hasPhoto ? `${photoSize + 12}px` : undefined,
            paddingRight: hasPhoto ? `${photoSize + 12}px` : undefined
          }}
          className="text-center space-y-1 transition-all duration-150"
        >
          <h1 className="text-2xl font-bold uppercase tracking-wider mb-1 text-black">{fullName}</h1>
          {contactLines.map((row, rIdx) => (
            <div key={rIdx} className="flex flex-wrap justify-center items-center gap-x-2 text-[11px] text-black">
              {row.map((item, idx) => (
                <React.Fragment key={idx}>
                  <span>{item}</span>
                  {idx < row.length - 1 && <span className="text-gray-400">•</span>}
                </React.Fragment>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* SUMMARY */}
      {data.summary && (
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wide border-b border-black pb-0.5 mb-1.5 text-black">
            Professional Summary
          </h2>
          <p className="text-black text-xs leading-normal">{data.summary}</p>
        </div>
      )}

      {/* SKILLS */}
      {combinedSkills.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wide border-b border-black pb-0.5 mb-1.5 text-black">
            Skills & Competencies
          </h2>
          <div className="space-y-1 text-black text-xs">
            {combinedSkills.map((line, idx) => (
              <p key={idx}>{line}</p>
            ))}
          </div>
        </div>
      )}

      {/* WORK EXPERIENCE */}
      {Array.isArray(data.experience) && data.experience.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wide border-b border-black pb-0.5 mb-1.5 text-black">
            Work Experience
          </h2>
          <div className="space-y-3">
            {data.experience.map((exp, idx) => {
              if (!exp.role && !exp.company) return null;
              const dateRange = exp.startDate && exp.endDate ? `${exp.startDate} - ${exp.currentWorking ? 'Present' : exp.endDate}` : exp.duration;
              return (
                <div key={idx}>
                  <div className="flex justify-between items-baseline font-semibold text-black">
                    <span>
                      {exp.role} {exp.company && `| ${exp.company}`}
                      {exp.location && <span className="font-normal text-gray-700"> ({exp.location})</span>}
                    </span>
                    {dateRange && <span className="text-[11px] font-normal text-gray-800">{dateRange}</span>}
                  </div>
                  {Array.isArray(exp.description) && exp.description.length > 0 && (
                    <ul className="list-disc list-inside mt-1 space-y-0.5 text-black">
                      {exp.description.map((b, bIdx) => (
                        <li key={bIdx} className="leading-tight">
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                  {exp.achievements && (
                    <p className="mt-0.5 text-[11px] text-gray-800 italic">
                      <span className="font-semibold not-italic text-black">Key Impact: </span>{exp.achievements}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PROJECTS */}
      {Array.isArray(data.projects) && data.projects.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wide border-b border-black pb-0.5 mb-1.5 text-black">
            Projects
          </h2>
          <div className="space-y-3">
            {data.projects.map((proj, idx) => {
              if (!proj.title) return null;
              const tech = Array.isArray(proj.techStack) && proj.techStack.length > 0 ? ` (${proj.techStack.join(', ')})` : '';
              const linkDisplay = proj.link || proj.github || proj.liveDemo;
              return (
                <div key={idx}>
                  <div className="flex justify-between items-baseline font-semibold text-black">
                    <span>
                      {proj.title}
                      <span className="font-normal italic text-[11px] text-gray-800">{tech}</span>
                    </span>
                    {linkDisplay && <span className="text-[11px] font-normal underline text-black">{linkDisplay}</span>}
                  </div>
                  {Array.isArray(proj.description) && proj.description.length > 0 && (
                    <ul className="list-disc list-inside mt-1 space-y-0.5 text-black">
                      {proj.description.map((b, bIdx) => (
                        <li key={bIdx} className="leading-tight">
                          {b}
                        </li>
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
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wide border-b border-black pb-0.5 mb-1.5 text-black">
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
                <div key={idx} className="text-black mb-1">
                  <div className="flex justify-between items-baseline font-semibold">
                    <span>
                      {degreeStr}{branchStr}
                      {edu.institution && <span className="font-normal">, {edu.institution}</span>}
                      {edu.location && <span className="font-normal text-[11px] text-gray-700">, {edu.location}</span>}
                    </span>
                    {yearDisplay && <span className="text-[11px] font-normal flex-shrink-0 ml-4">— {yearDisplay}</span>}
                  </div>
                  {gpaDisplay && <div className="text-[11px] text-gray-800">CGPA/Score: {gpaDisplay}</div>}
                  {Array.isArray(edu.relevantCoursework) && edu.relevantCoursework.length > 0 && (
                    <div className="text-[11px] text-gray-800">
                      <span className="font-semibold">Coursework: </span>
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
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wide border-b border-black pb-0.5 mb-1.5 text-black">
            Certifications
          </h2>
          <ul className="list-disc list-inside space-y-0.5 text-black">
            {data.certifications.map((cert, idx) => {
              if (typeof cert === 'object' && cert !== null) {
                if (!cert.name) return null;
                return (
                  <li key={idx}>
                    <span className="font-semibold">{cert.name}</span>
                    {cert.organization && <span> — {cert.organization}</span>}
                    {cert.issueDate && <span className="text-[11px] text-gray-700"> ({cert.issueDate})</span>}
                    {cert.credentialUrl && (
                      <span className="text-[11px] underline ml-1">{cert.credentialUrl}</span>
                    )}
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
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wide border-b border-black pb-0.5 mb-1.5 text-black">
            Key Achievements
          </h2>
          <ul className="list-disc list-inside space-y-0.5 text-black">
            {data.achievements.map((ach, idx) => {
              if (typeof ach === 'object' && ach !== null) {
                if (!ach.title) return null;
                return (
                  <li key={idx}>
                    <span className="font-semibold">{ach.title}</span>
                    {ach.organization && <span> ({ach.organization})</span>}
                    {ach.date && <span className="text-gray-700 text-[11px]"> [{ach.date}]</span>}
                    {ach.description && <span className="text-black"> — {ach.description}</span>}
                  </li>
                );
              }
              return <li key={idx}>{ach}</li>;
            })}
          </ul>
        </div>
      )}

      {/* DECLARATION */}
      <div className="mt-5 pt-3 border-t border-black">
        <h2 className="text-xs font-bold uppercase tracking-wide mb-1 text-black">
          Declaration
        </h2>
        <p className="text-black text-xs italic leading-relaxed">
          I hereby declare that all the information mentioned above is true and correct to the best of my knowledge and belief.
        </p>
      </div>
    </div>
  );
};

export default ClassicATSTemplate;
