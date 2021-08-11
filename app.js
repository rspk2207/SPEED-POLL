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
    resave: true,
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
app.post('/registration',async (req,res) =>{
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
        await User.findOne({username: rusername})
            .then( async (user)=>{
            if(user)
            res.render('registration',errors,rname,rusername,rdob,rphno,rmail,rpassword);
            else
            {
                let newUser = new User({
                    name: rname,
                    username: rusername,
                    dob: rdob,
                    phno: rphno,
                    mail: rmail,
                    password: rpassword,
                    teams: 0,
                    invcount: 0
                });

                await bcrypt.genSalt(10, async (err,salt)=>{
                    bcrypt.hash(newUser.password, salt, async (err, hash) => {
                        if (err){
                        console.log(newUser.password);
                        console.log(salt);
                        console.log(err);
                        }
                        else{
                        newUser.password = hash;
                        await newUser.save()
                            .then(async (user) => {
                                res.redirect('/login');
                            })
                            .catch(err => console.log(err));
                    }})
                })
            }
        })
        .catch(err=>console.log(err));
    }
});
app.post('/login', async (req,res,next) =>{
    await passport.authenticate("local", {
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
app.get('/homepage/teamcr',loggedIn,(req,res)=>{
    res.render('teamcr',{user: req.user});
});
app.post('/homepage/teamcr',loggedIn, async (req,res,next)=>{
    let count = req.user.teams;
    count++;
await User.findById(req.user.id,(err,user)=>{
    if(err)
    {
        console.log(err);
    }
    else
    {
        user.teamnames[count-1] = req.body.teamname;
        (user.teams)++;
        user.votes[count-1] = 0;
        user.isAdmin[count-1] = true;
        user.markModified('teamnames');
        user.markModified('votes');
        user.markModified('isAdmin');
        user.save();
        req.user = user.toObject();
    }
    });


    res.redirect('/homepage');
});
app.get('/homepage/teams',loggedIn,(req,res)=>{
    res.render('teams',{user: req.user});
});
app.get('/homepage/teams/:k',loggedIn,(req,res)=>
{   
    let pagename = (req.params.k).toUpperCase();
    let index = req.params.k;
    for(let i=0;i<req.user.teamnames.length;i++)
    {
    if(index === (req.user.teamnames[i]).toUpperCase())
    {
        index = i;
        break;
    }
    }
    res.render('teampage',{user: req.user, index: index,page: pagename})
});
app.post('/homepage/teams/:k/invites',loggedIn,async (req,res)=>{
    let index = req.params.k;
    console.log(index);
    console.log(req.body.inv);
    await User.findOne({username: req.body.inv},(err,doc)=>{
        if(err)
        {
            console.log(err);
        }
        else
        {
            if(!doc)
            {
                console.log("Invalid user");
                res.redirect('/homepage/teams/'+index);
            }
            else
            {
               doc.invites[doc.invcount] = index;
               (doc.invcount)++;
               doc.markModified('invites');
               doc.save(); 
            }
        }
    });
    res.redirect('/homepage/teams/'+index);
});
app.get('/homepage/accepted/:i',loggedIn, async (req,res)=>{
    let count = parseInt(req.params.i);
    await User.findOne({username: req.user.username},(err,user)=>{
        if(err)
        {
            console.log(err);
        }
        else
        {
            if(!user)
            {
                conole.log('no user');
                res.redirect('/homepage');
            }    
            else
            {
                let invname = user.invites[count-1];
                user.teamnames[user.teams] = user.invites[count-1];
                user.invites.pull(invname);
                (user.invcount)--;
                user.votes[user.teams] = 0;
                user.isAdmin[user.teams] = false;
                (user.teams)++; 
                user.markModified('teamnames');
                user.markModified('invites');
                user.save();
                console.log(user);
                req.user = user.toObject();
                console.log(req.user);
                res.redirect('/homepage');
            }
        }
    });
});
app.get('/homepage/rejected/:i',loggedIn,async (req,res)=>{
    let count = parseInt(req.params.i);
    await User.findOne({username: req.user.username},(err,user)=>{
        if(err)
        {
            console.log(err);
        }
        else
        {
            if(!user)
            {
                conole.log('no user');
                res.redirect('/homepage');
            }    
            else
            {
                let invname = user.invites[count-1];
                user.invites.pull(invname);
                (user.invcount)--;
                user.markModified('invites');
                user.save();
                console.log(user);
                req.user = user.toObject();
                console.log(req.user);
                res.redirect('/homepage');
            }
        }
    });
});
app.get('/homepage/teams/:k/pollcr',(req,res)=>{
    res.render('pollcr',{user: req.user,page: req.params.k});
})
app.get('/homepage/about',loggedIn,(req,res)=>{
    res.render('about',{user: req.user});
});
app.listen(3000, () => {
    console.log('started on port 3000');
});