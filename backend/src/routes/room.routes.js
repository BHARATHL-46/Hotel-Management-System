const express = require('express');
const router = express.Router();
const { getRooms, createRoom, updateRoom } = require('../controllers/room.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.route('/')
    .get(protect, authorize('ADMIN', 'RECEPTION', 'CLEANER'), getRooms)
    .post(protect, authorize('ADMIN'), createRoom);

router.route('/:id')
    .put(protect, authorize('ADMIN', 'RECEPTION', 'CLEANER'), updateRoom);

module.exports = router;
