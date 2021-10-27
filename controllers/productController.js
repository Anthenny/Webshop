const Product = require('../models/productenModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getAllProducts = catchAsync(async (req, res, next) => {
  // 1) Filteren
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach((el) => delete queryObj[el]);

  let query = Product.find(queryObj);

  // 2) Sorteren
  if (req.query.sort) {
    query = query.sort(req.query.sort);
  } else {
    query = query.sort('-gemaaktOp');
  }

  // 3) Limiting
  query = query.select('-__v');

  // 4) Pagination
  // convert string to number
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 30;
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);

  // Exec query
  const products = await query;

  res.status(200).json({
    status: 'succes',
    results: products.length,
    data: {
      products,
    },
  });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Geen product gevonden met dit ID ', 404));
  }

  res.status(200).json({
    status: 'succes',
    data: {
      product,
    },
  });
});

exports.createProduct = catchAsync(async (req, res, next) => {
  const newProduct = await Product.create({
    naam: req.body.naam,
    kleur: req.body.kleur,
    categorie: req.body.categorie,
    prijs: req.body.prijs,
    aantal: req.body.aantal,
    maat: req.body.maat,
    afbeelding: req.body.afbeelding,
    beschrijving: req.body.beschrijving,
    gebruikerId: req.gebruiker,
  });

  res.status(201).json({
    status: 'succes',
    data: {
      newProduct,
    },
  });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    return next(new AppError('Geen product gevonden met dit ID ', 404));
  }

  res.status(201).json({
    status: 'succes',
    data: {
      product,
    },
  });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return next(new AppError('Geen product gevonden met dit ID ', 404));
  }

  res.status(204).json({
    status: 'succesfully deleted',
  });
});
