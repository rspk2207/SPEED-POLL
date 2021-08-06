const express = require('express');
const path = require('path');
const User = require('./models/user');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
mongoose.connect('mongodb://Localhost:27017/delta3',{ useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });
/*
let db = mongoose.connection;
*/

const app = express();

require('./models/passport')(passport);
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(session({
    secret: "Welcome to your workspace",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
/*
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
*/
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
});
app.post('/registration',(req,res) =>{
    let errors = [];
    let rname= req.body.name; 
    let rusername= req.body.username;
    let rdob= req.body.dob;
    let rphno= req.body.phno;
    let rmail= req.body.mail; 
    let rpassword= req.body.password;
    if(!rname || !rusername || !rdob || !rphno || !rmail || !rpassword)
    {
        errors.push({msg: 'please fill in all fields'});
    }
    if(errors.length>0)
    {
        res.render('registration',errors,rname,rusername,rdob,rphno,rmail,rpassword);
    }
    else
    {
        User.findOne({username: rusername})
            .then(user=>{
            if(user)
            res.render('registration',errors,rname,rusername,rdob,rphno,rmail,rpassword);
            else
            {
                const newUser = new User({
                    rname,
                    rusername,
                    rdob,
                    rphno,
                    rmail,
                    rpassword
                });

                bcrypt.genSalt(10,(err,salt)=>{
                    bcrypt.hash(newUser.rpassword, salt, (err,hash)=>{
                        if(err) throw err;

                        newUser.rpassword = hash;
                        newUser.save()
                        .then(user =>
                            {
                                res.redirect('/login');
                            })
                        .catch(err=> console.log(err))
                    })
                })
            }
        })
    }
});
app.post('/login',(req,res,next) =>{
    passport.authenticate("local", {
        successRedirect: '/homepage',
        failureRedirect: '/login'
    })(req,res,next);
});

app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});
function loggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/login");
}
app.get('/homepage',loggedIn,(req,res)=>{
   res.render('homepage',{user: req.user});
});
app.listen(3000, () => {
    console.log('started on port 3000');
});