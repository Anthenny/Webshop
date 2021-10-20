const Product = require('../models/productenModel');
const catchAsync = require('../utils/catchAsync');

exports.postWinkelmand = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.body.productId);
});
