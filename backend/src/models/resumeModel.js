const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    personalInfo: {
      fullName: {
        type: String,
        required: [true, 'Please provide your full name'],
      },
      email: {
        type: String,
        required: [true, 'Please provide your email'],
      },
      phone: {
        type: String,
      },
      address: {
        type: String,
      },
      linkedIn: {
        type: String,
      },
      github: {
        type: String,
      },
      website: {
        type: String,
      },
    },
    summary: {
      type: String,
    },
    education: [
      {
        institution: {
          type: String,
          required: true,
        },
        degree: {
          type: String,
          required: true,
        },
        fieldOfStudy: {
          type: String,
        },
        startDate: {
          type: Date,
          required: true,
        },
        endDate: {
          type: Date,
        },
        present: {
          type: Boolean,
          default: false,
        },
        description: {
          type: String,
        },
      },
    ],
    experience: [
      {
        company: {
          type: String,
          required: true,
        },
        position: {
          type: String,
          required: true,
        },
        startDate: {
          type: Date,
          required: true,
        },
        endDate: {
          type: Date,
        },
        present: {
          type: Boolean,
          default: false,
        },
        description: {
          type: String,
        },
        achievements: [String],
      },
    ],
    skills: [
      {
        name: {
          type: String,
          required: true,
        },
        level: {
          type: String,
          enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
        },
      },
    ],
    projects: [
      {
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
        },
        technologies: [String],
        link: {
          type: String,
        },
        githubLink: {
          type: String,
        },
      },
    ],
    certificates: [
      {
        name: {
          type: String,
          required: true,
        },
        issuer: {
          type: String,
        },
        date: {
          type: Date,
        },
        link: {
          type: String,
        },
      },
    ],
    languages: [
      {
        name: {
          type: String,
          required: true,
        },
        proficiency: {
          type: String,
          enum: ['Basic', 'Intermediate', 'Fluent', 'Native'],
        },
      },
    ],
    template: {
      type: String,
      default: 'standard',
    },
  },
  {
    timestamps: true,
  }
);

const Resume = mongoose.model('Resume', resumeSchema);

module.exports = Resume;
