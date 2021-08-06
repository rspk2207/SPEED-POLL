const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const User = require('./models/user');
const session = require('express-session');
const passport = require('passport');
const localStrategy = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');
const mongoose = require('mongoose');
mongoose.connect('mongodb://Localhost:27017/delta3',{ useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });
/*
let db = mongoose.connection;
*/
const app = express();
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
    secret: "Welcome to your workspace",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
/*
app.engine('pug',require('pug').__express);
*/
app.set('views', path.join(__dirname,'views'));
app.set('view engine', 'pug');
app.get('/',(req, res) => {
    res.render('index');
});

app.get('/registration',(req,res) =>{
    res.render('registration');
});
app.get('/login',(req,res) =>{
    res.render('login');
})
app.post('/data',(req,res) =>{
    let password= req.body.password
    User.register(new User({ name: req.body.name,
        username: req.body.username,
        dob: req.body.dob,
        phno: req.body.phno,
        mail: req.body.mail }), password, function (err, user) {
        if (err) {
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(
            req, res, function () {
            res.render("login");
        });
    });
});
app.post('/connection',passport.authenticate("local", {
    successRedirect: "/homepage",
    failureRedirect: "/login"
}), function (req, res) {
});
app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/login");
}
app.get('/homepage',loggedIn,(req,res)=>{
   res.render('homepage');
});
app.listen(3000, () => {
    console.log('started on port 3000');
});