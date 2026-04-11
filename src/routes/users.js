const express = require('express');
const { getUser, getUserPosts, getUserComments, updateMe } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.put('/me', protect, updateMe);
router.get('/:username', getUser);
router.get('/:username/posts', getUserPosts);
router.get('/:username/comments', getUserComments);

module.exports = router;
