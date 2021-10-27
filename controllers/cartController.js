const Cart = require('../models/cartModel');
const catchAsync = require('../utils/catchAsync');

exports.postCart = catchAsync(async (req, res, next) => {
  const newCart = await Cart.create({
    items: req.body.items,
    totalQuantity: req.body.totalQuantity,
    totalAmount: req.body.totalAmount,
  });

  res.status(201).json({
    status: 'succes',
    data: {
      newCart,
    },
  });
});
