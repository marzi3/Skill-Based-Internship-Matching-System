const logger = require('../utils/logger');
const Student = require('../models/Student');
const User = require('../models/User');
const Internship = require('../models/Internship');
const asyncHandler = require('express-async-handler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get student profile
// @route   GET /api/student/profile
// @access  Private
exports.getProfile = asyncHandler(async (req, res, next) => {
  const student = await Student.findOne({ userId: req.user.id }).populate('userId');

  if (!student) {
    return res.status(200).json({
      success: true,
      data: null,
      message: 'No student profile found',
    });
  }

  res.status(200).json({
    success: true,
    data: student,
  });
});

// @desc    Create or get student profile
// @route   POST /api/student/profile/init
// @access  Private
exports.initializeProfile = asyncHandler(async (req, res, next) => {
  let student = await Student.findOne({ userId: req.user.id });

  if (!student) {
    student = await Student.create({
      userId: req.user.id,
    });
  }

  res.status(201).json({
    success: true,
    data: student,
  });
});

// @desc    Save personal information
// @route   POST /api/student/profile/personal
// @access  Private
exports.savePersonalInfo = asyncHandler(async (req, res, next) => {
  const { 
    fullName, 
    designation, 
    email, 
    phone, 
    location, 
    dateOfBirth, 
    gender,
    // CRITICAL MATCHING ENGINE FIELDS
    gpa,
    portfolioUrl,
    preferredLocation,
    durationPreference,
    industriesOfInterest,
    previousInternshipsCount,
    isPublic
  } = req.body;

  // Validation
  if (!fullName || !email) {
    return next(
      new ErrorResponse(
        'Full name and email are required',
        400
      )
    );
  }

  let student = await Student.findOne({ userId: req.user.id });

  if (!student) {
    student = await Student.create({
      userId: req.user.id,
    });
  }

  // Update personal info with all new fields
  student.personalInfo = {
    ...(student.personalInfo || {}), // Preserve existing data
    fullName: fullName.trim(),
    designation: designation?.trim() || '',
    email: email.toLowerCase().trim(),
    phone: phone?.trim() || '',
    location: location?.trim() || '',
    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : student.personalInfo?.dateOfBirth,
    gender: gender || student.personalInfo?.gender,
    // CRITICAL MATCHING ENGINE FIELDS
    gpa: gpa?.trim() || student.personalInfo?.gpa || '',
    portfolioUrl: portfolioUrl?.trim() || student.personalInfo?.portfolioUrl || '',
    preferredLocation: preferredLocation?.trim() || student.personalInfo?.preferredLocation || '',
    durationPreference: durationPreference || student.personalInfo?.durationPreference,
    industriesOfInterest: Array.isArray(industriesOfInterest) ? industriesOfInterest : (student.personalInfo?.industriesOfInterest || []),
    previousInternshipsCount: typeof previousInternshipsCount === 'number' ? previousInternshipsCount : (student.personalInfo?.previousInternshipsCount || 0),
    isPublic: typeof isPublic === 'boolean' ? isPublic : (student.personalInfo?.isPublic !== false),
  };

  // Update user email if different
  if (email && email !== req.user.email) {
    const user = await User.findById(req.user.id);
    user.email = email.toLowerCase().trim();
    await user.save();
  }

  // Calculate profile completion
  student.calculateProfileCompletion();
  await student.save();

  res.status(200).json({
    success: true,
    message: 'Personal information saved successfully',
    data: student,
  });
});

// @desc    Save education details
// @route   POST /api/student/profile/education
// @access  Private
exports.saveEducation = asyncHandler(async (req, res, next) => {
  try {
    const { institution, degree, field, degreeLevel, startDate, endDate, isCurrentlyStudying } = req.body;
    
    logger.info('Education request data:', { institution, degree, field, degreeLevel, startDate, endDate });

    // Validation
    if (!institution || !degree || !field || !startDate) {
      return next(
        new ErrorResponse(
          'Institution, degree, field, and start date are required',
          400
        )
      );
    }

  // Validate dates
  if (isNaN(new Date(startDate).getTime())) {
    return next(
      new ErrorResponse(
        'Invalid start date format',
        400
      )
    );
  }

  if (endDate && isNaN(new Date(endDate).getTime())) {
    return next(
      new ErrorResponse(
        'Invalid end date format',
        400
      )
    );
  }

  // Validate degree level if provided
  const validDegreeLevels = ['HIGH_SCHOOL', 'ASSOCIATE', 'BACHELOR', 'MASTER', 'DOCTORATE', 'CERTIFICATE'];
  if (degreeLevel && !validDegreeLevels.includes(degreeLevel)) {
    return next(
      new ErrorResponse(
        'Invalid degree level. Must be: HIGH_SCHOOL, ASSOCIATE, BACHELOR, MASTER, DOCTORATE, or CERTIFICATE',
        400
      )
    );
  }

  let student = await Student.findOne({ userId: req.user.id });

  if (!student) {
    student = await Student.create({
      userId: req.user.id,
    });
  }

    // Create education entry with safe date conversion
    const newEducation = {
      institution: institution.trim(),
      degree: degree.trim(),
      field: field.trim(),
      startDate: new Date(startDate),
      endDate: endDate && endDate.trim() ? new Date(endDate) : null,
      isCurrentlyStudying: isCurrentlyStudying || false,
    };

    // Add degreeLevel if provided
    if (degreeLevel) {
      newEducation.degreeLevel = degreeLevel;
    }

    logger.info('Processed education:', newEducation);

    // Check if education entry already exists
    const existingIndex = student.education.findIndex(
      (edu) => edu.institution === institution && edu.degree === degree
    );

    if (existingIndex !== -1) {
      student.education[existingIndex] = { ...student.education[existingIndex], ...newEducation };
    } else {
      student.education.push(newEducation);
    }

    // Calculate profile completion
    student.calculateProfileCompletion();
    await student.save();

    res.status(200).json({
      success: true,
      message: 'Education details saved successfully',
      data: student,
    });
  } catch (error) {
    logger.error('Education save error:', error);
    return next(new ErrorResponse(`Failed to save education: ${error.message}`, 500));
  }
});

// @desc    Add or update skill
// @route   POST /api/student/profile/skill
// @access  Private
exports.addSkill = asyncHandler(async (req, res, next) => {
  const { name, proficiency } = req.body;

  // Validation
  if (!name) {
    return next(new ErrorResponse('Skill name is required', 400));
  }

  // Set default proficiency if not provided or invalid
  const validProficiencies = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];
  const skillProficiency = validProficiencies.includes(proficiency) ? proficiency : 'INTERMEDIATE';

  let student = await Student.findOne({ userId: req.user.id });

  if (!student) {
    student = await Student.create({
      userId: req.user.id,
    });
  }

  // Check if skill already exists
  const existingSkill = student.skills.find(
    (skill) => skill.name.toLowerCase() === name.toLowerCase()
  );

  if (existingSkill) {
    existingSkill.proficiency = skillProficiency;
  } else {
    student.skills.push({
      name: name.trim(),
      proficiency: skillProficiency,
    });
  }

  // Calculate profile completion
  student.calculateProfileCompletion();
  await student.save();

  res.status(200).json({
    success: true,
    message: 'Skill added successfully',
    data: student,
  });
});

