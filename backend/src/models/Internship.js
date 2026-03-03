const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
    employer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    positionTitle: {
        type: String,
        required: [true, 'Position title is required'],
        trim: true
    },
    domain: {
        type: String,
        required: [true, 'Domain category is required'],
        trim: true
    },
    workEnvironment: {
        type: String,
        enum: ['Remote', 'On-site', 'Hybrid'],
        default: 'Remote'
    },
    location: {
        type: String,
        trim: true
    },
    duration: {
        type: String, // String to handle "3 Months" or "12 Months" from select
        required: [true, 'Duration is required']
    },
    expiryDate: {
        type: Date,
        required: [true, 'Expiry date is required']
    },
    requiredSkills: [mongoose.Schema.Types.Mixed],
    preferredSkills: [{
        type: String,
        trim: true
    }],
    description: {
        type: String,
        required: [true, 'Internship description is required']
    },
    company: {
        type: String,
        required: [true, 'Company name is required']
    },
    status: {
        type: String,
        enum: ['Draft', 'Active', 'Paused', 'Filled', 'Expired', 'Hiring', 'Reviewing', 'Closed'],
        default: 'Hiring'
    },
    numberOfOpenings: {
        type: Number,
        default: 1
    },
    experienceLevel: {
        type: String,
        default: 'Entry Level'
    },
    minimumGPA: {
        type: Number,
        min: 0,
        max: 4.0
    },
    prefersExperienced: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    educationRequirements: {
        type: String,
        trim: true
    },
    requiredDegreeField: [{
        type: String,
        trim: true
    }],
    stipend: {
        amount: Number,
        currency: { type: String, default: 'INR' }
    },
    perks: [{
        type: String,
        trim: true
    }],
    views: {
        type: Number,
        default: 0
    },
    applicants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    skillMatches: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for search
internshipSchema.index({ positionTitle: 'text', description: 'text', company: 'text', domain: 'text' });

const Internship = mongoose.model('Internship', internshipSchema);
module.exports = Internship;
