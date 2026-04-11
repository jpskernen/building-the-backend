const express = require('express');
const {
  getCommunities,
  getCommunity,
  createCommunity,
  updateCommunity,
  joinCommunity,
  leaveCommunity,
} = require('../controllers/communityController');
const { getPosts, createPost } = require('../controllers/postController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', getCommunities);
router.post('/', protect, createCommunity);
router.get('/:name', getCommunity);
router.put('/:name', protect, updateCommunity);
router.post('/:name/join', protect, joinCommunity);
router.post('/:name/leave', protect, leaveCommunity);
router.get('/:name/posts', getPosts);
router.post('/:name/posts', protect, createPost);

module.exports = router;