// @desc    Remove skill
// @route   DELETE /api/student/profile/skill/:skillId
// @access  Private
exports.removeSkill = asyncHandler(async (req, res, next) => {
  const { skillId } = req.params;

  const student = await Student.findOne({ userId: req.user.id });

  if (!student) {
    return next(new ErrorResponse('Student profile not found', 404));
  }

  student.skills = student.skills.filter((skill) => skill._id.toString() !== skillId);

  // Calculate profile completion
  student.calculateProfileCompletion();
  await student.save();

  res.status(200).json({
    success: true,
    message: 'Skill removed successfully',
    data: student,
  });
});

// @desc    Get all skills
// @route   GET /api/student/profile/skills
// @access  Private
exports.getSkills = asyncHandler(async (req, res, next) => {
  const student = await Student.findOne({ userId: req.user.id });

  if (!student) {
    return res.status(200).json({
      success: true,
      data: [],
    });
  }

  res.status(200).json({
    success: true,
    data: student.skills,
  });
});

// @desc    Get education history
// @route   GET /api/student/profile/education
// @access  Private
exports.getEducation = asyncHandler(async (req, res, next) => {
  const student = await Student.findOne({ userId: req.user.id });

  if (!student) {
    return res.status(200).json({
      success: true,
      data: [],
    });
  }

  res.status(200).json({
    success: true,
    data: student.education,
  });
});

