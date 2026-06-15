const express = require('express');
const router = express.Router();
const {
  getEntries,
  getEntryById,
  createEntry,
  updateEntry,
  deleteEntry,
  getStats,
} = require('../controllers/entryController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/stats', getStats);
router.route('/').get(getEntries).post(createEntry);
router.route('/:id').get(getEntryById).put(updateEntry).delete(deleteEntry);

module.exports = router;
