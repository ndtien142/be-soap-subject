require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const { default: helmet } = require('helmet');
const compression = require('compression');

const app = express();

const corsOptions = { origin: `http://localhost:8080/` };
app.use(cors(corsOptions));

app.use(bodyParser.json());

app.use(morgan('dev'));
// morgan("combined");
// morgan("tiny");
// morgan("short");
// morgan("common");
app.use(helmet());
app.use(compression());

// init middlewares

// init db
require('./dbs/init.mongodb');
require('./dbs/init.mysql');
// const { countConnect } = require("./helpers/check.connect");
// countConnect();

// init routes
app.use('/', require('./routes'));
// handling error

module.exports = app;
