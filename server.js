var express = require('express');
console.log('server.js -> process.env.env_config :', process.env.env_config)
process.env.NODE_ENV = process.env.env_config

var cfenv = require("cfenv");

var bodyParser = require('body-parser');
var path = require('path');

var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var methodOverride = require('method-override');
var passport = require('passport');
var util = require('util');
var bunyan = require('bunyan');
var config = require('./config');
const appConfig = require('./config/config.js');
//var appConstants=require('./constants');
var OIDCStrategy = require('passport-azure-ad').OIDCStrategy;
const app = express();
var appEnv = cfenv.getAppEnv();

const port = process.env.PORT || 8083;
//appEnv.port = process.env.PORT || 8083

//process.env.NODE_ENV = 'production';



var appConstants=require('./constants');

app.use(methodOverride());
app.use(cookieParser());


/*Azure ID STARTS*/
passport.serializeUser(function (user, done) {
  done(null, user.oid);
});

passport.deserializeUser(function (oid, done) {
  findByOid(oid, function (err, user) {
    done(err, user);
  });
});

// array to hold logged in users
var users = [];
var destroySessionUrl = 'https://login.microsoftonline.com/common/oauth2/logout?post_logout_redirect_uri=' + global.gConfig.AZURE_LOGOUT_URL;
function loadAppConstantsFromConfig(){
 
 // appConstants.AGN_CONSTANTS.MULE_DATA_API=global.gConfig.MULE_DATA_API;
  // appConstants.AGN_CONSTANTS.AZURE_CLIENT_SECRET=global.gConfig.AZURE_CLIENT_SECRET,
  // appConstants.AGN_CONSTANTS.AZURE_REDIRECT_URL=global.gConfig.AZURE_REDIRECT_URL,
  // appConstants.AGN_CONSTANTS.AZURE_LOGOUT_URL=global.gConfig.AZURE_LOGOUT_URL,
  // appConstants.AGN_CONSTANTS.client_id=global.gConfig.client_id;
  // appConstants.AGN_CONSTANTS.client_secret=global.gConfig.client_secret;
 
  //console.log(process.env.NODE_ENV)
}

var findByOid = function (oid, fn) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    //log.info('we are using user: ', user);
    if (user.oid === oid) {
      return fn(null, user);
    }
  }
  return fn(null, null);
};

passport.use(new OIDCStrategy({

  
 
  clientID: global.gConfig.AZURE_CLIENT_ID,
  redirectUrl: global.gConfig.AZURE_REDIRECT_URL,
  clientSecret: global.gConfig.AZURE_CLIENT_SECRET,
 

   identityMetadata: config.creds.identityMetadata,
  // clientID: config.creds.clientID,
  //redirectUrl: config.creds.redirectUrl,
  //clientSecret: config.creds.clientSecret,
  responseType: config.creds.responseType,
  responseMode: config.creds.responseMode,
  allowHttpForRedirectUrl: config.creds.allowHttpForRedirectUrl,
  validateIssuer: config.creds.validateIssuer,
  isB2C: config.creds.isB2C,
  issuer: config.creds.issuer,
  passReqToCallback: config.creds.passReqToCallback,
  scope: config.creds.scope,
  loggingLevel: config.creds.loggingLevel,
  nonceLifetime: config.creds.nonceLifetime,
  nonceMaxAmount: config.creds.nonceMaxAmount,
  useCookieInsteadOfSession: config.creds.useCookieInsteadOfSession,
  cookieEncryptionKeys: config.creds.cookieEncryptionKeys,
  clockSkew: config.creds.clockSkew,
 
},
  function (iss, sub, profile, accessToken, refreshToken, params, done) {
    if (!profile.oid) {
      return done(new Error("No oid found"), null);
    }
    // profile.initialRefreshToken = refreshToken;
    // profile.oid = jwtClaims.oid;
    // done(null, profile);//nutan trying code
    // asynchronous verification, for effect...
    process.nextTick(function () {
      findByOid(profile.oid, function (err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          // "Auto-registration"
          users.push(profile);
          return done(null, profile);
        }
        return done(null, user);
      });
    });
  }
));


