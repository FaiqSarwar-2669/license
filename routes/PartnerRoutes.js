const express = require('express');
const router = express.Router();
const PartnerController = require('../controllers/partnerController');

// Routes for partner CRUD operations
router.post('/create', PartnerController.create);
router.get('/all', PartnerController.getAll);
router.get('/:id', PartnerController.getById);
router.put('/update/:id', PartnerController.updateById);
router.put('/update-status/:id', PartnerController.updateStatusById);
router.delete('/delete/:id', PartnerController.deleteById);

module.exports = router;

