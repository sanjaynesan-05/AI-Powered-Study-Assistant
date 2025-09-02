const Resume = require('../models/resumeModel');

// @desc    Create a new resume
// @route   POST /api/resume
// @access  Private
const createResume = async (req, res) => {
  try {
    // Check if user already has a resume
    const existingResume = await Resume.findOne({ user: req.user._id });

    if (existingResume) {
      res.status(400);
      throw new Error('User already has a resume. Please update the existing resume instead.');
    }

    const resumeData = {
      ...req.body,
      user: req.user._id,
    };

    const resume = await Resume.create(resumeData);

    res.status(201).json(resume);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get user's resume
// @route   GET /api/resume
// @access  Private
const getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ user: req.user._id });

    if (!resume) {
      res.status(404);
      throw new Error('Resume not found');
    }

    res.json(resume);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// @desc    Update user's resume
// @route   PUT /api/resume
// @access  Private
const updateResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ user: req.user._id });

    if (!resume) {
      res.status(404);
      throw new Error('Resume not found');
    }

    // Update fields
    const updateFields = {};
    for (const key in req.body) {
      updateFields[key] = req.body[key];
    }

    const updatedResume = await Resume.findOneAndUpdate(
      { user: req.user._id },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    res.json(updatedResume);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete user's resume
// @route   DELETE /api/resume
// @access  Private
const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ user: req.user._id });

    if (!resume) {
      res.status(404);
      throw new Error('Resume not found');
    }

    await resume.remove();

    res.json({ message: 'Resume removed' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Add education to resume
// @route   POST /api/resume/education
// @access  Private
const addEducation = async (req, res) => {
  try {
    const resume = await Resume.findOne({ user: req.user._id });

    if (!resume) {
      res.status(404);
      throw new Error('Resume not found');
    }

    resume.education.unshift(req.body);
    await resume.save();

    res.status(201).json(resume);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update education in resume
// @route   PUT /api/resume/education/:eduId
// @access  Private
const updateEducation = async (req, res) => {
  try {
    const resume = await Resume.findOne({ user: req.user._id });

    if (!resume) {
      res.status(404);
      throw new Error('Resume not found');
    }

    const eduIndex = resume.education.findIndex(
      (edu) => edu._id.toString() === req.params.eduId
    );

    if (eduIndex === -1) {
      res.status(404);
      throw new Error('Education not found');
    }

    resume.education[eduIndex] = { ...resume.education[eduIndex]._doc, ...req.body };
    await resume.save();

    res.json(resume);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete education from resume
// @route   DELETE /api/resume/education/:eduId
// @access  Private
const deleteEducation = async (req, res) => {
  try {
    const resume = await Resume.findOne({ user: req.user._id });

    if (!resume) {
      res.status(404);
      throw new Error('Resume not found');
    }

    const eduIndex = resume.education.findIndex(
      (edu) => edu._id.toString() === req.params.eduId
    );

    if (eduIndex === -1) {
      res.status(404);
      throw new Error('Education not found');
    }

    resume.education.splice(eduIndex, 1);
    await resume.save();

    res.json(resume);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Add experience to resume
// @route   POST /api/resume/experience
// @access  Private
const addExperience = async (req, res) => {
  try {
    const resume = await Resume.findOne({ user: req.user._id });

    if (!resume) {
      res.status(404);
      throw new Error('Resume not found');
    }

    resume.experience.unshift(req.body);
    await resume.save();

    res.status(201).json(resume);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update experience in resume
// @route   PUT /api/resume/experience/:expId
// @access  Private
const updateExperience = async (req, res) => {
  try {
    const resume = await Resume.findOne({ user: req.user._id });

    if (!resume) {
      res.status(404);
      throw new Error('Resume not found');
    }

    const expIndex = resume.experience.findIndex(
      (exp) => exp._id.toString() === req.params.expId
    );

    if (expIndex === -1) {
      res.status(404);
      throw new Error('Experience not found');
    }

    resume.experience[expIndex] = { ...resume.experience[expIndex]._doc, ...req.body };
    await resume.save();

    res.json(resume);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete experience from resume
// @route   DELETE /api/resume/experience/:expId
// @access  Private
const deleteExperience = async (req, res) => {
  try {
    const resume = await Resume.findOne({ user: req.user._id });

    if (!resume) {
      res.status(404);
      throw new Error('Resume not found');
    }

    const expIndex = resume.experience.findIndex(
      (exp) => exp._id.toString() === req.params.expId
    );

    if (expIndex === -1) {
      res.status(404);
      throw new Error('Experience not found');
    }

    resume.experience.splice(expIndex, 1);
    await resume.save();

    res.json(resume);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Generate PDF from resume
// @route   GET /api/resume/generate-pdf
// @access  Private
const generateResumePDF = async (req, res) => {
  try {
    const resume = await Resume.findOne({ user: req.user._id });

    if (!resume) {
      res.status(404);
      throw new Error('Resume not found');
    }

    // PDF generation logic would go here
    // For now, we'll just return the resume data
    res.json({
      message: 'PDF generation endpoint',
      resumeData: resume
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createResume,
  getResume,
  updateResume,
  deleteResume,
  addEducation,
  updateEducation,
  deleteEducation,
  addExperience,
  updateExperience,
  deleteExperience,
  generateResumePDF,
};
