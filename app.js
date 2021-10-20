const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const app = express();

const productRoutes = require('./routes/productRoutes');
const gebruikersRoutes = require('./routes/gebruikerRoute');

// Voorkom ddos aanvallen
const limiter = rateLimit({
  max: 200,
  windowMs: 60 * 60 * 1000,
  message:
    'Te veel requests van dit specifieke IP, probeer het opnieuw in een uur.',
});
app.use(limiter);

// Gebruik security in HTTP headers
app.use(helmet());

// Zet een limit aan hoeveel kb je met een request binnen wilt krijgen
app.use(express.json({ limit: '20kb' }));

// Data sanitazation tegen noSQL query injection
app.use(mongoSanitize());

// Data sanitazation tegen xss
app.use(xss());

// Voorkom param rotzooi
app.use(
  hpp({
    whitelist: ['prijs', 'limit', 'page'],
  })
);

// Routes
app.use('/producten', productRoutes);
app.use('/gebruikers', gebruikersRoutes);

app.all('*', (req, res, next) => {
  next(new AppError(`Kan ${req.originalUrl} niet vinden op deze site!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
