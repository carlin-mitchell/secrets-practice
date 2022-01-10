require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

////////////////////////////////////////////////// mongoose //////////////////////////////////////////////////
const dbHost = 'localhost:27017/';
const dbName = 'secretsDB';
mongoose.connect('mongodb://' + dbHost + dbName);

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

////////////// add encryption to userSchema //////////////
const secret = 'bumperisthecutestdoggointheworld!';
const encryptedFields = ['password'];
userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields:encryptedFields});
/////////////////////////////////////////////////////////
const User = mongoose.model('User', userSchema);

/////////////////////////////////////////////// app.route('/') ///////////////////////////////////////////////
app.route('/')
    .get((req, res) => {
        res.render('home');
    });


///////////////////////////////////////////// app.route('/login') ////////////////////////////////////////////
app.route('/login')
    .get((req, res) => {
        res.render('login');
    })
    .post((req, res) => {
        const userName = req.body.username;
        const password = req.body.password;
        User.findOne({email: userName}, (err, foundUser) => {
            if (err) {
                console.log(err);
            } else if (foundUser) {
                if (foundUser.password === password) {
                    res.render('secrets');
                } else {
                    console.log('Password is incorrect.')
                };
            } else {
                console.log(userName + ' is an invalid email address.');
            };
        });
    });


/////////////////////////////////////////// app.route('/register') ///////////////////////////////////////////
app.route('/register')
    .get((req, res) => {
        res.render('register');
    })
    .post((req, res) => {
        const userName = req.body.username;
        const password = req.body.password;
        const newUser = new User({
            email: userName,
            password: password
        });
        newUser.save((err, result) => {
            if (!err) {
                console.log('Successfully created the new user.');
                res.render('secrets');
            } else {
                console.log('There was an issue creating the new user.');
            };
        })
    });

///////////////////////////////////////////////// app.listen /////////////////////////////////////////////////
const port = 3000;
app.listen(port, () => {
    console.log('Server started on port', port);
})