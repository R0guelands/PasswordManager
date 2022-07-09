require('dotenv').config() // dotenv to store local environment variables such as my mongoDB connection

// Importing the necessary modules
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const CryptoJS = require('crypto-js');

// Configuring the app
app.use(express.static(__dirname + '/public/'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(session({
    secret: process.env.SECRET,	
    resave: false,				
    saveUninitialized: false		
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.MONGODB_URI); // Connecting to the database

// Creating the schema for the login and registration used by passport 
const userSchema = new mongoose.Schema({
    username: String,
    password: String
});
userSchema.plugin(passportLocalMongoose);
const User = new mongoose.model('User', userSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

var user = new User({
    username: 'default',
    password: 'default'
});

// Schema for passwords
const passwordSchema = new mongoose.Schema({
    username: String,
    login: String,
    date_of_creation: String,
    name: String,
    password: String
});

const Password = new mongoose.model('Password', passwordSchema);

function encrypt(key, text) {
    return CryptoJS.AES.encrypt(text, key).toString();
 }
 
 // Decrypting text
 function decrypt(key, criptedText) {
    const bytes  = CryptoJS.AES.decrypt(criptedText, key);
    return bytes.toString(CryptoJS.enc.Utf8);
 }

// app routes
app.get('/', (req, res) => {
    res.render('home');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/passwords', (req, res) => {
    if (req.isAuthenticated()) {
        Password.find({"username": user.username}, (err, entries) => {
            if (err) {
                console.log(err);
                res.redirect('/');
            } else {
                for (let i = 0; i < entries.length; i++) {
                    entries[i].password = decrypt(user.password, entries[i].password);
                }
                res.render('passwords', 
                    {
                        entries: entries
                    }
                );
            }
        })
    } else {
        res.redirect('/login');
    }

});

app.get('/submit', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('submit');
    } else {
        res.redirect('/login');
    }
});

app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.log(err);
        }  
        res.redirect('/');
    });
});

app.get('/delete/:id', (req, res) => {
    if (req.isAuthenticated()) {
        Password.findByIdAndDelete(req.params.id, (err) => {
            if (err) {
                console.log(err);
                res.redirect('/');
            } else {
                res.redirect('/passwords');
            }     
        });
    } else {
        res.redirect('/login');
    }
});

app.get('/edit/:id', (req, res) => {
    if (req.isAuthenticated()) {
        Password.findById(req.params.id, (err, entry) => {
            if (err) {
                console.log(err);
                res.redirect('/');
            }
            entry.password = decrypt(user.password, entry.password);
            res.render('edit', {
                entry: entry
            });
        });
    } else {
        res.redirect('/login');
    }
});

app.post('/edit/:id', (req, res) => {
    if (req.isAuthenticated()) {
        Password.findByIdAndUpdate(req.params.id, {
            $set: { 
                name: req.body.name,
                login: req.body.login,
                password: encrypt(user.password, req.body.password)
            }
        }, (err) => {
            if (err) {
                console.log(err);
                res.redirect('/');
            } else {
                res.redirect('/passwords');
            }
        }
        );
    } else {
        res.redirect('/login');
    }
});

app.post('/login', (req, res) => {

    user.username = req.body.username;
    user.password = req.body.password;

    req.login(user, (err) => {
        if (err) {
            console.log(err);
            res.redirect('/login');
        } else {
            passport.authenticate('local', { successRedirect: '/passwords', failureRedirect: '/login' })(req, res);
        }
    }
    );

});

app.post('/register', (req, res) => {

    user.username = req.body.username;
    user.password = req.body.password;

    User.register({ username: req.body.username}, req.body.password, (err, user) => {
        if (err) {
            console.log(err);
            res.redirect('/register');
        } else {
            passport.authenticate('local', { successRedirect: '/passwords', failureRedirect: '/register' })(req, res);
        }
    });

});

app.post('/submit', (req, res) => {

    if (req.isAuthenticated()) {
        const newPassword = new Password({
            username: user.username,
            login: req.body.login,
            date_of_creation: new Date(),
            name: req.body.name,
            password: encrypt(user.password, req.body.password)
        });
        newPassword.save();
        res.redirect('/passwords');
    } else {
        res.redirect('/login');
    }

});

// app.listen OBS: CHANGE THIS TO YOUR PORT AND IP FOR THE SERVER
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
