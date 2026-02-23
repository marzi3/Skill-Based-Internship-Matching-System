const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Skill name is required'],
    trim: true,
  },
  proficiency: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Intermediate',
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const educationSchema = new mongoose.Schema({
  institution: {
    type: String,
    required: [true, 'Institution name is required'],
    trim: true,
  },
  degree: {
    type: String,
    required: [true, 'Degree is required'],
    trim: true,
  },
  field: {
    type: String,
    required: [true, 'Field of study is required'],
    trim: true,
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
  },
  endDate: {
    type: Date,
  },
  isCurrentlyStudying: {
    type: Boolean,
    default: false,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true,
  },

  // Personal Information
  personalInfo: {
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
  },

  // Profile Image
  profileImage: {
    fileName: String,
    filePath: String,
    uploadedAt: Date,
  },

  // Cover Image
  coverImage: {
    fileName: String,
    filePath: String,
    uploadedAt: Date,
  },

  // Education Details
  education: [educationSchema],

  // Skills
  skills: [skillSchema],

  // Profile Completeness
  profileCompletion: {
    personal: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    education: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    skills: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    overall: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },

  // Resume
  resume: {
    fileName: String,
    filePath: String,
    uploadedAt: Date,
  },

  // Portfolio Links
  portfolio: {
    github: String,
    linkedin: String,
    website: String,
    portfolio: String,
  },

  // Status
  status: {
    type: String,
    enum: ['incomplete', 'complete', 'verified'],
    default: 'incomplete',
  },

  // Preferences
  preferences: {
    internshipType: [String], // Full-time, Part-time, Freelance, etc.
    industry: [String],
    workMode: [String], // Remote, On-site, Hybrid
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Calculate profile completion
studentSchema.methods.calculateProfileCompletion = function () {
  let personalScore = 0;
  let educationScore = 0;
  let skillsScore = 0;

  // Personal Info: 0-100
  if (this.personalInfo.firstName && this.personalInfo.lastName) personalScore += 20;
  if (this.personalInfo.email) personalScore += 20;
  if (this.personalInfo.phone) personalScore += 20;
  if (this.personalInfo.location) personalScore += 20;
  personalScore += this.portfolio?.github ? 10 : 0;
  personalScore += this.portfolio?.linkedin ? 10 : 0;

  // Education: 0-100
  if (this.education.length > 0) {
    educationScore += 50;
    if (this.education.length > 1) educationScore += 50;
  }

  // Skills: 0-100
  if (this.skills.length > 0) skillsScore += 50;
  if (this.skills.length >= 5) skillsScore += 50;

  // Cap scores at 100
  this.profileCompletion.personal = Math.min(personalScore, 100);
  this.profileCompletion.education = Math.min(educationScore, 100);
  this.profileCompletion.skills = Math.min(skillsScore, 100);
  this.profileCompletion.overall = Math.round(
    (this.profileCompletion.personal * 0.3 +
      this.profileCompletion.education * 0.35 +
      this.profileCompletion.skills * 0.35) / 100
  );

  // Update status
  if (this.profileCompletion.overall >= 80) {
    this.status = 'complete';
  } else if (this.profileCompletion.overall > 0) {
    this.status = 'incomplete';
  }

  return this.profileCompletion;
};

// Middleware to update timestamps
studentSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Student', studentSchema);
