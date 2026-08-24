import React from 'react';

const RecommendedATSTemplate = ({ data = {} }) => {
  const contact = data.contactInfo || {};
  const fullName = contact.fullName || 'Alok Kumar';
  const email = contact.email || '';
  const phone = contact.phone || '';
  const linkedin = contact.linkedin || '';
  const github = contact.github || '';
  const portfolio = contact.portfolio || '';
  const address = contact.address || '';

  const customLinks = Array.isArray(contact.customLinks) ? contact.customLinks.filter(l => l.heading && l.url) : [];
  const dedicatedLinks = Array.isArray(data.links) ? data.links.filter(l => l.heading && l.url) : [];
  const allCustomLinks = [...customLinks, ...dedicatedLinks];

  // Address and Contact String
  const contactDetails = [address, phone, email].filter(Boolean).join(', ');

  // Photo settings
  const hasPhoto = Boolean(contact.photoEnabled && contact.profilePhoto);
  const photoSize = contact.photoSize || 76;
  const photoHeight = Math.round(photoSize * 1.333);

  // Technical Skills (Left Column)
  const rawSkills = Array.isArray(data.skills) 
    ? data.skills.map(s => typeof s === 'object' && s !== null ? s.name : s).filter(Boolean) 
    : [];
  const rawTech = Array.isArray(data.technicalSkills) ? data.technicalSkills.filter(Boolean) : [];
  const techSkills = Array.from(new Set([...rawTech, ...rawSkills]));

  // Professional / Soft Skills (Right Column)
  const softSkills = Array.isArray(data.softSkills) ? data.softSkills.filter(Boolean) : [];

  // Co-curricular activities & Certifications
  const certifications = Array.isArray(data.certifications) ? data.certifications : [];
  const extraActivities = Array.isArray(data.activities) ? data.activities : [];
  const coCurricularList = [...certifications, ...extraActivities];

  // Achievements
  const achievementsList = Array.isArray(data.achievements) ? data.achievements : [];

  return (
    <div className="bg-white text-slate-900 p-10 font-serif text-[12px] leading-relaxed max-w-[800px] mx-auto shadow-xl rounded-sm print:p-0 print:shadow-none min-h-[1050px] font-['Times_New_Roman',_Georgia,_serif]">
      {/* 1. PERSONAL INFO HEADER */}
      <div className="relative mb-5">
        {/* Profile Photo (If Enabled) */}
        {hasPhoto && (
          <div 
            style={{ width: `${photoSize}px`, height: `${photoHeight}px` }}
            className="absolute top-0 right-0 flex-shrink-0 overflow-hidden rounded-xl border-2 border-[#0f4c81] p-0.5 bg-white shadow-sm transition-all duration-150 z-10"
          >
            <img
              src={contact.profilePhoto}
              alt={fullName}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        )}

        {/* Personal Details Centered */}
        <div 
          style={{
            paddingRight: hasPhoto ? `${photoSize + 16}px` : undefined
          }}
          className="text-center space-y-1 transition-all duration-150"
        >
          {/* Candidate Name */}
          <h1 className="text-2xl font-bold tracking-wide text-[#0f4c81] mb-1">
            {fullName}
          </h1>

          {/* Location & Contact Info */}
          {contactDetails && (
            <div className="text-[12px] text-slate-800 font-medium">
              {contactDetails}
            </div>
          )}

          {/* LinkedIn Link */}
          {linkedin && (
            <div className="text-[11.5px] text-[#a16207] font-medium">
              <span>LinkedIn: </span>
              <a 
                href={linkedin.startsWith('http') ? linkedin : `https://${linkedin}`} 
                target="_blank" 
                rel="noreferrer"
                className="underline text-[#a16207] hover:opacity-80"
              >
                {linkedin.startsWith('http') ? linkedin : `https://${linkedin}`}
              </a>
            </div>
          )}

          {/* GitHub Link */}
          {github && (
            <div className="text-[11.5px] text-[#a16207] font-medium">
              <span>GitHub: </span>
              <a 
                href={github.startsWith('http') ? github : `https://${github}`} 
                target="_blank" 
                rel="noreferrer"
                className="underline text-[#a16207] hover:opacity-80"
              >
                {github.startsWith('http') ? github : `http://${github}`}
              </a>
            </div>
          )}

          {/* Portfolio Link */}
          {portfolio && (
            <div className="text-[11.5px] text-[#a16207] font-medium">
              <span>Portfolio: </span>
              <a 
                href={portfolio.startsWith('http') ? portfolio : `https://${portfolio}`} 
                target="_blank" 
                rel="noreferrer"
                className="underline text-[#a16207] hover:opacity-80"
              >
                {portfolio}
              </a>
            </div>
          )}

          {/* Custom Links */}
          {allCustomLinks.map((link, idx) => (
            <div key={idx} className="text-[11.5px] text-[#a16207] font-medium">
              <span>{link.heading ? `${link.heading}: ` : ''}</span>
              <a 
                href={link.url.startsWith('http') ? link.url : `https://${link.url}`} 
                target="_blank" 
                rel="noreferrer"
                className="underline text-[#a16207] hover:opacity-80"
              >
                {link.url}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* SUMMARY (If present) */}
      {data.summary && data.summary.trim().length > 0 && (
        <div className="mb-5">
          <h2 className="text-[13px] font-bold uppercase tracking-wider text-[#0f4c81] border-b border-[#0f4c81] pb-0.5 mb-2">
            SUMMARY
          </h2>
          <p className="text-slate-900 text-[12px] leading-relaxed">
            {data.summary}
          </p>
        </div>
      )}

      {/* 2. EDUCATION */}
      {Array.isArray(data.education) && data.education.length > 0 && (
        <div className="mb-5">
          <h2 className="text-[13px] font-bold uppercase tracking-wider text-[#0f4c81] border-b border-[#0f4c81] pb-0.5 mb-2">
            EDUCATION
          </h2>
          <div className="space-y-2">
            {data.education.map((edu, idx) => {
              if (!edu.institution && !edu.degree) return null;
              const years = edu.startYear && edu.endYear ? `${edu.startYear} - ${edu.endYear}` : (edu.endYear || edu.startYear || edu.duration);
              return (
                <div key={idx} className="text-slate-900">
                  <div className="flex justify-between items-baseline">
                    <div className="text-[12px]">
                      <span className="font-bold">{edu.degree}</span>
                      {edu.branch && <span className="font-bold"> in {edu.branch}</span>}
                      {edu.institution && <span className="italic">, {edu.institution}</span>}
                      {edu.location && <span>, {edu.location}</span>}
                      {edu.gpa && <span className="font-bold">, {edu.gpa}</span>}
                    </div>
                    {years && <span className="font-normal text-[12px] text-slate-800 flex-shrink-0 ml-4">{years}</span>}
                  </div>
                  {Array.isArray(edu.relevantCoursework) && edu.relevantCoursework.length > 0 && (
                    <div className="text-[11.5px] text-slate-800 mt-0.5 pl-2">
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

      {/* 3. INTERNSHIP / TRAINING EXPERIENCE */}
      {Array.isArray(data.experience) && data.experience.length > 0 && (
        <div className="mb-5">
          <h2 className="text-[13px] font-bold uppercase tracking-wider text-[#0f4c81] border-b border-[#0f4c81] pb-0.5 mb-2">
            INTERNSHIP/ TRAINING EXPERIENCE
          </h2>
          <div className="space-y-3">
            {data.experience.map((exp, idx) => {
              if (!exp.role && !exp.company) return null;
              const dateRange = exp.startDate && exp.endDate ? `${exp.startDate} – ${exp.currentWorking ? 'Present' : exp.endDate}` : exp.duration;
              return (
                <div key={idx} className="text-slate-900">
                  <div className="flex justify-between items-baseline font-bold text-[12px]">
                    <span>
                      {exp.role || 'Internship'} {exp.company && `At ${exp.company}`} {exp.location && `, ${exp.location}`}
                    </span>
                    {dateRange && <span className="font-normal text-[12px] text-slate-800 flex-shrink-0 ml-4">{dateRange}</span>}
                  </div>

                  {exp.achievements && (
                    <div className="italic text-slate-800 text-[11.5px] mt-0.5">
                      {exp.achievements}
                    </div>
                  )}

                  {Array.isArray(exp.description) && exp.description.length > 0 && (
                    <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-900 text-[12px]">
                      {exp.description.map((bullet, bIdx) => (
                        <li key={bIdx} className="leading-snug">
                          {bullet}
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

      {/* 4. PROJECTS */}
      {Array.isArray(data.projects) && data.projects.length > 0 && (
        <div className="mb-5">
          <h2 className="text-[13px] font-bold uppercase tracking-wider text-[#0f4c81] border-b border-[#0f4c81] pb-0.5 mb-2">
            PROJECTS
          </h2>
          <div className="space-y-3">
            {data.projects.map((proj, idx) => {
              if (!proj.title) return null;
              const linkDisplay = proj.github || proj.link || proj.liveDemo;
              const dateRange = proj.startDate && proj.endDate ? `${proj.startDate} – ${proj.endDate}` : proj.duration;
              return (
                <div key={idx} className="text-slate-900">
                  <div className="flex justify-between items-baseline text-[12px]">
                    <div className="flex items-baseline space-x-2 flex-wrap">
                      <span className="font-bold">{proj.title}</span>
                      {linkDisplay && (
                        <span className="font-bold">
                          GitHub{' '}
                          <a
                            href={linkDisplay.startsWith('http') ? linkDisplay : `https://${linkDisplay}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#a16207] underline font-normal"
                          >
                            {linkDisplay.startsWith('http') ? linkDisplay : `https://${linkDisplay}`}
                          </a>
                        </span>
                      )}
                    </div>
                    {dateRange && <span className="font-normal text-[12px] text-slate-800 flex-shrink-0 ml-4">{dateRange}</span>}
                  </div>

                  {Array.isArray(proj.description) && proj.description.length > 0 && (
                    <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-900 text-[12px]">
                      {proj.description.map((bullet, bIdx) => (
                        <li key={bIdx} className="leading-snug">
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  )}

                  {Array.isArray(proj.techStack) && proj.techStack.length > 0 && (!proj.description || proj.description.length === 0) && (
                    <div className="text-[12px] text-slate-800 mt-1 pl-2">
                      {proj.techStack.join(', ')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. SKILLS (Two Columns Layout) */}
      {(techSkills.length > 0 || softSkills.length > 0) && (
        <div className="mb-5">
          <h2 className="text-[13px] font-bold uppercase tracking-wider text-[#0f4c81] border-b border-[#0f4c81] pb-0.5 mb-2">
            SKILLS
          </h2>
          <div className="grid grid-cols-2 gap-x-12 text-[12px] text-slate-900">
            {/* Left Column: Technical (max Top 5) */}
            <div>
              <div className="font-bold mb-1">Technical (max Top 5)</div>
              {techSkills.length > 0 ? (
                <div className="space-y-0.5">
                  {techSkills.slice(0, 5).map((skill, idx) => (
                    <div key={idx}>{skill}</div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-500 italic">None specified</div>
              )}
            </div>

            {/* Right Column: Professional (Top 3) */}
            <div>
              <div className="font-bold mb-1">Professional (Top 3)</div>
              {softSkills.length > 0 ? (
                <div className="space-y-0.5">
                  {softSkills.slice(0, 3).map((skill, idx) => (
                    <div key={idx}>{skill}</div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-500 italic">None specified</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. PROFESSIONAL ACHIEVEMENTS / INSIGHTS */}
      {achievementsList.length > 0 && (
        <div className="mb-5">
          <h2 className="text-[13px] font-bold uppercase tracking-wider text-[#0f4c81] border-b border-[#0f4c81] pb-0.5 mb-2">
            PROFESSIONAL ACHIEVEMENTS/ INSIGHTS
          </h2>
          <ul className="list-disc pl-5 space-y-1 text-slate-900 text-[12px]">
            {achievementsList.map((ach, idx) => {
              if (typeof ach === 'object' && ach !== null) {
                if (!ach.title) return null;
                return (
                  <li key={idx} className="leading-snug">
                    <span className="font-bold">{ach.title}</span>
                    {ach.organization && <span> ({ach.organization})</span>}
                    {ach.date && <span className="text-slate-700"> [{ach.date}]</span>}
                    {ach.description && <span> — {ach.description}</span>}
                  </li>
                );
              }
              return (
                <li key={idx} className="leading-snug">
                  {ach}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* 7. CO-CURRICULAR ACTIVITIES */}
      {coCurricularList.length > 0 && (
        <div className="mb-5">
          <h2 className="text-[13px] font-bold uppercase tracking-wider text-[#0f4c81] border-b border-[#0f4c81] pb-0.5 mb-2">
            CO-CURRICULAR ACTIVITIES
          </h2>
          <ul className="list-disc pl-5 space-y-1 text-slate-900 text-[12px]">
            {coCurricularList.map((item, idx) => {
              if (typeof item === 'object' && item !== null) {
                if (!item.name && !item.title) return null;
                return (
                  <li key={idx} className="leading-snug">
                    <span className="font-bold">{item.name || item.title}</span>
                    {item.organization && <span> — {item.organization}</span>}
                    {item.issueDate && <span className="text-slate-700"> ({item.issueDate})</span>}
                    {item.credentialUrl && (
                      <span className="text-[#a16207] underline text-[11.5px] ml-1">{item.credentialUrl}</span>
                    )}
                  </li>
                );
              }
              return (
                <li key={idx} className="leading-snug">
                  {item}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* 8. DECLARATION */}
      <div className="mt-5">
        <h2 className="text-[13px] font-bold uppercase tracking-wider text-[#0f4c81] border-b border-[#0f4c81] pb-0.5 mb-2">
          DECLARATION
        </h2>
        <p className="text-slate-900 text-[12px] leading-relaxed">
          {data.declaration || 'I hereby declare that all the above mentioned information is true and correct to the best of my knowledge.'}
        </p>
      </div>
    </div>
  );
};

export default RecommendedATSTemplate;


