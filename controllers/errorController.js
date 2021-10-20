const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Onjuiste ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicaat voor veld ${value}. Gebruik aub een andere waarde`;

  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Ongeldige Token, Log opnieuw in', 401);

const handleJWTExpiredError = () =>
  new AppError('Uw token is niet meer geldig, lop opnieuw in!', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, vertrouwelijke error waar we op gerekend hebben dus terug kunnen sturen naar de client.
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programmeer fout of iets anders waar we niet op gerekend hebben niet de details leaken naar de client.
  } else {
    console.error('ERROR', err);
    res.status(500).json({
      status: 'error',
      message: 'Er ging iets fout, probeer het opnieuw',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    if (err.name === 'ValidationError') err = handleValidationErrorDB(err);
    if (err.name === 'CastError') err = handleCastErrorDB(err);
    if (err.code === 11000) err = handleDuplicateFieldsDB(err);
    if (err.name === 'JsonWebTokenError') err = handleJWTError();
    if (err.name === 'TokenExpiredError') err = handleJWTExpiredError();
    sendErrorProd(err, res);
  }
};
