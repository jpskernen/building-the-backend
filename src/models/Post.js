const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Post title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [300, 'Title cannot exceed 300 characters'],
    },
    body: {
      type: String,
      maxlength: [40000, 'Post body cannot exceed 40000 characters'],
      default: '',
    },
    url: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['text', 'link', 'image'],
      default: 'text',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
    },
    voteScore: {
      type: Number,
      default: 0,
    },
    upvotes: {
      type: Number,
      default: 0,
    },
    downvotes: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    flair: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

postSchema.index({ title: 'text', body: 'text' });
postSchema.index({ community: 1, createdAt: -1 });
postSchema.index({ voteScore: -1 });

module.exports = mongoose.model('Post', postSchema);