// @desc    Delete education entry
// @route   DELETE /api/student/profile/education/:educationId
// @access  Private
exports.removeEducation = asyncHandler(async (req, res, next) => {
  const { educationId } = req.params;

  const student = await Student.findOne({ userId: req.user.id });

  if (!student) {
    return next(new ErrorResponse('Student profile not found', 404));
  }

  student.education = student.education.filter(
    (edu) => edu._id.toString() !== educationId
  );

  // Calculate profile completion
  student.calculateProfileCompletion();
  await student.save();

  res.status(200).json({
    success: true,
    message: 'Education entry removed successfully',
    data: student,
  });
});

// @desc    Update portfolio links
// @route   POST /api/student/profile/portfolio
// @access  Private
exports.updatePortfolio = asyncHandler(async (req, res, next) => {
  const { github, linkedin, website, portfolio } = req.body;

  let student = await Student.findOne({ userId: req.user.id });

  if (!student) {
    student = await Student.create({
      userId: req.user.id,
    });
  }

  student.portfolio = {
    github: github?.trim() || '',
    linkedin: linkedin?.trim() || '',
    website: website?.trim() || '',
    portfolio: portfolio?.trim() || '',
  };

  // Calculate profile completion
  student.calculateProfileCompletion();
  await student.save();

  res.status(200).json({
    success: true,
    message: 'Portfolio links updated successfully',
    data: student,
  });
});

// @desc    Get profile completion status
// @route   GET /api/student/profile/completion
// @access  Private
exports.getProfileCompletion = asyncHandler(async (req, res, next) => {
  const student = await Student.findOne({ userId: req.user.id });

  if (!student) {
    return res.status(200).json({
      success: true,
      data: {
        personal: 0,
        education: 0,
        skills: 0,
        overall: 0,
      },
    });
  }

  res.status(200).json({
    success: true,
    data: student.profileCompletion,
  });
});

// @desc    Upload profile image
// @route   POST /api/student/profile/image
// @access  Private
exports.uploadProfileImage = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Please upload an image file', 400));
  }

  let student = await Student.findOne({ userId: req.user.id });

  if (!student) {
    student = await Student.create({
      userId: req.user.id,
    });
  }

  // Update profile image
  const profilePicturePath = req.file.path.replace(/\\/g, '/'); // Normalize path for cross-platform
  student.profileImage = {
    fileName: req.file.filename,
    filePath: profilePicturePath,
    uploadedAt: new Date(),
  };

  // Sync with User model
  await User.findByIdAndUpdate(req.user.id, {
    profilePicture: profilePicturePath
  });

  // Calculate profile completion
  student.calculateProfileCompletion();
  await student.save();

  res.status(200).json({
    success: true,
    message: 'Profile image uploaded successfully',
    data: {
      student: student,
      filePath: req.file.path,
    },
  });
});

// @desc    Add certification
// @route   POST /api/student/profile/certification
// @access  Private
exports.addCertification = asyncHandler(async (req, res, next) => {
  const { name, credentialUrl, issuedDate } = req.body;

  // Validation
  if (!name || !issuedDate) {
    return next(
      new ErrorResponse(
        'Certification name and issued date are required',
        400
      )
    );
  }

  let student = await Student.findOne({ userId: req.user.id });

  if (!student) {
    student = await Student.create({
      userId: req.user.id,
    });
  }

  // Check if certification already exists
  const existingCert = student.certifications.find(
    (cert) => cert.name.toLowerCase() === name.toLowerCase()
  );

  if (existingCert) {
    return next(
      new ErrorResponse(
        'Certification with this name already exists',
        400
      )
    );
  }

  // Add new certification
  student.certifications.push({
    name: name.trim(),
    credentialUrl: credentialUrl?.trim() || '',
    issuedDate: new Date(issuedDate),
  });

  // Calculate profile completion
  student.calculateProfileCompletion();
  await student.save();

  res.status(200).json({
    success: true,
    message: 'Certification added successfully',
    data: student,
  });
});

