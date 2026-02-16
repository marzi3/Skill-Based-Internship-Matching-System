const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [0, 'Age must be a positive number'],
    max: [150, 'Age must be realistic']
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
  versionKey: false
});

// Virtual field for id (MongoDB uses _id by default)
userSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id.toHexString();
    delete ret._id;
    return ret;
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
