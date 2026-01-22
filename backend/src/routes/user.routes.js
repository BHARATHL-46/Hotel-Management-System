const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, deleteUser } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.route('/')
    .get(protect, authorize('ADMIN', 'RECEPTION'), getUsers)
    .post(protect, authorize('ADMIN'), createUser);

router.route('/:id')
    .put(protect, authorize('ADMIN'), updateUser)
    .delete(protect, authorize('ADMIN'), deleteUser);

module.exports = router;
