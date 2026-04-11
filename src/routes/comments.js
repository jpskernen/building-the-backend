const express = require('express');
const { getReplies, updateComment, deleteComment, voteComment } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/:id/replies', getReplies);
router.put('/:id', protect, updateComment);
router.delete('/:id', protect, deleteComment);
router.post('/:id/vote', protect, voteComment);

module.exports = router;
