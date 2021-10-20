const express = require('express');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const app = express();

const productRoutes = require('./routes/productRoutes');
const gebruikersRoutes = require('./routes/gebruikerRoute');

app.use(express.json());

// Routes
app.use('/producten', productRoutes);
app.use('/gebruikers', gebruikersRoutes);

app.all('*', (req, res, next) => {
  next(new AppError(`Kan ${req.originalUrl} niet vinden op deze site!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
