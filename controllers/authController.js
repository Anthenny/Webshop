const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const Gebruiker = require('../models/gebruikerModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/email');

const createSendToken = (gebruiker, statusCode, res) => {
  const token = jwt.sign({ id: gebruiker._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  gebruiker.wachtwoord = undefined;

  res.status(statusCode).json({
    status: 'succes',
    token,
    gebruiker,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newGebruiker = await Gebruiker.create({
    naam: req.body.naam,
    email: req.body.email,
    adres: req.body.adres,
    plaats: req.body.plaats,
    wachtwoord: req.body.wachtwoord,
    bevestigWachtwoord: req.body.bevestigWachtwoord,
  });

  createSendToken(newGebruiker, 201, res);
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
  createSendToken(gebruiker, 200, res);
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
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
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
  await gebruiker.save({ validateBeforeSave: false });

  // Stuur het naar de email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/gebruikers/resetWachtwoord/${resetToken}`;

  const message = `Wachtwoord vergeten? Submit een patch request met jouw nieuwe wachtwoord en bevestigde wachtwoord op : ${resetURL}.\nAls je niet jouw wachtwoord bent vergeten, negeer dan deze email`;

  try {
    await sendEmail({
      email: gebruiker.email,
      subject: 'Jouw wachtwoord reset token.(geldig voor 10 minuten)',
      message,
    });

    res.status(200).json({
      status: 'succes',
      message: 'Token naar uw email gestuurd',
    });
  } catch (err) {
    gebruiker.wachtwoordResetToken = undefined;
    gebruiker.wachtwoordResetExpires = undefined;
    await gebruiker.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'Er was een error terwijl we uw email probeerden te versturen. Probeer het later opnieuw!',
        500
      )
    );
  }
});

exports.resetWachtwoord = catchAsync(async (req, res, next) => {
  // pak de user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const gebruiker = await Gebruiker.findOne({
    wachtwoordResetToken: hashedToken,
    wachtwoordResetExpires: { $gt: Date.now() },
  });

  // als token niet expired is en er is een user maak een nieuw wachtwoord aan\
  if (!gebruiker)
    next(new AppError('De token is niet geldig of de token is verlopen', 400));

  if (req.body.wachtwoord !== req.body.bevestigWachtwoord)
    return next(
      new AppError(
        'Uw wachtwoord moet overeenkomen met het bevestigde wachtwoord',
        400
      )
    );

  gebruiker.wachtwoord = req.body.wachtwoord;
  gebruiker.bevestigWachtwoord = req.body.bevestigWachtwoord;
  gebruiker.wachtwoordResetToken = undefined;
  gebruiker.wachtwoordResetExpires = undefined;
  gebruiker.save();
  // Log de user in en stuur JWT

  createSendToken(gebruiker, 201, res);
});

exports.updateWachtwoord = catchAsync(async (req, res, next) => {
  // Pak de gebruiker uit de database
  const gebruiker = await Gebruiker.findById(req.gebruiker.id).select(
    '+wachtwoord'
  );

  // Check of het ingevulde wachtwoord matchd met het huidige wachtwoord
  if (
    !(await gebruiker.correctWachtwoord(
      req.body.huidigWachtwoord,
      gebruiker.wachtwoord
    ))
  )
    next(new AppError('Je huidige wachtwoord is fout', 401));

  // Als dit zo is update het wachtwoord
  gebruiker.wachtwoord = req.body.wachtwoord;
  gebruiker.bevestigWachtwoord = req.body.bevestigWachtwoord;
  await gebruiker.save();

  // Log de user in en stuur jwt
  const token = jwt.sign({ id: gebruiker._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  createSendToken(gebruiker, 200, res);
});
