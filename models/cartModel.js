const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  items: Array,
  totalQuantity: {
    type: Number,
    default: 0,
  },
  totalAmount: {
    type: Number,
    default: 0,
  },
});

const Cart = mongoose.model('cart', cartSchema);

module.exports = Cart;
