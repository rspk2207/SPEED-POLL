const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const schema = mongoose.Schema;
const userSchema = new schema({
    name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    dob:{
        type:Date,
        required: true
    },
    phno: {
        type: Number,
        required: true,
        unique: true
    },
    mail: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
},{ collection: 'user'});
userSchema.plugin(passportLocalMongoose);
const user = mongoose.model('user',userSchema,'user');

module.exports = user;