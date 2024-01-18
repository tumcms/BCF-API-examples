const express = require('express');
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2').Strategy;

const app = express();

// Set up session management
app.use(require('express-session')({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}
));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// // Replace these values with your actual credentials
const clientId = 'replace-with-your-client-id';
const clientSecret = 'replace-with-your-client-secret';

passport.use(new OAuth2Strategy({
  authorizationURL: 'https://auth.bimtrackapp.co/connect/authorize',
  tokenURL: 'https://auth.bimtrackapp.co/connect/token',
  clientID: clientId,
  clientSecret: clientSecret,
  callbackURL: 'https://localhost:3000/auth/callback'
},
  function (accessToken, refreshToken, profile, cb) {
    // save the access token in the session
    req.session.accessToken = accessToken;
    // log the access token into the server console (for debug purposes only)
    console.log("[INFO] Access Token: %s ", req.session.accessToken)
    return cb(null, profile);
  }
));

// Serialize user into the session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user from the session
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Route to initiate the OAuth2 authentication
app.get('/auth', passport.authenticate('oauth2'
  , {    
  scope: ["BcfWebApi", "openid", "BIMTrack_Api"], 
  response_type: "code"
  }
));

// OAuth2 callback endpoint
app.get('/auth/callback',
  passport.authenticate('oauth2', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication
    res.redirect('/'); // Redirect to home
  });


// Logout route
app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

// Home route
app.get('/', (req, res) => {
  res.send('Home page - <a href="/auth">Login</a>');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
