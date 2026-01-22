const express = require('express');
const router = express.Router();
const { getTasks, updateTaskStatus } = require('../controllers/housekeeping.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.route('/')
    .get(protect, authorize('ADMIN', 'CLEANER'), getTasks);

router.route('/:roomId/status')
    .patch(protect, authorize('ADMIN', 'CLEANER'), updateTaskStatus);

module.exports = router;