app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(expressSession({ secret: 'ssshhhhh', resave: true, saveUninitialized: true, userDetails: {} }));


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/AzureLogin');
};



app.get('/AzureDetails', function (req, res) {
  res.send({ user: req.user });
});

// '/account' is only available to logged in user
app.get('/account', ensureAuthenticated, function (req, res) {
  res.render('account', { user: req.user });
});

app.get('/AzureLogin',
  function (req, res, next) {
    passport.authenticate('azuread-openidconnect',
      {
        response: res,                      // required
        resourceURL: config.resourceURL,    // optional. Provide a value if you want to specify the resource.
        customState: 'my_state',            // optional. Provide a value if you want to provide custom state value.
        failureRedirect: '/'
      }
    )(req, res, next);
  },
  function (req, res) {

    //log.info('Login was called in the Sample');
    res.redirect('/AzureDetails');
  });

app.get('/AzureloginDetails', function (req, res, next) {
  res.send(req.session.userDetails ? req.session.userDetails : {});
});
// 'GET returnURL'
// `passport.authenticate` will try to authenticate the content returned in
// query (such as authorization code). If authentication fails, user will be
// redirected to '/' (home page); otherwise, it passes to the next middleware.
app.get('/auth/openid/return',
  function (req, res, next) {
    passport.authenticate('azuread-openidconnect',
      {
        response: res,                      // required
        failureRedirect: '/'
      }
    )(req, res, next);
  },
  function (req, res) {

    //log.info('We received a return from AzureAD.');
    res.redirect('/AzureDetails');
  });

// 'POST returnURL'
// `passport.authenticate` will try to authenticate the content returned in
// body (such as authorization code). If authentication fails, user will be
// redirected to '/' (home page); otherwise, it passes to the next middleware.
app.post('/auth/openid/return',
  function (req, res, next) {
    passport.authenticate('azuread-openidconnect',
      {
        response: res,                      // required
        failureRedirect: '/'
      }
    )(req, res, next);
  },
  function (req, res) {
    //console.log("Groups -> ", req.user._json.groups);
    //  req.user._json.groups = ["c0b30bbf-d0e0-4f20-89b6-d02dd87d2249", "94c61c72-145a-4e46-8e7f-467f9b4b849b", "96b7a2f1-a36c-4232-83b7-ca5f8a32aab6"];

    req.session.userDetails = req.user._json;
    console.log("========", req.session);
    //localStorage.setItem('azureDetails', JSON.stringify(req.user._json.groups));

    res.redirect('/login');

    //res.redirect('/AzureDetails');
  });

// 'logout' route, logout from passport, and destroy the session with AAD.
app.get('/Azurelogout', function (req, res) {
  req.session.destroy(function (err) {
    res.clearCookie('connect.sid');
    req.logOut();
    console.log("destroySessionUrl",destroySessionUrl);
    res.redirect(destroySessionUrl);
  
 
  });

});
/*Azure ID ENDS*/


app.use('/', express.static(__dirname + "/public"));


app.get('/app-config', (req, res) => {
  console.log(`${global.gConfig.AZURE_LOGOUT_URL} listening on port ${global.gConfig.config_id}`);
  loadAppConstantsFromConfig();
  res.json(global.gConfig);
});

app.use(function (req, res, next) {

  res.setHeader('Access-Control-Allow-Origin', 'origin');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT ,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type, Accept, Authorization,client_id,client_secret');
  next();
});

app.get('*', function (request, response) {
  response.sendFile(path.resolve(__dirname + '/public', '', 'index.html'));
  
});


// const server = app.listen(port, '', () => {
//   console.log('Express listening on port', port);
// });
// const server = app.listen(appEnv.port, appEnv.bind, function() {
//   console.log('Express listening on port', appEnv.port);


// var agnENVVar = appEnv.getServiceCreds(/agn-env-var/)

// var clientID = agnENVVar.client_id;

//  global.gConfig.client_id=agnENVVar.client_id;
// var clientSecret=agnENVVar.client_secret;

//  global.gConfig.client_secret = agnENVVar.client_secret;

// console.log("clientID from env ",clientID);

// console.log("clientSecret from env",clientSecret);

// })
app.listen( process.env.PORT || 8000)