// @desc    Remove certification
// @route   DELETE /api/student/profile/certification/:certificationId
// @access  Private
exports.removeCertification = asyncHandler(async (req, res, next) => {
  const { certificationId } = req.params;

  let student = await Student.findOne({ userId: req.user.id });

  if (!student) {
    return next(new ErrorResponse('Student profile not found', 404));
  }

  // Find and remove certification
  const certIndex = student.certifications.findIndex(
    (cert) => cert._id.toString() === certificationId
  );

  if (certIndex === -1) {
    return next(new ErrorResponse('Certification not found', 404));
  }

  student.certifications.splice(certIndex, 1);

  // Calculate profile completion
  student.calculateProfileCompletion();
  await student.save();

  res.status(200).json({
    success: true,
    message: 'Certification removed successfully',
    data: student,
  });
});

// @desc    Upload resume
// @route   POST /api/student/profile/resume
// @access  Private
exports.uploadResume = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Please upload a resume file', 400));
  }

  // Validate file type
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!allowedTypes.includes(req.file.mimetype)) {
    return next(new ErrorResponse('Please upload a valid resume file (PDF, DOC, DOCX)', 400));
  }

  let student = await Student.findOne({ userId: req.user.id });

  if (!student) {
    student = await Student.create({
      userId: req.user.id,
    });
  }

  // Update resume
  const resumePath = req.file.path.replace(/\\/g, '/');
  student.resume = {
    fileName: req.file.filename,
    filePath: resumePath,
    uploadedAt: new Date(),
  };

  // Calculate profile completion
  student.calculateProfileCompletion();
  await student.save();

  res.status(200).json({
    success: true,
    message: 'Resume uploaded successfully',
    data: {
      student: student,
      filePath: req.file.path,
    },
  });
});

// @desc    Reset/Delete all profile data
// @route   DELETE /api/student/profile/reset
// @access  Private
exports.resetProfile = asyncHandler(async (req, res, next) => {
  let student = await Student.findOne({ userId: req.user.id });

  if (!student) {
    return res.status(200).json({
      success: true,
      message: 'No profile data found to reset',
    });
  }

  // Clear all profile data
  student.personalInfo = {};
  student.education = [];
  student.skills = [];
  student.certifications = [];
  student.profileImage = {};
  student.coverImage = {};
  student.resume = {};
  student.portfolio = {};
  student.profileCompletion = {
    personal: 0,
    education: 0,
    skills: 0,
    overall: 0,
  };
  student.status = 'incomplete';

  await student.save();

  res.status(200).json({
    success: true,
    message: 'Profile data reset successfully',
    data: student,
  });
});

// @desc    Upload cover image
// @route   POST /api/student/profile/cover
// @access  Private
exports.uploadCoverImage = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Please upload an image file', 400));
  }

  let student = await Student.findOne({ userId: req.user.id });

  if (!student) {
    student = await Student.create({
      userId: req.user.id,
    });
  }

  // Update cover image
  student.coverImage = {
    fileName: req.file.filename,
    filePath: req.file.path,
    uploadedAt: new Date(),
  };

  // Calculate profile completion
  student.calculateProfileCompletion();
  await student.save();

  res.status(200).json({
    success: true,
    message: 'Cover image uploaded successfully',
    data: {
      student: student,
      filePath: req.file.path,
    },
  });
});

// @desc    Get user's saved/bookmarked internships
// @route   GET /api/students/bookmarks
// @access  Private (Student)
exports.getSavedInternships = async (req, res) => {
    try {
        const student = await User.findById(req.user.id).populate('savedInternships');

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        res.status(200).json({
            success: true,
            count: student.savedInternships.length,
            data: student.savedInternships
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Bookmark an internship
// @route   POST /api/students/bookmarks/:id
// @access  Private (Student)
exports.bookmarkInternship = async (req, res) => {
    try {
        const internshipId = req.params.id;
        const internship = await Internship.findById(internshipId);

        if (!internship) {
            return res.status(404).json({ success: false, message: 'Internship not found' });
        }

        // Add to savedInternships if not already present
        const student = await User.findByIdAndUpdate(
            req.user.id,
            { $addToSet: { savedInternships: internshipId } },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Internship bookmarked successfully',
            data: student.savedInternships
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Remove an internship from bookmarks
// @route   DELETE /api/students/bookmarks/:id
// @access  Private (Student)
exports.unbookmarkInternship = async (req, res) => {
    try {
        const internshipId = req.params.id;

        // Remove from savedInternships
        const student = await User.findByIdAndUpdate(
            req.user.id,
            { $pull: { savedInternships: internshipId } },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Internship removed from bookmarks',
            data: student.savedInternships
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

