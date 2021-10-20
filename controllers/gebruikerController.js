const Gebruiker = require('../models/gebruikerModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

exports.getAllGebruikers = catchAsync(async (req, res, next) => {
  const gebruikers = await Gebruiker.find();

  res.status(200).json({
    status: 'succes',
    results: gebruikers.length,
    data: {
      gebruikers,
    },
  });
});

exports.updateMij = catchAsync(async (req, res, next) => {
  // Maak error als gebruiker wachtwoord probeert te update
  if (req.body.wachtwoord || req.body.bevestigWachtwoord)
    return next(
      new AppError(
        'Dit gedeelte is er niet voor om jouw wachtwoord te veranderen! Ga aub naar updateMijnWachtwoord'
      )
    );

  // Filter de body zodat je alleen de velden kan updaten die toegestaan zijn
  const filteredBody = filterObj(req.body, 'naam', 'email', 'adres', 'plaats');

  // Update gebruiker doc
  const updatedGebruiker = await Gebruiker.findByIdAndUpdate(
    req.gebruiker.id,
    filteredBody,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'succes',
    data: {
      gebruiker: updatedGebruiker,
    },
  });
});

exports.deleteMij = catchAsync(async (req, res, next) => {
  await Gebruiker.findByIdAndUpdate(req.gebruiker.id, { actief: false });

  res.status(204).json({
    status: 'succes',
    data: null,
  });
});
