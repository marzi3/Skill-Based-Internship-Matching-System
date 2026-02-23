const Student = require('../models/Student');
const User = require('../models/User');
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
  const { firstName, lastName, email, phone, location } = req.body;

  // Validation
  if (!firstName || !lastName || !email) {
    return next(
      new ErrorResponse(
        'First name, last name, and email are required',
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

  // Update personal info
  student.personalInfo = {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.toLowerCase().trim(),
    phone: phone?.trim() || '',
    location: location?.trim() || '',
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
  const { institution, degree, field, startDate, endDate, isCurrentlyStudying } = req.body;

  // Validation
  if (!institution || !degree || !field || !startDate) {
    return next(
      new ErrorResponse(
        'Institution, degree, field, and start date are required',
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

  // Create education entry
  const newEducation = {
    institution: institution.trim(),
    degree: degree.trim(),
    field: field.trim(),
    startDate: new Date(startDate),
    endDate: endDate ? new Date(endDate) : null,
    isCurrentlyStudying: isCurrentlyStudying || false,
  };

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

  if (!['Beginner', 'Intermediate', 'Advanced', 'Expert'].includes(proficiency)) {
    return next(
      new ErrorResponse(
        'Invalid proficiency level. Must be Beginner, Intermediate, Advanced, or Expert',
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

  // Check if skill already exists
  const existingSkill = student.skills.find(
    (skill) => skill.name.toLowerCase() === name.toLowerCase()
  );

  if (existingSkill) {
    existingSkill.proficiency = proficiency;
  } else {
    student.skills.push({
      name: name.trim(),
      proficiency,
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
  student.profileImage = {
    fileName: req.file.filename,
    filePath: req.file.path,
    uploadedAt: new Date(),
  };

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
