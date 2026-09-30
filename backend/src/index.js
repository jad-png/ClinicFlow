require('dotenv').config();

const express = require('express');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`ClinicFlow backend listening on port ${port}`);
});
