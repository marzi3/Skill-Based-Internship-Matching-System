const mongoose = require('mongoose');

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
        enum: ['Applied', 'Reviewing', 'Interviewing', 'Selected', 'Rejected'],
        default: 'Applied'
    },
    appliedDate: {
        type: Date,
        default: Date.now
    },
    answers: [{
        question: String,
        answer: String
    }],
    resume: String,
    matchScore: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Avoid double applications
applicationSchema.index({ student: 1, internship: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
