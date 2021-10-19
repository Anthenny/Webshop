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
  })
  .catch((e) => {
    // Hier doorverwijzing geven naar een pagina die zegt dat onze database down is.
    console.log(e.message);
  });
