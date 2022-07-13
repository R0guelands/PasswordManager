require('dotenv').config() // dotenv to store local environment variables such as my mongoDB connection

// Importing the necessary modules
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const sessions = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const CryptoJS = require('crypto-js');

// Configuring the app
app.use(express.static(__dirname + '/public/'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
var chars = "abcdefghijklmnopqrstuvwxyz!@#$%^&*()-+<>ABCDEFGHIJKLMNOP1234567890";
var pass = "";
for (var x = 0; x < 20; x++) {
    var i = Math.floor(Math.random() * chars.length);
    pass += chars.charAt(i);
}
app.use(sessions({
    secret: pass,
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

function encrypt(password, key) {

    let ciphertext = CryptoJS.AES.encrypt(password, key);
    return ciphertext.toString();

}

// Schema for passwords
const passwordSchema = new mongoose.Schema({
    username: String,
    date_of_creation: String,
    name: String,
    login: String,
    password: String
});

const Password = new mongoose.model('Password', passwordSchema);

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
        Password.find({ "username": req.session.passport.user }, (err, entries) => {
            if (err) {
                console.log(err);
                res.redirect('/');
            } else {
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
            res.render('edit', {
                entry: entry
            });
        });
    } else {
        res.redirect('/login');
    }
});

app.get('/options', (req, res) => {
    if (req.isAuthenticated()) {
        User.find({ "username": req.session.passport.user }, (err, entries) => {    
            if (err) {
                console.log(err);
                res.redirect('/');
            } else {
                res.render('options',
                    { 
                        entry: entries[0]
                    }
                );
            }
        });
    } else {
        res.redirect('/login');
    }
});

app.get('/options/confirm', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('confirm');
    } else {
        res.redirect('/login');
    }
});

app.get('/options/delete', (req, res) => {

    if (req.isAuthenticated()) {
        Password.deleteMany({ "username": req.session.passport.user }, (err) => {
            if (err) {
                console.log(err);
                res.redirect('/');
            } else {
                User.deleteOne({ "username": req.session.passport.user }, (err) => {
                    if (err) {
                        console.log(err);
                        res.redirect('/');
                    } else {
                        res.redirect('/logout');
                    }
                });
            }
        });
    } else {
        res.redirect('/login');
    }

});

app.post('/edit/:id', (req, res) => {
    if (req.isAuthenticated()) {
        Password.updateOne({"_id": req.params.id, "username": req.session.passport.user}, {
            $set: {
                name: encrypt(req.body.name, req.body.userPass),
                login: encrypt(req.body.login, req.body.userPass),
                password: encrypt(req.body.password, req.body.userPass)
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

    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, (err) => {
        if (err) {
            console.log(err);
            res.redirect('/login');
        } else {
            passport.authenticate('local', { failureRedirect: '/login' })(req, res, () => {
                res.redirect('/passwords');
            });
        }
    }
    );

});

app.post('/register', (req, res) => {

    User.register({ username: req.body.username }, req.body.password, (err, user) => {
        if (err) {
            console.log(err);
            res.redirect('/register');
        } else {
            passport.authenticate('local', { failureRedirect: '/register' })(req, res, () => {
                res.redirect('/passwords');
            });
        }
    });

});

app.post('/submit', (req, res) => {
    if (req.isAuthenticated()) {
        const newPassword = new Password({
            username: req.session.passport.user,
            login: encrypt(req.body.login, req.body.userPass),
            date_of_creation: req.body.date,
            name: encrypt(req.body.name, req.body.userPass),
            password: encrypt(req.body.password, req.body.userPass)
        });
        newPassword.save();
        res.redirect('/passwords');
    } else {
        res.redirect('/login');
    }

});


app.post('/options/userChange', (req, res) => {

    if (req.isAuthenticated()) {
        User.find({ "username": req.body.username }, (err, entries) => {
            if (err) {
                console.log(err);
                res.redirect('/passwords');
            } else {
                if (entries.length === 0) {
                    User.updateOne({ "username": req.session.passport.user }, { $set: { "username": req.body.username } }, (err) => {
                        if (err) {
                            console.log(err);
                            res.redirect('/');
                        } else {
                            Password.updateMany({ "username": req.session.passport.user }, { $set: { "username": req.body.username } }, (err) => {
                                if (err) {
                                    console.log(err);
                                    res.redirect('/');
                                } else {
                                    res.redirect('/logout');
                                }
                            });
                        }
                    });
                } else {
                    res.redirect('/options');
                }
            }
        });
    } else {
        res.redirect('/login');
    }

});

app.post('/options/passwordChange', (req, res) => {

    if (req.isAuthenticated()) {
        
        User.deleteOne({ "username": req.session.passport.user }, (err) => {
            
            if (err) {
                console.log(err);
                res.redirect('/');
            } else {
                User.register({ username: req.session.passport.user }, req.body.password, (err, user) => {
                    if (err) {
                        console.log(err);
                        res.redirect('/');
                    } else {
                        Password.deleteMany({ "username": req.session.passport.user }, (err) => {

                            if (err) {
                                console.log(err);
                                res.redirect('/');
                            } else {
                                res.redirect('/logout');
                            }
                        });
                    }
                });
            }
        });

    } else {
        res.redirect('/login');
    }

});

// app.listen OBS: CHANGE THIS TO YOUR PORT AND IP FOR THE SERVER
app.listen(process.env.PORT || 3000, '0.0.0.0', () => {
    console.log('Server is running on port 3000');
});
