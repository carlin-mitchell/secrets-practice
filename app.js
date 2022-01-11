require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
// var md5 = require('md5');

const bcrypt = require('bcrypt');
saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS);

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
// const encryptedFields = ['password'];
// userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields:encryptedFields});
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
        const email = req.body.username;
        const userEnteredPassword = req.body.password;
        User.findOne({
            email: email
        }, (err, foundUser) => {
            if (err) {
                console.log(err);
            } else if (foundUser) {
                bcrypt.compare(userEnteredPassword, foundUser.password, (err, result) => {
                    if (err) {
                        console.log('There was a bcrypt error while checking the password')
                    } else if (result) {
                        res.render('secrets');
                    } else {
                        console.log('Password is incorrect.');
                    };
                });
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
        const userEnteredPassword = req.body.password;
        const email = req.body.email;
        bcrypt.hash(userEnteredPassword, saltRounds, (err, generatedHash) => {
            if (err) {
                console.log('There was a bcrypt error.')
            } else {
                const newUser = new User({
                    email: email,
                    password: generatedHash
                });
                newUser.save((err, result) => {
                    if (!err) {
                        console.log('Successfully created the new user.');
                        res.render('secrets');
                    } else {
                        console.log('There was an issue creating the new user.');
                    };
                });
            };

        });

    });

///////////////////////////////////////////////// app.listen /////////////////////////////////////////////////
const port = 3000;
app.listen(port, () => {
    console.log('Server started on port', port);
})