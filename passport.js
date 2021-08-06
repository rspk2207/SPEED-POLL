const localStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./user');

module.exports = function(passport)
{
    passport.use(new localStrategy({usernameField: 'username'},(lusername,lpassword,done)=>{
        User.findOne({username: rusername})
        .then(user =>{
            if(!user)
            return done(null, false,{message: 'username not registered'});

            bcrypt.compare(lpassword,user.rpassword,(err, match) =>{
                if(err) throw err;

                if(match)
                {
                    return done(null, user);
                }
                else
                {
                    return done(null, false, {message:'incorrect password'});
                }
            });
        })
        .catch(err=>console.log(err));
    }));
    
    passport.serializeUser((user,done)=>{
        done(null, user,id);
    });

    passport.deserializeUser((id,done)=>{
        User.findById(id,(err,user)=>{
            done(err,user);
        });
    });
}