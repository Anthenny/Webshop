const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const Gebruiker = require('../models/gebruikerModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.signup = catchAsync(async (req, res, next) => {
  const newGebruiker = await Gebruiker.create({
    naam: req.body.naam,
    email: req.body.email,
    adres: req.body.adres,
    plaats: req.body.plaats,
    wachtwoord: req.body.wachtwoord,
    bevestigWachtwoord: req.body.bevestigWachtwoord,
  });

  const token = jwt.sign({ id: newGebruiker._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(201).json({
    status: 'succes',
    token,
    data: {
      gebruiker: newGebruiker,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, wachtwoord } = req.body;

  // check of email en wachtwoord bestaan
  if (!email || !wachtwoord) {
    return next(new AppError('Vul aub een email en wachtwoord in', 400));
  }

  // check of gebruiker bestaar en wachtwoord matched
  const gebruiker = await Gebruiker.findOne({ email }).select('+wachtwoord');

  if (
    !gebruiker ||
    !(await gebruiker.correctWachtwoord(wachtwoord, gebruiker.wachtwoord))
  )
    return next(new AppError('Onjuiste email of wachtwoord', 401));

  // alles alles is gelukt stuur token terug naar client
  const token = jwt.sign({ id: gebruiker._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(200).json({
    status: 'succes',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // Pak de token en check of het er is.
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token)
    return next(
      new AppError(
        'Je bent niet ingelogd!, Log in om toegang te krijgen tot deze pagina',
        401
      )
    );

  // Check of de token valid is.
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Check of de gebruiker nog steeds bestaat
  const currentGebruiker = await Gebruiker.findById(decoded.id);
  console.log(decoded.id);
  if (!currentGebruiker)
    return next(
      new AppError('De gebruiker met deze token bestaat niet meer', 401)
    );

  req.gebruiker = currentGebruiker;
  console.log(req);
  console.log(req.gebruiker);

  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    console.log(req.gebruiker);
    // roles ['admin', 'gebruiker']
    if (!roles.includes(req.gebruiker.rol))
      return next(new AppError('Je hebt geen toegang', 403));

    next();
  };
};

exports.forgotWachtwoord = catchAsync(async (req, res, next) => {
  // Link de ingevoegde email aan een gebruiker
  const gebruiker = await Gebruiker.findOne({ email: req.body.email });
  if (!gebruiker) {
    return next(
      new AppError('Kon geen gebruiker vinden met dit email adress', 404)
    );
  }

  // Maak een random reset token
  const resetToken = gebruiker.createPasswordResetToken();
  await gebruiker.save();

  // Stuur het naar de email
});

exports.resetWachtwoord = (req, res, next) => {};
