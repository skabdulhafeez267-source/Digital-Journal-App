const Entry = require('../models/Entry');

// @desc    Get all journal entries for logged-in user (with search, filter, pagination)
// @route   GET /api/entries
// @access  Private
const getEntries = async (req, res, next) => {
  try {
    const { search, mood, favorite, page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const query = { user: req.user._id };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    if (mood) {
      query.mood = mood;
    }

    if (favorite === 'true') {
      query.favorite = true;
    }

    const pageNum = Math.max(parseInt(page), 1);
    const limitNum = Math.max(parseInt(limit), 1);
    const skip = (pageNum - 1) * limitNum;

    const [entries, total] = await Promise.all([
      Entry.find(query).sort(sort).skip(skip).limit(limitNum),
      Entry.countDocuments(query),
    ]);

    res.json({
      entries,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      total,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single journal entry
// @route   GET /api/entries/:id
// @access  Private
const getEntryById = async (req, res, next) => {
  try {
    const entry = await Entry.findById(req.params.id);

    if (!entry) {
      res.status(404);
      throw new Error('Entry not found');
    }

    if (entry.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to access this entry');
    }

    res.json(entry);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new journal entry
// @route   POST /api/entries
// @access  Private
const createEntry = async (req, res, next) => {
  try {
    const { title, content, mood, tags, favorite } = req.body;

    if (!title || !content) {
      res.status(400);
      throw new Error('Title and content are required');
    }

    const entry = await Entry.create({
      user: req.user._id,
      title,
      content,
      mood,
      tags,
      favorite,
    });

    res.status(201).json(entry);
  } catch (error) {
    next(error);
  }
};

// @desc    Update journal entry
// @route   PUT /api/entries/:id
// @access  Private
const updateEntry = async (req, res, next) => {
  try {
    const entry = await Entry.findById(req.params.id);

    if (!entry) {
      res.status(404);
      throw new Error('Entry not found');
    }

    if (entry.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this entry');
    }

    const { title, content, mood, tags, favorite } = req.body;

    entry.title = title ?? entry.title;
    entry.content = content ?? entry.content;
    entry.mood = mood ?? entry.mood;
    entry.tags = tags ?? entry.tags;
    entry.favorite = favorite ?? entry.favorite;

    const updatedEntry = await entry.save();

    res.json(updatedEntry);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete journal entry
// @route   DELETE /api/entries/:id
// @access  Private
const deleteEntry = async (req, res, next) => {
  try {
    const entry = await Entry.findById(req.params.id);

    if (!entry) {
      res.status(404);
      throw new Error('Entry not found');
    }

    if (entry.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete this entry');
    }

    await entry.deleteOne();

    res.json({ message: 'Entry removed', id: req.params.id });
  } catch (error) {
    next(error);
  }
};

// @desc    Get journal stats (mood breakdown, total entries, streak)
// @route   GET /api/entries/stats
// @access  Private
const getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const total = await Entry.countDocuments({ user: userId });

    const moodCounts = await Entry.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$mood', count: { $sum: 1 } } },
    ]);

    const favoriteCount = await Entry.countDocuments({ user: userId, favorite: true });

    res.json({
      total,
      favoriteCount,
      moodBreakdown: moodCounts,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEntries,
  getEntryById,
  createEntry,
  updateEntry,
  deleteEntry,
  getStats,
};
