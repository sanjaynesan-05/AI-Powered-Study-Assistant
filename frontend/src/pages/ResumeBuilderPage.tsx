import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, FileText, Plus, Trash2, Download } from 'lucide-react';
import { ResumeData } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { enhancedGenerateResumePDF } from '../utils/enhancedPdfGenerator';

export const ResumeBuilderPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalDetails: {
      name: user?.username || '',
      email: user?.email || '',
      phone: '',
      address: '',
      linkedin: '',
      github: ''
    },
    education: [],
    skills: user?.skills || [],
    projects: [],
    experience: [],
    customization: {
      template: 'professional',
      primaryColor: [59, 130, 246], // Default blue
      fontFamily: 'helvetica',
      lineSpacing: 1.15,
      columnLayout: false
    }
  });

  const steps = [
    { number: 1, title: 'Personal Details' },
    { number: 2, title: 'Education & Skills' },
    { number: 3, title: 'Customization' },
    { number: 4, title: 'Review & Generate' }
  ];

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const generatePDF = () => {
    // Use enhanced PDF generator with the customization options
    const pdfResult = enhancedGenerateResumePDF(resumeData, {
      template: resumeData.customization?.template || 'professional',
      primaryColor: resumeData.customization?.primaryColor || [59, 130, 246],
      fontFamily: resumeData.customization?.fontFamily || 'helvetica',
      lineSpacing: resumeData.customization?.lineSpacing || 1.15,
      columnLayout: resumeData.customization?.columnLayout || false
    });
    
    // Update user with the new PDF URL
    updateUser({ resumeUrl: pdfResult.url });
    
    // Open the PDF in a new tab
    window.open(pdfResult.url, '_blank');
    
    return pdfResult;
  };

  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, { degree: '', institution: '', year: '', grade: '' }]
    }));
  };

  const addProject = () => {
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, { title: '', description: '', technologies: '', link: '' }]
    }));
  };

  const addSkill = () => {
    setResumeData(prev => ({
      ...prev,
      skills: [...prev.skills, '']
    }));
  };

  const removeEducation = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const removeProject = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };

  const removeSkill = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  return (
  <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 px-3 sm:px-4">
      {/* Page Header */}
  <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white 
         hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <h1 className="text-xl sm:text-2xl font-bold mb-1 relative z-10">📄 Resume Builder</h1>
        <p className="text-blue-100 relative z-10 text-sm sm:text-base">Create your professional resume in 3 steps</p>
      </div>
        
      {/* Progress Bar */}
  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg 
         border border-gray-200/50 dark:border-gray-700/50 overflow-x-auto">
    <div className="flex items-center justify-between min-w-[320px] sm:min-w-0">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base
                              transition-all duration-500 ${currentStep >= step.number 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                {step.number}
              </div>
              <span className={`ml-2 sm:ml-3 font-medium text-xs sm:text-sm ${currentStep >= step.number 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-gray-500 dark:text-gray-500'
              }`}>
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-12 sm:w-20 h-1 mx-2 sm:mx-4 rounded-full transition-all duration-500 ${
                  currentStep > step.number 
                    ? 'bg-blue-500' 
                    : 'bg-gray-200 dark:bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 
                     border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl 
                     transition-all duration-300 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 
                       opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Step 1: Personal Details */}
        {currentStep === 1 && (
          <div className="space-y-4 sm:space-y-6 relative z-10">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200 mb-3 sm:mb-4">
              Personal Details
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300 text-sm">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={resumeData.personalDetails.name}
                  onChange={(e) => setResumeData(prev => ({
                    ...prev,
                    personalDetails: { ...prev.personalDetails, name: e.target.value }
                  }))}
                  className="w-full px-3 py-2 sm:px-4 rounded-lg border border-gray-300 dark:border-gray-600 
                           focus:ring-2 focus:ring-blue-200 focus:border-blue-500 dark:focus:ring-blue-800
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300 text-sm">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={resumeData.personalDetails.email}
                  onChange={(e) => setResumeData(prev => ({
                    ...prev,
                    personalDetails: { ...prev.personalDetails, email: e.target.value }
                  }))}
                  className="w-full px-3 py-2 sm:px-4 rounded-lg border border-gray-300 dark:border-gray-600 
                           focus:ring-2 focus:ring-blue-200 focus:border-blue-500 dark:focus:ring-blue-800
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300 text-sm">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={resumeData.personalDetails.phone}
                  onChange={(e) => setResumeData(prev => ({
                    ...prev,
                    personalDetails: { ...prev.personalDetails, phone: e.target.value }
                  }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                           focus:ring-2 focus:ring-blue-200 focus:border-blue-500 dark:focus:ring-blue-800
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Address
                </label>
                <input
                  type="text"
                  value={resumeData.personalDetails.address}
                  onChange={(e) => setResumeData(prev => ({
                    ...prev,
                    personalDetails: { ...prev.personalDetails, address: e.target.value }
                  }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                           focus:ring-2 focus:ring-blue-200 focus:border-blue-500 dark:focus:ring-blue-800
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  value={resumeData.personalDetails.linkedin}
                  onChange={(e) => setResumeData(prev => ({
                    ...prev,
                    personalDetails: { ...prev.personalDetails, linkedin: e.target.value }
                  }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                           focus:ring-2 focus:ring-blue-200 focus:border-blue-500 dark:focus:ring-blue-800
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">
                  GitHub Profile
                </label>
                <input
                  type="url"
                  value={resumeData.personalDetails.github}
                  onChange={(e) => setResumeData(prev => ({
                    ...prev,
                    personalDetails: { ...prev.personalDetails, github: e.target.value }
                  }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                           focus:ring-2 focus:ring-blue-200 focus:border-blue-500 dark:focus:ring-blue-800
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Education & Skills */}
        {currentStep === 2 && (
          <div className="space-y-6 relative z-10">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
              Education & Skills
            </h2>

            {/* Education Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Education</h3>
                <button
                  onClick={addEducation}
                  className="flex items-center space-x-1 px-4 py-2 bg-blue-500 text-white 
                           rounded-lg hover:bg-blue-600 transform hover:scale-105 
                           transition-all duration-300 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>

              {resumeData.education.map((edu, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-200 
                                          dark:border-gray-700 rounded-lg mb-4 relative group
                                          hover:shadow-md transition-all duration-300">
                  <button
                    onClick={() => removeEducation(index)}
                    className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700 
                             opacity-0 group-hover:opacity-100 transition-all duration-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  <input
                    type="text"
                    placeholder="Degree"
                    value={edu.degree}
                    onChange={(e) => {
                      const newEducation = [...resumeData.education];
                      newEducation[index].degree = e.target.value;
                      setResumeData(prev => ({ ...prev, education: newEducation }));
                    }}
                    className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Institution"
                    value={edu.institution}
                    onChange={(e) => {
                      const newEducation = [...resumeData.education];
                      newEducation[index].institution = e.target.value;
                      setResumeData(prev => ({ ...prev, education: newEducation }));
                    }}
                    className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Year"
                    value={edu.year}
                    onChange={(e) => {
                      const newEducation = [...resumeData.education];
                      newEducation[index].year = e.target.value;
                      setResumeData(prev => ({ ...prev, education: newEducation }));
                    }}
                    className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Grade/CGPA"
                    value={edu.grade}
                    onChange={(e) => {
                      const newEducation = [...resumeData.education];
                      newEducation[index].grade = e.target.value;
                      setResumeData(prev => ({ ...prev, education: newEducation }));
                    }}
                    className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>
              ))}
            </div>

            {/* Skills Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Skills</h3>
                <button
                  onClick={addSkill}
                  className="flex items-center space-x-1 px-4 py-2 bg-green-500 text-white 
                           rounded-lg hover:bg-green-600 transform hover:scale-105 
                           transition-all duration-300 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {resumeData.skills.map((skill, index) => (
                  <div key={index} className="relative group">
                    <input
                      type="text"
                      placeholder="Enter skill"
                      value={skill}
                      onChange={(e) => {
                        const newSkills = [...resumeData.skills];
                        newSkills[index] = e.target.value;
                        setResumeData(prev => ({ ...prev, skills: newSkills }));
                      }}
                      className="w-full px-3 py-2 pr-8 rounded-lg border border-gray-300 dark:border-gray-600 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                    <button
                      onClick={() => removeSkill(index)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 
                               text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 
                               transition-all duration-300"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Projects</h3>
                <button
                  onClick={addProject}
                  className="flex items-center space-x-1 px-4 py-2 bg-purple-500 text-white 
                           rounded-lg hover:bg-purple-600 transform hover:scale-105 
                           transition-all duration-300 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>

              {resumeData.projects.map((project, index) => (
                <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 
                                          rounded-lg mb-4 space-y-3 relative group
                                          hover:shadow-md transition-all duration-300">
                  <button
                    onClick={() => removeProject(index)}
                    className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700 
                             opacity-0 group-hover:opacity-100 transition-all duration-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  <input
                    type="text"
                    placeholder="Project Title"
                    value={project.title}
                    onChange={(e) => {
                      const newProjects = [...resumeData.projects];
                      newProjects[index].title = e.target.value;
                      setResumeData(prev => ({ ...prev, projects: newProjects }));
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                  <textarea
                    placeholder="Project Description"
                    value={project.description}
                    onChange={(e) => {
                      const newProjects = [...resumeData.projects];
                      newProjects[index].description = e.target.value;
                      setResumeData(prev => ({ ...prev, projects: newProjects }));
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-20 text-sm"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Technologies Used"
                      value={project.technologies}
                      onChange={(e) => {
                        const newProjects = [...resumeData.projects];
                        newProjects[index].technologies = e.target.value;
                        setResumeData(prev => ({ ...prev, projects: newProjects }));
                      }}
                      className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                    <input
                      type="url"
                      placeholder="Project Link (optional)"
                      value={project.link}
                      onChange={(e) => {
                        const newProjects = [...resumeData.projects];
                        newProjects[index].link = e.target.value;
                        setResumeData(prev => ({ ...prev, projects: newProjects }));
                      }}
                      className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Resume Customization */}
        {currentStep === 3 && (
          <div className="space-y-6 relative z-10">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
              Customize Your Resume
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Template Selection */}
              <div>
                <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Resume Template
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['professional', 'modern', 'minimalist', 'creative'].map((template) => (
                    <div 
                      key={template}
                      onClick={() => setResumeData(prev => ({
                        ...prev,
                        customization: { 
                          ...prev.customization!,
                          template: template as any
                        }
                      }))}
                      className={`
                        cursor-pointer p-3 rounded-lg border-2 transition-all duration-300
                        ${resumeData.customization?.template === template
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                          : 'border-gray-200 dark:border-gray-700'
                        }
                      `}
                    >
                      <div className="h-24 flex items-center justify-center bg-white dark:bg-gray-700 rounded-md mb-2">
                        <span className="text-gray-400 dark:text-gray-500 text-4xl">A</span>
                      </div>
                      <p className="text-center text-sm capitalize">{template}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Colors & Fonts */}
              <div>
                <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Color & Typography
                </label>
                
                {/* Color Selection */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Primary Color</p>
                  <div className="flex space-x-3">
                    {[
                      [59, 130, 246], // Blue
                      [34, 197, 94],  // Green
                      [234, 88, 12],  // Orange
                      [168, 85, 247], // Purple
                      [0, 0, 0]       // Black
                    ].map(([r, g, b], index) => (
                      <div 
                        key={index}
                        onClick={() => setResumeData(prev => ({
                          ...prev,
                          customization: { 
                            ...prev.customization!,
                            primaryColor: [r, g, b]
                          }
                        }))}
                        className={`
                          w-8 h-8 rounded-full cursor-pointer transition-all duration-300
                          ${JSON.stringify(resumeData.customization?.primaryColor) === JSON.stringify([r, g, b])
                            ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-blue-400'
                            : ''
                          }
                        `}
                        style={{ backgroundColor: `rgb(${r}, ${g}, ${b})` }}
                      ></div>
                    ))}
                  </div>
                </div>
                
                {/* Font Selection */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Font Family</p>
                  <select
                    value={resumeData.customization?.fontFamily || 'helvetica'}
                    onChange={(e) => setResumeData(prev => ({
                      ...prev,
                      customization: { 
                        ...prev.customization!,
                        fontFamily: e.target.value
                      }
                    }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="helvetica">Helvetica (Sans-Serif)</option>
                    <option value="times">Times (Serif)</option>
                    <option value="courier">Courier (Monospace)</option>
                  </select>
                </div>

                {/* Line Spacing */}
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Line Spacing
                    <span className="text-xs text-gray-500 ml-2">
                      {resumeData.customization?.lineSpacing || 1.15}x
                    </span>
                  </p>
                  <input
                    type="range"
                    min="1"
                    max="2"
                    step="0.05"
                    value={resumeData.customization?.lineSpacing || 1.15}
                    onChange={(e) => setResumeData(prev => ({
                      ...prev,
                      customization: { 
                        ...prev.customization!,
                        lineSpacing: parseFloat(e.target.value)
                      }
                    }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                </div>
              </div>
              
              {/* Layout Options */}
              <div>
                <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Layout Options
                </label>
                
                <div className="flex items-center mt-3">
                  <input
                    type="checkbox"
                    id="columnLayout"
                    checked={resumeData.customization?.columnLayout || false}
                    onChange={(e) => setResumeData(prev => ({
                      ...prev,
                      customization: { 
                        ...prev.customization!,
                        columnLayout: e.target.checked
                      }
                    }))}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded 
                             focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 
                             dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor="columnLayout" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Use two-column layout (better for skills & education)
                  </label>
                </div>
              </div>
              
              {/* ATS Optimization Tips */}
              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">ATS Optimization</h3>
                <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-2 list-disc pl-5">
                  <li>Your resume is being optimized for Applicant Tracking Systems</li>
                  <li>Key skills are highlighted for better keyword matching</li>
                  <li>Clean formatting ensures your content is properly parsed</li>
                  <li>PDF includes hidden metadata for better indexing</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review & Generate */}
        {currentStep === 4 && (
          <div className="space-y-6 relative z-10">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
              Review & Generate Resume
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg h-full">
                <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200">
                  Resume Preview
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-gray-200">
                      {resumeData.personalDetails.name}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      {resumeData.personalDetails.email} | {resumeData.personalDetails.phone}
                    </p>
                  </div>

                  {resumeData.education.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Education</h4>
                      {resumeData.education.map((edu, index) => (
                        <div key={index} className="mb-1">
                          <p className="font-medium text-sm">{edu.degree}</p>
                          <p className="text-gray-600 dark:text-gray-400 text-xs">
                            {edu.institution} ({edu.year})
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {resumeData.skills.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Skills</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-xs">
                        {resumeData.skills.filter(skill => skill.trim()).join(', ')}
                      </p>
                    </div>
                  )}

                  {resumeData.projects.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Projects</h4>
                      {resumeData.projects.map((project, index) => (
                        <div key={index} className="mb-2">
                          <p className="font-medium text-sm">{project.title}</p>
                          <p className="text-gray-600 dark:text-gray-400 text-xs">
                            {project.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg h-full">
                <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200">
                  Selected Template: <span className="capitalize">{resumeData.customization?.template || 'Professional'}</span>
                </h3>
                
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800 h-64 relative overflow-hidden">
                  {/* Template Preview */}
                  <div className={`
                    w-full h-full flex flex-col
                    ${resumeData.customization?.template === 'modern' ? 'items-center' : ''}
                  `}>
                    {/* Header */}
                    <div className="w-full mb-2">
                      <div 
                        className="h-6 mb-1" 
                        style={{
                          backgroundColor: `rgba(${resumeData.customization?.primaryColor?.[0] || 59}, ${resumeData.customization?.primaryColor?.[1] || 130}, ${resumeData.customization?.primaryColor?.[2] || 246}, 0.1)`
                        }}
                      ></div>
                      <div className="w-1/2 h-2 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    </div>
                    
                    {/* Content Layout */}
                    <div className={`flex w-full flex-1 ${resumeData.customization?.columnLayout ? 'space-x-2' : 'flex-col space-y-2'}`}>
                      {/* Left column / Section 1 */}
                      <div className={`${resumeData.customization?.columnLayout ? 'w-1/3' : 'w-full'} flex flex-col space-y-1`}>
                        <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2 mb-1"></div>
                        {[1, 2, 3].map(i => (
                          <div key={i} className="h-2 bg-gray-100 dark:bg-gray-700 rounded w-full"></div>
                        ))}
                      </div>
                      
                      {/* Right column / Section 2 */}
                      <div className={`${resumeData.customization?.columnLayout ? 'w-2/3' : 'w-full'} flex flex-col space-y-1`}>
                        <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2 mb-1"></div>
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} className="h-2 bg-gray-100 dark:bg-gray-700 rounded w-full"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Badge for ATS Optimization */}
                  <div className="absolute top-2 right-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs py-1 px-2 rounded">
                    ATS Optimized
                  </div>
                </div>
                
                <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                  <p className="mb-1">Customization summary:</p>
                  <ul className="list-disc pl-5 text-xs">
                    <li>Font: {resumeData.customization?.fontFamily || 'Helvetica'}</li>
                    <li>Line spacing: {resumeData.customization?.lineSpacing || 1.15}x</li>
                    <li>Layout: {resumeData.customization?.columnLayout ? 'Two-column' : 'Single-column'}</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
              <button
                onClick={generatePDF}
                className="flex items-center space-x-2 px-4 py-3 sm:px-6 bg-green-500 text-white 
                         rounded-lg font-medium hover:bg-green-600 transform hover:scale-105 
                         transition-all duration-300 shadow-lg w-full sm:w-auto"
              >
                <FileText className="w-4 h-4" />
                <span>Generate Resume PDF</span>
              </button>
              <button
                onClick={() => {
                  const pdfResult = generatePDF();
                  // Trigger the download
                  pdfResult.download();
                }}
                className="flex items-center space-x-2 px-4 py-3 sm:px-6 bg-blue-500 text-white 
                         rounded-lg font-medium hover:bg-blue-600 transform hover:scale-105 
                         transition-all duration-300 shadow-lg w-full sm:w-auto"
              >
                <Download className="w-4 h-4" />
                <span>Download Resume</span>
              </button>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-between mt-8 gap-3 sm:gap-0 relative z-10">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 
                     rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300
                     disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 
                     disabled:transform-none font-medium text-sm w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {currentStep < 4 && (
            <button
              onClick={handleNext}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white 
                       rounded-lg hover:bg-blue-600 transform hover:scale-105 
                       transition-all duration-300 font-medium text-sm w-full sm:w-auto"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};