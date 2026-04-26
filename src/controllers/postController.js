const Post = require('../models/Post');
const Community = require('../models/Community');
const Vote = require('../models/Vote');

// GET /api/posts  or  GET /api/communities/:name/posts
const getPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 25, sort = 'new' } = req.query;
    const query = {};

    if (req.params.name) {
      const community = await Community.findOne({ name: req.params.name });
      if (!community) {
        return res.status(404).json({ success: false, message: 'Community not found' });
      }
      query.community = community._id;
    }

    const sortOption = sort === 'top' ? { voteScore: -1 } : { createdAt: -1 };

    const posts = await Post.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('author', 'username')
      .populate('community', 'name');

    const total = await Post.countDocuments(query);
    res.json({ success: true, total, page: Number(page), posts });
  } catch (error) {
    next(error);
  }
};

// GET /api/posts/:id
const getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username avatar')
      .populate('community', 'name icon');
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    res.json({ success: true, post });
  } catch (error) {
    next(error);
  }
};

// POST /api/communities/:name/posts
const createPost = async (req, res, next) => {
  try {
    const community = await Community.findOne({ name: req.params.name });
    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found' });
    }
    const { title, body, url, type, flair } = req.body;
    const post = await Post.create({
      title,
      body,
      url,
      type,
      flair,
      author: req.user._id,
      community: community._id,
    });
    await post.populate('author', 'username');
    res.status(201).json({ success: true, post });
  } catch (error) {
    next(error);
  }
};

// PUT /api/posts/:id
const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    if (!post.author.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const { body, flair } = req.body;
    post.body = body !== undefined ? body : post.body;
    post.flair = flair !== undefined ? flair : post.flair;
    await post.save();
    res.json({ success: true, post });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/posts/:id
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    if (!post.author.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await post.deleteOne();
    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    next(error);
  }
};

// POST /api/posts/:id/vote
const votePost = async (req, res, next) => {
  try {
    const { value } = req.body;
    if (![1, -1].includes(Number(value))) {
      return res.status(400).json({ success: false, message: 'Vote value must be 1 or -1' });
    }
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const existingVote = await Vote.findOne({ user: req.user._id, targetId: post._id, targetType: 'Post' });

    if (existingVote) {
      if (existingVote.value === Number(value)) {
        // Remove vote
        post.voteScore -= existingVote.value;
        if (existingVote.value === 1) post.upvotes -= 1;
        else post.downvotes -= 1;
        await existingVote.deleteOne();
      } else {
        // Change vote
        post.voteScore += Number(value) * 2;
        if (Number(value) === 1) {
          post.upvotes += 1;
          post.downvotes -= 1;
        } else {
          post.downvotes += 1;
          post.upvotes -= 1;
        }
        existingVote.value = Number(value);
        await existingVote.save();
      }
    } else {
      await Vote.create({ user: req.user._id, targetId: post._id, targetType: 'Post', value: Number(value) });
      post.voteScore += Number(value);
      if (Number(value) === 1) post.upvotes += 1;
      else post.downvotes += 1;
    }

    await post.save();
    res.json({ success: true, voteScore: post.voteScore, upvotes: post.upvotes, downvotes: post.downvotes });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPosts, getPost, createPost, updatePost, deletePost, votePost };
