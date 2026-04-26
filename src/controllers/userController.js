const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

// GET /api/users/:username
const getUser = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password')
      .populate('communities', 'name icon');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/:username/posts
const getUserPosts = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const { page = 1, limit = 25 } = req.query;
    const posts = await Post.find({ author: user._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('community', 'name');
    res.json({ success: true, posts });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/:username/comments
const getUserComments = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const { page = 1, limit = 25 } = req.query;
    const comments = await Comment.find({ author: user._id, isDeleted: false })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('post', 'title');
    res.json({ success: true, comments });
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/me
const updateMe = async (req, res, next) => {
  try {
    const { bio, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { bio, avatar },
      { new: true, runValidators: true }
    ).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUser, getUserPosts, getUserComments, updateMe };
