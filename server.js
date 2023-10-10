const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');

require('dotenv').config();
const bodyParser = require('body-parser');
const apiRoute = require('./routes/index');

app.use(morgan('dev'));
app.use(bodyParser.json());
const port = process.env.PORT;

app.use(cors({ origin: true, credentials: true }));

app.get('/', function (req, res) {
  res.send('Hello chippyCode');
});

app.use(apiRoute);

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
