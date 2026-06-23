const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  answerText: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  upvotes: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], default: [] },
  downvotes: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], default: [] },
  voteCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Answer', answerSchema);
