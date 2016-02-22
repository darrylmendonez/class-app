// express setup
var express = require('express');
var app = express();
var PORT = process.env.NODE_ENV || 3000;

// database setup
var Sequelize = require('sequelize');
var connection = new Sequelize('class_app_db', 'root');

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

//passport use methed as callback when being authenticated
passport.use(new passportLocal.Strategy(function(username, password, done) {
    //check password in db
    User.findOne({
        where: {
            username: username
        }
    }).then(function(user) {
        //check password against hash
        if(user){
            bcrypt.compare(password, user.dataValues.password, function(err, user) {
                if (user) {
                  //if password is correct authenticate the user with cookie
                  done(null, { id: username, username: username });
                } else{
                  done(null, null);
                }
            });
        } else {
            done(null, null);
        }
    });

}));

//change the object used to authenticate to a smaller token, and protects the server from attacks
passport.serializeUser(function(user, done) {
    done(null, user.id);
});
passport.deserializeUser(function(id, done) {
    done(null, { id: id, username: id })
});

var bcrypt = require('bcryptjs');
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
  extended: false
}));

var User = connection.define('user', {
  firstname: {
    type: Sequelize.STRING,
    allowNull: false
  },
  lastname: {
    type: Sequelize.STRING,
    allowNull: false
  },
  username: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      len: {
        args: [5,20],
        msg: "Your password must be between 5-20 characters"
      },
    }
  },
  teachOrTA: {
    type: Sequelize.STRING,
    allowNull: false
  }
}, {
  hooks: {
    beforeCreate: function(input){
      input.password = bcrypt.hashSync(input.password, 10);
    }
  }
});

var Student = connection.define('student', {
  firstname: {
    type: Sequelize.STRING,
    allowNull: false
  },
  lastname: {
    type: Sequelize.STRING,
    allowNull: false
  },
  username: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      len: {
        args: [5,20],
        msg: "Your password must be between 5-20 characters"
      },
    }
  },
}, {
  hooks: {
    beforeCreate: function(input){
      input.password = bcrypt.hashSync(input.password, 10);
    }
  }
});

//handlebars setup
var expressHandlebars = require('express-handlebars');
app.engine('handlebars', expressHandlebars({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

//check login with db
app.post('/check', passport.authenticate('local', {
  successRedirect: '/home',
  failureRedirect: '/?msg=Login Credentials do not work'
}));

app.get("/", function(req, res){
  res.render('index', {msg: req.query.msg});
});

app.get("/teacher-registration", function(req, res){
  res.render('teacher-registration');
});

app.get("/student-registration", function(req, res){
  res.render('student-registration');
});

app.get("/teacher-login", function(req, res){
  res.render('teacher-login');
});

app.get("/student-login", function(req, res){
  res.render('student-login');
});

app.get('/home', function(req, res){
  res.render('home', {
    user: req.user,
    student: req.student,
    isAuthenticated: req.isAuthenticated()
  });
});

app.post("/saveForTeacher", function(req, res){
  User.create(req.body).then(function(result){
    res.redirect('/?msg=Account created. You may log in.');
  }).catch(function(err) {
    console.log(err);
    res.redirect('/?msg=' + err.message);
  });
});

app.post("/saveForStudent", function(req, res){
  Student.create(req.body).then(function(result){
    res.redirect('/?msg=Account created. You may log in.');
  }).catch(function(err) {
    console.log(err);
    res.redirect('/?msg=' + err.message);
  });
});

// database connection via sequelize
connection.sync().then(function() {
  app.listen(PORT, function() {
      console.log("Listening on:" + PORT)
  });
});
