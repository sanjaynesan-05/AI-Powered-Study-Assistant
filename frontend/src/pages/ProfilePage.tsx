import React, { useState } from 'react';
import { Camera, Edit, Plus, FileText, Download, Upload } from 'lucide-react';
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
    bio: ''
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white 
                     hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <h1 className="text-2xl font-bold mb-1 relative z-10">My Profile</h1>
        <p className="text-blue-100 relative z-10">Manage your personal information</p>
      </div>

      {/* Profile Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 shadow-lg 
                     border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl 
                     transition-all duration-300 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 
                       opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6 relative z-10">
          {/* Profile Photo */}
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full 
                           flex items-center justify-center text-white text-2xl font-bold shadow-lg
                           border-2 border-white dark:border-gray-700">
              {user?.profilePhoto ? (
                <img src={user.profilePhoto} alt="Profile" className="w-full h-full rounded-full object-cover" />
              ) : (
                user?.username?.[0]?.toUpperCase() || 'U'
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-2 bg-blue-500 text-white rounded-full 
                             hover:bg-blue-600 transition-all duration-300 cursor-pointer
                             shadow-lg hover:shadow-xl border-2 border-white dark:border-gray-700
                             hover:scale-110">
              <Camera className="w-3 h-3" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            {editing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                             focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    placeholder="Username"
                  />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                             focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    placeholder="Email"
                  />
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                             focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                  <select
                    value={formData.education}
                    onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value as 'student' | 'graduate' }))}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                             focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="student">Student</option>
                    <option value="graduate">Graduate</option>
                  </select>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                             focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    placeholder="Phone Number"
                  />
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                             focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    placeholder="Address"
                  />
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                             focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    placeholder="LinkedIn URL"
                  />
                  <input
                    type="url"
                    value={formData.github}
                    onChange={(e) => setFormData(prev => ({ ...prev, github: e.target.value }))}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                             focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    placeholder="GitHub URL"
                  />
                </div>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                           focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm h-20"
                  placeholder="Tell us about yourself..."
                />
                <div className="flex space-x-3">
                  <button
                    onClick={handleUpdateProfile}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 
                             font-medium transform hover:scale-105 transition-all duration-300 text-sm"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300
                             transform hover:scale-105 font-medium text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                  {user?.username}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-2">{user?.email}</p>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                  {user?.dateOfBirth && `Born: ${user.dateOfBirth}`}
                </p>
                <div className="flex items-center space-x-3">
                  <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 
                                 text-blue-800 dark:text-blue-200 rounded-lg text-xs font-medium">
                    {user?.education === 'student' ? '🎓 Student' : '🎓 Graduate'}
                  </span>
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center space-x-1 px-4 py-2 bg-blue-500 text-white 
                             rounded-lg hover:bg-blue-600 transform hover:scale-105 
                             transition-all duration-300 font-medium text-sm"
                  >
                    <Edit className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 shadow-lg 
                     border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl 
                     transition-all duration-300 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-blue-500/5 
                       opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="flex items-center justify-between mb-4 relative z-10">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">💡 Skills</h3>
          <button
            onClick={() => setSkillsEditing(!skillsEditing)}
            className="flex items-center space-x-1 px-4 py-2 bg-green-500 text-white 
                     rounded-lg hover:bg-green-600 transform hover:scale-105 
                     transition-all duration-300 font-medium text-sm"
          >
            <Plus className="w-3 h-3" />
            <span>Manage</span>
          </button>
        </div>

        {skillsEditing && (
          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border-2 border-dashed 
                         border-gray-300 dark:border-gray-600 relative z-10">
            <div className="flex space-x-3">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Enter a skill..."
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                         focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
              />
              <button
                onClick={handleAddSkill}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 
                         font-medium transform hover:scale-105 transition-all duration-300 text-sm"
              >
                Add
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 relative z-10">
          {user?.skills?.map((skill, index) => (
            <span
              key={index}
              className="group px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 
                       rounded-lg font-medium hover:scale-105 transition-all duration-300 
                       cursor-pointer relative shadow-sm hover:shadow-md text-sm"
              onClick={() => skillsEditing && handleRemoveSkill(skill)}
            >
              {skill}
              {skillsEditing && (
                <span className="ml-1 text-red-500 hover:text-red-700 font-bold">×</span>
              )}
            </span>
          ))}
          {(!user?.skills || user.skills.length === 0) && (
            <div className="w-full text-center py-8">
              <div className="text-4xl mb-2">🎯</div>
              <p className="text-gray-500 dark:text-gray-400">No skills added yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Resume Section */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 shadow-lg 
                     border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl 
                     transition-all duration-300 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 
                       opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 relative z-10">📄 My Resume</h3>
        
        {user?.resumeUrl ? (
          <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/30 
                         rounded-xl border border-green-200 dark:border-green-700 relative z-10">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-200">My Resume.pdf</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Generated via Resume Builder</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => window.open(user.resumeUrl, '_blank')}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                         font-medium transform hover:scale-105 transition-all duration-300 text-sm"
              >
                View
              </button>
              <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                               hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300
                               transform hover:scale-105 font-medium text-sm">
                Download
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 relative z-10">
            <div className="text-4xl mb-3">📄</div>
            <h4 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
              No resume found
            </h4>
            <p className="text-gray-500 dark:text-gray-500 mb-4 text-sm">
              Create a professional resume using our Resume Builder
            </p>
            <button 
              onClick={handleCreateResume}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium 
                       hover:bg-blue-600 transform hover:scale-105 transition-all duration-300"
            >
              Create Resume
            </button>
          </div>
        )}
      </div>

      {/* Statistics Section */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 shadow-lg 
                     border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl 
                     transition-all duration-300 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 
                       opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 relative z-10">📊 Statistics</h3>
        
        <div className="grid grid-cols-3 gap-4 relative z-10">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              {user?.skills?.length || 0}
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-xs">Skills</div>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/30 rounded-xl">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
              {user?.resumeUrl ? '1' : '0'}
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-xs">Resume</div>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
              85%
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-xs">Complete</div>
          </div>
        </div>
      </div>
    </div>
  );
};