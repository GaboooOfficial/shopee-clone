const express = require('express');
const router = express.Router();
const adminController = require('./controller');
const { protect } = require('../../middleware/auth');
const roleCheck = require('../../middleware/roleCheck');

router.use(protect, roleCheck(['admin']));

router.get('/stores/pending', adminController.getPendingStores);
router.get('/stores', adminController.getAllStores);
router.patch('/stores/:id/approve', adminController.approveStore);
router.patch('/stores/:id/reject', adminController.rejectStore);
router.patch('/stores/:id/toggle-active', adminController.toggleStoreActive);

router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/toggle-active', adminController.toggleUserActive);

module.exports = router;
