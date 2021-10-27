const Order = require('../models/orderModel');
const catchAsync = require('../utils/catchAsync');

exports.postOrder = catchAsync(async (req, res, next) => {
  const newOrder = await Order.create({
    naam: req.body.naam,
    email: req.body.email,
    adress: req.body.adress,
    plaats: req.body.plaats,
    cart: req.body.cart,
  });

  res.status(201).json({
    status: 'succes',
    data: {
      newOrder,
    },
  });
});
