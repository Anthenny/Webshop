const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  naam: {
    type: String,
    required: [
      true,
      'U moet een naam invoeren als u een bestelling wilt plaatsen',
    ],
    lowercare: true,
  },
  email: {
    type: String,
    required: [
      true,
      'U moet een email invoeren als u een bestelling wilt plaatsen',
    ],
    lowercase: true,
  },
  adress: {
    type: String,
    required: [
      true,
      'U moet een adress invoeren als u een bestelling wilt plaatsen',
    ],
  },
  plaats: {
    type: String,
    required: [
      true,
      'U moet een plaats invoeren als u een bestelling wilt plaatsen',
    ],
  },
  cart: {
    type: Object,
  },
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
