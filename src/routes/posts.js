const express = require('express');
const { getPosts, getPost, updatePost, deletePost, votePost } = require('../controllers/postController');
const { getComments, createComment } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', getPosts);
router.get('/:id', getPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/vote', protect, votePost);
router.get('/:id/comments', getComments);
router.post('/:id/comments', protect, createComment);

module.exports = router;
