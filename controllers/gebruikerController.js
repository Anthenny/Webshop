const Gebruiker = require('../models/gebruikerModel');
const catchAsync = require('../utils/catchAsync');

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
