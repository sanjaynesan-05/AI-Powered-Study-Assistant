import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Download, FileText, Plus, Trash2 } from 'lucide-react';
import { ResumeData } from '../types';
import { useAuth } from '../contexts/AuthContext';
import jsPDF from 'jspdf';

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
    experience: []
  });

  const steps = [
    { number: 1, title: 'Personal Details' },
    { number: 2, title: 'Education & Skills' },
    { number: 3, title: 'Review & Generate' }
  ];

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    let y = 20;

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(resumeData.personalDetails.name, 20, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(resumeData.personalDetails.email, 20, y);
    if (resumeData.personalDetails.phone) {
      doc.text(resumeData.personalDetails.phone, 20, y + 4);
      y += 4;
    }
    y += 12;

    // Education
    if (resumeData.education.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Education', 20, y);
      y += 8;

      resumeData.education.forEach(edu => {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(edu.degree, 20, y);
        doc.setFont('helvetica', 'normal');
        doc.text(`${edu.institution} (${edu.year})`, 20, y + 4);
        y += 12;
      });
    }

    // Skills
    if (resumeData.skills.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Skills', 20, y);
      y += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(resumeData.skills.join(', '), 20, y);
      y += 12;
    }

    // Projects
    if (resumeData.projects.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Projects', 20, y);
      y += 8;

      resumeData.projects.forEach(project => {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(project.title, 20, y);
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(project.description, 170);
        doc.text(lines, 20, y + 4);
        y += 4 + (lines.length * 4) + 8;
      });
    }

    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    updateUser({ resumeUrl: pdfUrl });
    window.open(pdfUrl, '_blank');
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white 
                     hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <h1 className="text-2xl font-bold mb-1 relative z-10">📄 Resume Builder</h1>
        <p className="text-blue-100 relative z-10">Create your professional resume in 3 steps</p>
      </div>
        
      {/* Progress Bar */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 shadow-lg 
                     border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold
                              transition-all duration-500 ${currentStep >= step.number 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                {step.number}
              </div>
              <span className={`ml-3 font-medium ${currentStep >= step.number 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-gray-500 dark:text-gray-500'
              }`}>
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-20 h-1 mx-4 rounded-full transition-all duration-500 ${
                  currentStep > step.number 
                    ? 'bg-blue-500' 
                    : 'bg-gray-200 dark:bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-lg p-6 
                     border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl 
                     transition-all duration-300 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 
                       opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Step 1: Personal Details */}
        {currentStep === 1 && (
          <div className="space-y-6 relative z-10">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              Personal Details
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">
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
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                           focus:ring-2 focus:ring-blue-200 focus:border-blue-500 dark:focus:ring-blue-800
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">
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
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                           focus:ring-2 focus:ring-blue-200 focus:border-blue-500 dark:focus:ring-blue-800
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">
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
                <div key={index} className="grid md:grid-cols-2 gap-4 p-4 border border-gray-200 
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

              <div className="grid md:grid-cols-3 gap-3">
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
                  <div className="grid md:grid-cols-2 gap-3">
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

        {/* Step 3: Review & Generate */}
        {currentStep === 3 && (
          <div className="space-y-6 relative z-10">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
              Review & Generate Resume
            </h2>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
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

            <div className="flex justify-center">
              <button
                onClick={generatePDF}
                className="flex items-center space-x-2 px-6 py-3 bg-green-500 text-white 
                         rounded-lg font-medium hover:bg-green-600 transform hover:scale-105 
                         transition-all duration-300 shadow-lg"
              >
                <FileText className="w-4 h-4" />
                <span>Generate Resume PDF</span>
              </button>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 relative z-10">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 
                     rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300
                     disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 
                     disabled:transform-none font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {currentStep < 3 && (
            <button
              onClick={handleNext}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white 
                       rounded-lg hover:bg-blue-600 transform hover:scale-105 
                       transition-all duration-300 font-medium text-sm"
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