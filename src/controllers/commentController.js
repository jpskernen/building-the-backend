const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Vote = require('../models/Vote');

// GET /api/posts/:id/comments
const getComments = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    // Return top-level comments; clients may fetch nested replies using parent id
    const comments = await Comment.find({ post: post._id, parent: null, isDeleted: false })
      .sort({ voteScore: -1, createdAt: -1 })
      .populate('author', 'username avatar');
    res.json({ success: true, comments });
  } catch (error) {
    next(error);
  }
};

// GET /api/comments/:id/replies
const getReplies = async (req, res, next) => {
  try {
    const replies = await Comment.find({ parent: req.params.id, isDeleted: false })
      .sort({ voteScore: -1, createdAt: -1 })
      .populate('author', 'username avatar');
    res.json({ success: true, replies });
  } catch (error) {
    next(error);
  }
};

// POST /api/posts/:id/comments
const createComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    if (post.isLocked) {
      return res.status(403).json({ success: false, message: 'Post is locked' });
    }
    const { body, parentId } = req.body;

    let depth = 0;
    if (parentId) {
      const parentComment = await Comment.findById(parentId);
      if (!parentComment) {
        return res.status(404).json({ success: false, message: 'Parent comment not found' });
      }
      depth = parentComment.depth + 1;
    }

    const comment = await Comment.create({
      body,
      author: req.user._id,
      post: post._id,
      parent: parentId || null,
      depth,
    });

    await Post.findByIdAndUpdate(post._id, { $inc: { commentCount: 1 } });
    await comment.populate('author', 'username avatar');
    res.status(201).json({ success: true, comment });
  } catch (error) {
    next(error);
  }
};

// PUT /api/comments/:id
const updateComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }
    if (!comment.author.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    comment.body = req.body.body || comment.body;
    await comment.save();
    res.json({ success: true, comment });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/comments/:id
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }
    if (!comment.author.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    // Soft delete to preserve thread structure
    comment.isDeleted = true;
    comment.body = '[deleted]';
    await comment.save();
    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    next(error);
  }
};

// POST /api/comments/:id/vote
const voteComment = async (req, res, next) => {
  try {
    const { value } = req.body;
    if (![1, -1].includes(Number(value))) {
      return res.status(400).json({ success: false, message: 'Vote value must be 1 or -1' });
    }
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const existingVote = await Vote.findOne({ user: req.user._id, targetId: comment._id, targetType: 'Comment' });

    if (existingVote) {
      if (existingVote.value === Number(value)) {
        comment.voteScore -= existingVote.value;
        if (existingVote.value === 1) comment.upvotes -= 1;
        else comment.downvotes -= 1;
        await existingVote.deleteOne();
      } else {
        comment.voteScore += Number(value) * 2;
        if (Number(value) === 1) { comment.upvotes += 1; comment.downvotes -= 1; }
        else { comment.downvotes += 1; comment.upvotes -= 1; }
        existingVote.value = Number(value);
        await existingVote.save();
      }
    } else {
      await Vote.create({ user: req.user._id, targetId: comment._id, targetType: 'Comment', value: Number(value) });
      comment.voteScore += Number(value);
      if (Number(value) === 1) comment.upvotes += 1;
      else comment.downvotes += 1;
    }

    await comment.save();
    res.json({ success: true, voteScore: comment.voteScore, upvotes: comment.upvotes, downvotes: comment.downvotes });
  } catch (error) {
    next(error);
  }
};

module.exports = { getComments, getReplies, createComment, updateComment, deleteComment, voteComment };
