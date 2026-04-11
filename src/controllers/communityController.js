const Community = require('../models/Community');
const User = require('../models/User');

// GET /api/communities
const getCommunities = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = search ? { $text: { $search: search } } : {};
    const communities = await Community.find(query)
      .sort({ memberCount: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('creator', 'username');
    const total = await Community.countDocuments(query);
    res.json({ success: true, total, page: Number(page), communities });
  } catch (error) {
    next(error);
  }
};

// GET /api/communities/:name
const getCommunity = async (req, res, next) => {
  try {
    const community = await Community.findOne({ name: req.params.name })
      .populate('creator', 'username')
      .populate('moderators', 'username');
    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found' });
    }
    res.json({ success: true, community });
  } catch (error) {
    next(error);
  }
};

// POST /api/communities
const createCommunity = async (req, res, next) => {
  try {
    const { name, description, isPrivate } = req.body;
    const community = await Community.create({
      name,
      description,
      isPrivate,
      creator: req.user._id,
      moderators: [req.user._id],
      members: [req.user._id],
    });
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { communities: community._id } });
    res.status(201).json({ success: true, community });
  } catch (error) {
    next(error);
  }
};

// PUT /api/communities/:name
const updateCommunity = async (req, res, next) => {
  try {
    const community = await Community.findOne({ name: req.params.name });
    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found' });
    }
    const isMod = community.moderators.some((m) => m.equals(req.user._id));
    if (!isMod) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const { description, banner, icon, isPrivate, rules } = req.body;
    if (description !== undefined) community.description = description;
    if (banner !== undefined) community.banner = banner;
    if (icon !== undefined) community.icon = icon;
    if (isPrivate !== undefined) community.isPrivate = isPrivate;
    if (rules !== undefined) community.rules = rules;
    await community.save();
    res.json({ success: true, community });
  } catch (error) {
    next(error);
  }
};

// POST /api/communities/:name/join
const joinCommunity = async (req, res, next) => {
  try {
    const community = await Community.findOne({ name: req.params.name });
    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found' });
    }
    const alreadyMember = community.members.some((m) => m.equals(req.user._id));
    if (alreadyMember) {
      return res.status(400).json({ success: false, message: 'Already a member' });
    }
    community.members.push(req.user._id);
    community.memberCount += 1;
    await community.save();
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { communities: community._id } });
    res.json({ success: true, message: 'Joined community', memberCount: community.memberCount });
  } catch (error) {
    next(error);
  }
};

// POST /api/communities/:name/leave
const leaveCommunity = async (req, res, next) => {
  try {
    const community = await Community.findOne({ name: req.params.name });
    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found' });
    }
    community.members = community.members.filter((m) => !m.equals(req.user._id));
    community.memberCount = Math.max(0, community.memberCount - 1);
    await community.save();
    await User.findByIdAndUpdate(req.user._id, { $pull: { communities: community._id } });
    res.json({ success: true, message: 'Left community', memberCount: community.memberCount });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCommunities, getCommunity, createCommunity, updateCommunity, joinCommunity, leaveCommunity };
