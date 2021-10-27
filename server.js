const mongoose = require('mongoose');
const dotenv = require('dotenv');

// callback functie die alle uncaught exeptions regelt. Dit moet bovenaan staan omdat er anders een ue doorheen kan slippen.
process.on('uncaughtException', (err) => {
  console.log('Uncaught exeption!');
  console.log(err.name, err.message, err.stack);
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');

const port = process.env.PORT;
const DB = process.env.DATABASE;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connection succesful');
    app.listen(port, () => {
      console.log(`App running on ${port}`);
    });
  })
  .catch((err) => {
    // Hier moet een foutmelding komen dat de database even niet functioneert naar behoren via react
    console.log(
      'Verbinding met de database is niet gelukt, probeer het later opnieuw'
    );
    console.log(err.name, err.message, err.stack);
  });

process.on('unhandledRejection', (err) => {
  console.log('Onbehandelde rejection! Shutting down.. ');
  console.log(err.name, err.message, err.stack);
});
