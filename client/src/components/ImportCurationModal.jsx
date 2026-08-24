import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, Trash2, ShieldCheck, FileText, Check, X, Layers } from 'lucide-react';
import toast from 'react-hot-toast';

const ImportCurationModal = ({
  isOpen,
  onClose,
  previousData,
  importedData,
  jobRole = 'Java Developer',
  onApplyCuration
}) => {
  if (!isOpen || !importedData) return null;

  const prev = previousData || {};
  const imp = importedData.improvedResume || importedData || {};

  // Curation State
  const [selectedSummarySource, setSelectedSummarySource] = useState('imported'); // 'imported', 'previous', 'combined'
  const [skillsList, setSkillsList] = useState([]);
  const [experienceList, setExperienceList] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [educationList, setEducationList] = useState([]);

  // Initialize curation items with AI keep/delete tags when modal opens
  useEffect(() => {
    // 1. Merge & Tag Skills
    const prevSkills = (prev.skills || []).map(s => typeof s === 'string' ? { name: s } : s);
    const impSkills = (imp.skills || []).map(s => typeof s === 'string' ? { name: s } : s);

    const mergedSkillsMap = new Map();
    
    prevSkills.forEach((s) => {
      if (!s || !s.name) return;
      const key = s.name.toLowerCase().trim();
      mergedSkillsMap.set(key, {
        ...s,
        source: 'purana',
        keep: true,
        aiSuggest: 'keep',
        aiReason: 'Purana skill'
      });
    });

    impSkills.forEach((s) => {
      if (!s || !s.name) return;
      const key = s.name.toLowerCase().trim();
      if (mergedSkillsMap.has(key)) {
        // Duplicate skill
        mergedSkillsMap.set(`${key}_imp`, {
          ...s,
          source: 'naya',
          keep: false,
          aiSuggest: 'delete',
          aiReason: 'Duplicate skill entry'
        });
      } else {
        mergedSkillsMap.set(key, {
          ...s,
          source: 'naya',
          keep: true,
          aiSuggest: 'keep',
          aiReason: `Newly imported skill for ${jobRole}`
        });
      }
    });

    setSkillsList(Array.from(mergedSkillsMap.values()));

    // 2. Merge & Tag Experiences
    const prevExp = (prev.experience || []).map((item, idx) => ({
      ...item,
      id: `prev_exp_${idx}`,
      source: 'purana',
      keep: true,
      aiSuggest: 'keep',
      aiReason: 'Purana Work Experience'
    }));

    const impExp = (imp.experience || []).map((item, idx) => {
      const isDuplicate = prevExp.some(pe => 
        pe.company?.toLowerCase() === item.company?.toLowerCase() && 
        pe.role?.toLowerCase() === item.role?.toLowerCase()
      );
      return {
        ...item,
        id: `imp_exp_${idx}`,
        source: 'naya',
        keep: !isDuplicate,
        aiSuggest: isDuplicate ? 'delete' : 'keep',
        aiReason: isDuplicate ? 'Duplicate company & role' : `Newly imported experience`
      };
    });

    setExperienceList([...prevExp, ...impExp]);

    // 3. Merge & Tag Projects
    const prevProj = (prev.projects || []).map((item, idx) => ({
      ...item,
      id: `prev_proj_${idx}`,
      source: 'purana',
      keep: true,
      aiSuggest: 'keep',
      aiReason: 'Purana Project'
    }));

    const impProj = (imp.projects || []).map((item, idx) => {
      const isDuplicate = prevProj.some(pp => pp.title?.toLowerCase() === item.title?.toLowerCase());
      return {
        ...item,
        id: `imp_proj_${idx}`,
        source: 'naya',
        keep: !isDuplicate,
        aiSuggest: isDuplicate ? 'delete' : 'keep',
        aiReason: isDuplicate ? 'Duplicate project title' : `Newly imported project`
      };
    });

    setProjectsList([...prevProj, ...impProj]);

    // 4. Merge & Tag Education
    const prevEdu = (prev.education || []).map((item, idx) => ({
      ...item,
      id: `prev_edu_${idx}`,
      source: 'purana',
      keep: true,
      aiSuggest: 'keep'
    }));

    const impEdu = (imp.education || []).map((item, idx) => {
      const isDuplicate = prevEdu.some(pe => pe.institution?.toLowerCase() === item.institution?.toLowerCase());
      return {
        ...item,
        id: `imp_edu_${idx}`,
        source: 'naya',
        keep: !isDuplicate,
        aiSuggest: isDuplicate ? 'delete' : 'keep'
      };
    });

    setEducationList([...prevEdu, ...impEdu]);

  }, [previousData, importedData, jobRole]);

  // Handlers for Toggling Individual Item Keep / Delete
  const toggleSkillKeep = (index) => {
    setSkillsList(prev => prev.map((s, i) => i === index ? { ...s, keep: !s.keep } : s));
  };

  const toggleExpKeep = (id) => {
    setExperienceList(prev => prev.map(e => e.id === id ? { ...e, keep: !e.keep } : e));
  };

  const toggleProjKeep = (id) => {
    setProjectsList(prev => prev.map(p => p.id === id ? { ...p, keep: !p.keep } : p));
  };

  // Quick Preset Actions
  const handleApplyAISuggestions = () => {
    setSkillsList(prev => prev.map(s => ({ ...s, keep: s.aiSuggest === 'keep' })));
    setExperienceList(prev => prev.map(e => ({ ...e, keep: e.aiSuggest === 'keep' })));
    setProjectsList(prev => prev.map(p => ({ ...p, keep: p.aiSuggest === 'keep' })));
    setEducationList(prev => prev.map(ed => ({ ...ed, keep: ed.aiSuggest === 'keep' })));
    toast.success('AI Keep & Delete suggestions applied!');
  };

  const handleKeepEverything = () => {
    setSkillsList(prev => prev.map(s => ({ ...s, keep: true })));
    setExperienceList(prev => prev.map(e => ({ ...e, keep: true })));
    setProjectsList(prev => prev.map(p => ({ ...p, keep: true })));
    setEducationList(prev => prev.map(ed => ({ ...ed, keep: true })));
    toast.success('Keeping all purana + naya content!');
  };

  const handleKeepOnlyNew = () => {
    setSkillsList(prev => prev.map(s => ({ ...s, keep: s.source === 'naya' })));
    setExperienceList(prev => prev.map(e => ({ ...e, keep: e.source === 'naya' })));
    setProjectsList(prev => prev.map(p => ({ ...p, keep: p.source === 'naya' })));
    setEducationList(prev => prev.map(ed => ({ ...ed, keep: ed.source === 'naya' })));
    setSelectedSummarySource('imported');
    toast.success('Selected imported resume content only.');
  };

  // Confirm Final Curation & Build Merged Object
  const handleFinalSubmit = () => {
    // Summary
    let finalSummary = imp.summary || prev.summary || '';
    if (selectedSummarySource === 'previous') {
      finalSummary = prev.summary || imp.summary || '';
    } else if (selectedSummarySource === 'combined') {
      finalSummary = `${imp.summary || ''}\n\n${prev.summary || ''}`.trim();
    }

    // Filtered Keep lists
    const finalSkills = skillsList.filter(s => s.keep).map(s => ({ name: s.name, rating: s.rating || 4 }));
    const finalExperience = experienceList.filter(e => e.keep).map(({ id, source, keep, aiSuggest, aiReason, ...rest }) => rest);
    const finalProjects = projectsList.filter(p => p.keep).map(({ id, source, keep, aiSuggest, aiReason, ...rest }) => rest);
    const finalEducation = educationList.filter(ed => ed.keep).map(({ id, source, keep, aiSuggest, ...rest }) => rest);

    const finalContact = {
      ...(prev.contactInfo || {}),
      ...(imp.contactInfo || {}),
      profilePhoto: imp.contactInfo?.profilePhoto || prev.contactInfo?.profilePhoto || '',
      photoEnabled: imp.contactInfo?.photoEnabled ?? prev.contactInfo?.photoEnabled ?? false,
      photoSize: imp.contactInfo?.photoSize || prev.contactInfo?.photoSize || 76
    };

    const finalMergedResume = {
      ...prev,
      ...imp,
      contactInfo: finalContact,
      summary: finalSummary,
      skills: finalSkills.length > 0 ? finalSkills : (imp.skills || prev.skills || []),
      experience: finalExperience.length > 0 ? finalExperience : (imp.experience || prev.experience || []),
      projects: finalProjects.length > 0 ? finalProjects : (imp.projects || prev.projects || []),
      education: finalEducation.length > 0 ? finalEducation : (imp.education || prev.education || [])
    };

    onApplyCuration(finalMergedResume);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-6 space-y-6 shadow-2xl animate-fadeIn max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-bold shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white tracking-tight">AI Resume Content Curator</h2>
                <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Purana + Naya Merge
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                AI has compared your previous resume with newly imported content for <strong className="text-orange-400">{jobRole}</strong>.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action Presets Bar */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-2 flex-shrink-0 text-xs">
          <div className="flex items-center space-x-2 text-slate-300 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Quick Presets:</span>
          </div>

          <div className="flex items-center space-x-2 flex-wrap gap-1">
            <button
              type="button"
              onClick={handleApplyAISuggestions}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1 shadow transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Apply AI Recommendations (Best ATS)</span>
            </button>

            <button
              type="button"
              onClick={handleKeepEverything}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center space-x-1 transition"
            >
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Keep Everything (Purana + Naya)</span>
            </button>

            <button
              type="button"
              onClick={handleKeepOnlyNew}
              className="bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-lg flex items-center space-x-1 transition"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>New Resume Only</span>
            </button>
          </div>
        </div>

        {/* Scrollable Curation List Body */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">

          {/* 1. PROFESSIONAL SUMMARY CURATION */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-orange-400" />
                <span>1. Professional Summary Curation</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* Purana Summary */}
              <div 
                onClick={() => setSelectedSummarySource('previous')}
                className={`p-3 rounded-xl border cursor-pointer transition ${
                  selectedSummarySource === 'previous'
                    ? 'bg-slate-900 border-orange-500 shadow-md'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-800 px-2 py-0.5 rounded">Purana Summary</span>
                  {selectedSummarySource === 'previous' && <CheckCircle2 className="w-4 h-4 text-orange-400" />}
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">{prev.summary || 'No previous summary'}</p>
              </div>

              {/* Naya Summary */}
              <div 
                onClick={() => setSelectedSummarySource('imported')}
                className={`p-3 rounded-xl border cursor-pointer transition ${
                  selectedSummarySource === 'imported'
                    ? 'bg-slate-900 border-orange-500 shadow-md'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">Newly Imported (Recommended)</span>
                  {selectedSummarySource === 'imported' && <CheckCircle2 className="w-4 h-4 text-orange-400" />}
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">{imp.summary || 'No imported summary'}</p>
              </div>
            </div>
          </div>

          {/* 2. WORK EXPERIENCE CURATION */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-orange-400" />
                <span>2. Work Experience Entries ({experienceList.length})</span>
              </h3>
              <span className="text-[11px] text-slate-400">
                Keeping <strong className="text-orange-400">{experienceList.filter(e => e.keep).length}</strong> / {experienceList.length}
              </span>
            </div>

            <div className="space-y-2">
              {experienceList.map((exp) => (
                <div 
                  key={exp.id}
                  className={`p-3 rounded-xl border flex items-start justify-between gap-3 transition ${
                    exp.keep ? 'bg-slate-900/90 border-slate-700' : 'bg-slate-950/50 border-slate-800/80 opacity-50'
                  }`}
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                        exp.source === 'purana' 
                          ? 'bg-slate-800 text-slate-300' 
                          : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                      }`}>
                        {exp.source === 'purana' ? 'Purana' : 'Naya PDF'}
                      </span>
                      <h4 className="text-xs font-bold text-white">{exp.role} at {exp.company}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">({exp.duration || exp.startDate})</span>
                    </div>

                    {/* AI Suggestion Badge */}
                    <div className="flex items-center space-x-2 mt-1">
                      {exp.aiSuggest === 'keep' ? (
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 font-bold px-2 py-0.5 rounded-md flex items-center space-x-1">
                          <Check className="w-3 h-3" />
                          <span>AI Suggestion: Rakhna Hai (Keep)</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 font-bold px-2 py-0.5 rounded-md flex items-center space-x-1">
                          <Trash2 className="w-3 h-3" />
                          <span>AI Suggestion: Delete Karna Hai ({exp.aiReason})</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Toggle Button */}
                  <button
                    type="button"
                    onClick={() => toggleExpKeep(exp.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                      exp.keep
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                    }`}
                  >
                    {exp.keep ? <Check className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                    <span>{exp.keep ? 'Rakhna Hai' : 'Delete'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 3. PROJECTS CURATION */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-orange-400" />
                <span>3. Projects Entries ({projectsList.length})</span>
              </h3>
              <span className="text-[11px] text-slate-400">
                Keeping <strong className="text-orange-400">{projectsList.filter(p => p.keep).length}</strong> / {projectsList.length}
              </span>
            </div>

            <div className="space-y-2">
              {projectsList.map((proj) => (
                <div 
                  key={proj.id}
                  className={`p-3 rounded-xl border flex items-start justify-between gap-3 transition ${
                    proj.keep ? 'bg-slate-900/90 border-slate-700' : 'bg-slate-950/50 border-slate-800/80 opacity-50'
                  }`}
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                        proj.source === 'purana' 
                          ? 'bg-slate-800 text-slate-300' 
                          : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                      }`}>
                        {proj.source === 'purana' ? 'Purana' : 'Naya PDF'}
                      </span>
                      <h4 className="text-xs font-bold text-white">{proj.title}</h4>
                    </div>

                    <div className="flex items-center space-x-2 mt-1">
                      {proj.aiSuggest === 'keep' ? (
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 font-bold px-2 py-0.5 rounded-md flex items-center space-x-1">
                          <Check className="w-3 h-3" />
                          <span>AI Suggestion: Rakhna Hai (Keep)</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 font-bold px-2 py-0.5 rounded-md flex items-center space-x-1">
                          <Trash2 className="w-3 h-3" />
                          <span>AI Suggestion: Delete ({proj.aiReason})</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleProjKeep(proj.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                      proj.keep
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                    }`}
                  >
                    {proj.keep ? <Check className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                    <span>{proj.keep ? 'Rakhna Hai' : 'Delete'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 4. SKILLS CURATION */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>4. Skills List Curation ({skillsList.length})</span>
              </h3>
            </div>

            <div className="flex flex-wrap gap-2">
              {skillsList.map((skill, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleSkillKeep(idx)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 border transition ${
                    skill.keep
                      ? skill.aiSuggest === 'keep'
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-800 border-slate-700 text-slate-200'
                      : 'bg-slate-950 border-slate-800 text-slate-600 line-through'
                  }`}
                  title={`${skill.source === 'purana' ? 'Purana' : 'Naya'} - AI Suggestion: ${skill.aiSuggest === 'keep' ? 'Keep' : 'Delete (' + skill.aiReason + ')'}`}
                >
                  <span className={`w-2 h-2 rounded-full ${skill.source === 'purana' ? 'bg-slate-400' : 'bg-orange-400'}`} />
                  <span>{skill.name}</span>
                  {skill.keep ? (
                    <Check className="w-3 h-3 text-emerald-400 ml-1" />
                  ) : (
                    <X className="w-3 h-3 text-red-400 ml-1" />
                  )}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="text-xs text-slate-400">
            Click any entry above to toggle <strong className="text-emerald-400">Rakhna Hai</strong> vs <strong className="text-red-400">Delete</strong>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
            >
              Cancel
            </button>
            
            <button
              type="button"
              onClick={handleFinalSubmit}
              className="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Apply Merged Resume</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ImportCurationModal;
