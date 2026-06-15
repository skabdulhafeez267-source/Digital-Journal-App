const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 150,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    mood: {
      type: String,
      enum: ['happy', 'sad', 'neutral', 'excited', 'angry', 'anxious', 'grateful'],
      default: 'neutral',
    },
    tags: {
      type: [String],
      default: [],
    },
    favorite: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for faster search on title and content
entrySchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Entry', entrySchema);
