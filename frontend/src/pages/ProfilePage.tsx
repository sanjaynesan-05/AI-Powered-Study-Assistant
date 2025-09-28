import React, { useState } from 'react';
import { Camera, Edit, FileText, Upload, MapPin, Mail, Phone, Globe, Github, Linkedin, Star, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [skillsEditing, setSkillsEditing] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    dateOfBirth: user?.dateOfBirth || '',
    education: user?.education || 'student',
    phone: '',
    address: '',
    linkedin: '',
    github: '',
    bio: '',
    headline: 'Student passionate about learning and technology',
    company: '',
    position: ''
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        updateUser({ profilePhoto: imageUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = () => {
    updateUser(formData);
    setEditing(false);
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && user) {
      const updatedSkills = [...(user.skills || []), newSkill.trim()];
      updateUser({ skills: updatedSkills });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    if (user) {
      const updatedSkills = user.skills.filter(skill => skill !== skillToRemove);
      updateUser({ skills: updatedSkills });
    }
  };

  const handleCreateResume = () => {
    navigate('/resume-builder');
  };

  const handleResumeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const pdfUrl = e.target?.result as string;
        updateUser({ resumeUrl: pdfUrl });
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select a PDF file.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-6">
        {/* LinkedIn-style Header Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg overflow-hidden">
          {/* Cover Photo Area */}
          <div className="h-32 sm:h-48 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <button className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Profile Content */}
          <div className="relative px-4 sm:px-6 pb-6">
            {/* Profile Photo */}
            <div className="relative -mt-16 sm:-mt-20 mb-4">
              <div className="relative inline-block">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg">
                  <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    {user?.profilePhoto ? (
                      <img 
                        src={user.profilePhoto} 
                        alt="Profile" 
                        className="w-full h-full rounded-full object-cover" 
                      />
                    ) : (
                      <span className="text-white text-2xl sm:text-3xl font-bold">
                        {user?.username?.[0]?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                </div>
                
                <label className="absolute bottom-0 right-0 p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full cursor-pointer shadow-lg transition-colors">
                  <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Profile Info */}
            <div className="space-y-4">
              {/* Name and Headline */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                  <div className="min-w-0 flex-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                      {user?.username || 'Your Name'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">
                      {formData.headline}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-gray-500 dark:text-gray-400 text-sm">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{formData.address || 'Add location'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span className="text-blue-600 hover:underline cursor-pointer">Connect</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                      Open to
                    </button>
                    <button
                      onClick={() => setEditing(!editing)}
                      className="px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      {editing ? 'Cancel' : 'Edit'}
                    </button>
                  </div>
                </div>

                {/* Bio/About */}
                <div className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  {formData.bio || 'Share what makes you unique as a student and learner. Talk about your interests, goals, and what drives you in your academic journey.'}
                </div>

                {/* Quick Stats */}
                <div className="flex flex-wrap gap-4 py-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900 dark:text-white">{user?.skills?.length || 0}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Skills</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900 dark:text-white">12</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Courses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900 dark:text-white">85%</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Progress</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Mode Modal/Form */}
        {editing && (
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Edit Profile</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Headline
                </label>
                <input
                  type="text"
                  value={formData.headline}
                  onChange={(e) => setFormData(prev => ({ ...prev, headline: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  GitHub URL
                </label>
                <input
                  type="url"
                  value={formData.github}
                  onChange={(e) => setFormData(prev => ({ ...prev, github: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                About
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Tell us about yourself, your learning journey, and your goals..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleUpdateProfile}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Skills Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-blue-500" />
              Skills & Expertise
            </h3>
            <button
              onClick={() => setSkillsEditing(!skillsEditing)}
              className="px-3 py-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors text-sm font-medium"
            >
              {skillsEditing ? 'Done' : 'Manage'}
            </button>
          </div>

          {skillsEditing && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill (e.g., React, Python, Data Analysis)"
                  className="flex-1 px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                />
                <button
                  onClick={handleAddSkill}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {user?.skills?.map((skill, index) => (
              <span
                key={index}
                className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  skillsEditing
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 cursor-pointer hover:bg-red-200 dark:hover:bg-red-900/50'
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                }`}
                onClick={() => skillsEditing && handleRemoveSkill(skill)}
              >
                {skill}
                {skillsEditing && <span className="ml-1 text-red-500">×</span>}
              </span>
            ))}
            {(!user?.skills || user.skills.length === 0) && (
              <div className="text-center py-8 w-full">
                <Star className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">No skills added yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Add skills to showcase your expertise</p>
              </div>
            )}
          </div>
        </div>

        {/* Contact & Links */}
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-green-500" />
            Contact & Social Links
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Mail className="w-5 h-5 text-blue-500" />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Email</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</div>
              </div>
            </div>

            {formData.phone && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Phone className="w-5 h-5 text-green-500" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Phone</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{formData.phone}</div>
                </div>
              </div>
            )}

            {formData.linkedin && (
              <a href={formData.linkedin} target="_blank" rel="noopener noreferrer" 
                 className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                <Linkedin className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">LinkedIn</div>
                  <div className="text-sm text-blue-600">View Profile</div>
                </div>
              </a>
            )}

            {formData.github && (
              <a href={formData.github} target="_blank" rel="noopener noreferrer" 
                 className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <Github className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">GitHub</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">View Repositories</div>
                </div>
              </a>
            )}
          </div>
        </div>

        {/* Resume Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-500" />
            Resume & Documents
          </h3>
          
          {user?.resumeUrl ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3 flex-1 mb-3 sm:mb-0">
                <div className="p-2 bg-green-500 rounded-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">My Resume.pdf</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Last updated recently</p>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => window.open(user.resumeUrl, '_blank')}
                  className="flex-1 sm:flex-none px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors text-sm"
                >
                  View
                </button>
                <a
                  href={user.resumeUrl}
                  download="My_Resume.pdf"
                  className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors text-center text-sm"
                >
                  Download
                </a>
                <button
                  onClick={() => updateUser({ resumeUrl: undefined })}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h4 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                No resume uploaded
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-4 max-w-md mx-auto">
                Upload your resume to showcase your experience and qualifications to potential employers and collaborators.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button 
                  onClick={handleCreateResume}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Create Resume
                </button>
                <label className="px-6 py-3 border-2 border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload PDF
                  <input type="file" accept="application/pdf" onChange={handleResumeUpload} className="hidden" />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};