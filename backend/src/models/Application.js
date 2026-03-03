const mongoose = require('mongoose');

const applicationStatusEnum = [
    'SUBMITTED',
    'UNDER_REVIEW',
    'SHORTLISTED',
    'INTERVIEW',
    'OFFERED',
    'ACCEPTED',
    'REJECTED',
    'WITHDRAWN',
    'Applied',
    'Reviewing',
    'Interviewing',
    'Selected',
    'Rejected'
];

const statusHistorySchema = new mongoose.Schema({
    status: {
        type: String,
        enum: applicationStatusEnum,
        required: true
    },
    changedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    note: {
        type: String,
        trim: true,
        default: ''
    },
    changedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

const applicationMessageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    senderRole: {
        type: String,
        enum: ['student', 'employer', 'admin', 'system'],
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

const applicationSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    internship: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Internship',
        required: true
    },
    employer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: applicationStatusEnum,
        default: 'SUBMITTED'
    },
    appliedDate: {
        type: Date,
        default: Date.now
    },
    answers: [{
        question: String,
        answer: String
    }],
    coverLetter: {
        type: String,
        trim: true,
        default: ''
    },
    resume: String,
    resumeSnapshot: {
        fileName: String,
        filePath: String,
        snapshotAt: Date
    },
    matchScore: {
        type: Number,
        default: 0
    },
    matchTier: {
        type: String,
        default: 'UNKNOWN'
    },
    matchResults: [String],
    statusHistory: [statusHistorySchema],
    messages: [applicationMessageSchema],
    withdrawnReason: {
        type: String,
        trim: true,
        default: ''
    },
    withdrawnAt: Date,
    interview: {
        scheduledAt: Date,
        notes: {
            type: String,
            trim: true,
            default: ''
        }
    }
}, {
    timestamps: true
});

// Avoid double applications
applicationSchema.index({ student: 1, internship: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
