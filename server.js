// express setup
var express = require('express');
var app = express();
var PORT = process.env.NODE_ENV || 3000;

// database setup
var Sequelize = require('sequelize');
var connection = new Sequelize('secret_clubhouse_db', 'root');

//requiring passport last
var passport = require('passport');
var passportLocal = require('passport-local');
//middleware init
app.use(require('express-session')({
    secret: 'crackalackin',
    resave: true,
    saveUninitialized: true,
    cookie : { secure : false, maxAge : (4 * 60 * 60 * 1000) }, // 4 hours
}));
app.use(passport.initialize());
app.use(passport.session());
