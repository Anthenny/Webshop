const express = require('express');
const cartController = require('../controllers/cartController');
const orderController = require('../controllers/orderController');

const router = express.Router();

router.route('/').post(cartController.postCart);
router.route('/plaats-bestelling').post(orderController.postOrder);

module.exports = router;
