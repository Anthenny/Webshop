const mongoose = require('mongoose');
const dotenv = require('dotenv');

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
  });

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('Onbehandelde rejection! Shutting down.. ');
  process.exit(1);
});
