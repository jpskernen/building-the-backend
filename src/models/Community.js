const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Community name is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Community name must be at least 3 characters'],
      maxlength: [21, 'Community name cannot exceed 21 characters'],
      match: [/^[a-zA-Z0-9_]+$/, 'Community name can only contain letters, numbers, and underscores'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    moderators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    memberCount: {
      type: Number,
      default: 1,
    },
    banner: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '',
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    rules: [
      {
        title: { type: String, required: true },
        description: { type: String, default: '' },
      },
    ],
  },
  { timestamps: true }
);

communitySchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Community', communitySchema);
