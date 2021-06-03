// @ts-nocheck
/* eslint-disable no-console */

const express = require('express');
const session = require('express-session');
const mustacheExpress = require('mustache-express');
const path = require('path');
const { 
  userContext, 
  authTransaction,
  flowStates,
  testEnv
} = require('./middlewares');

const templateDir = path.join(__dirname, '', 'views');
const frontendDir = path.join(__dirname, '', 'assets');

const getConfig = require('../config.js');
const { port } = getConfig().webServer;

const app = express();
module.exports = app;

app.use(express.urlencoded({ extended: true }));
app.use(testEnv);
app.use(session({ 
  secret: 'this-should-be-very-random', 
  resave: true, 
  saveUninitialized: false
}));
app.use(flowStates);
app.use(authTransaction);

// Provide the configuration to the view layer because we show it on the homepage
app.use((req, res, next) => {
  const { oidc } = getConfig().webServer;
  const displayConfig = Object.assign(
    {},
    oidc,
    {
      clientSecret: '****' + oidc.clientSecret.substr(oidc.clientSecret.length - 4, 4)
    }
  );
  
  app.locals.oidcConfig = displayConfig;
  next();
});


// This server uses mustache templates located in views/ and css assets in assets/
app.use('/assets', express.static(frontendDir));
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', templateDir);

app.use(userContext);

app.use(require('./routes'));

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
app.use(function(err, req, res, next) {
  console.error(err.stack);

  let errors;
  if (Array.isArray(err.errorCauses) && err.errorCauses.length) {
    // handle error from SDK
    errors = err.errorCauses;
  } else if (typeof err === 'string') {
    errors = [err];
  } else if (err && err.message) {
    errors = [err.message];
  } else {
    errors = ['Internal Error!'];
  }

  res.status(500).render('error', { 
    hasError: true,
    errors 
  });
});

app.listen(port, () => console.log(`App started on port ${port}`));
