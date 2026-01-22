const express = require('express');
const router = express.Router();
const { getReservations, createReservation, checkIn, checkOut } = require('../controllers/reservation.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.route('/')
    .get(protect, authorize('ADMIN', 'RECEPTION'), getReservations)
    .post(protect, authorize('ADMIN', 'RECEPTION'), createReservation);

router.route('/:id/checkin')
    .patch(protect, authorize('ADMIN', 'RECEPTION'), checkIn);

router.route('/:id/checkout')
    .patch(protect, authorize('ADMIN', 'RECEPTION'), checkOut);

module.exports = router;
