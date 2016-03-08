'use strict';

/**
 * Module dependencies.
 */
var fs = require('fs'),
    http = require('http'),
    https = require('https'),
    express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    compress = require('compression'),
    methodOverride = require('method-override'),
    cookieParser = require('cookie-parser'),
    helmet = require('helmet'),
    passport = require('passport'),
    mongoStore = require('connect-mongo')({
        session: session
    }),
    flash = require('connect-flash'),
    config = require('./config'),
    consolidate = require('consolidate'),
    path = require('path');

module.exports = function (db) {
    // Initialize express app
    var app = express();

    // Globbing model files
    config.getGlobbedFiles('./app/models/**/*.js').forEach(function (modelPath) {
        require(path.resolve(modelPath));
    });

    // Setting application local variables
    app.locals.title = config.app.title;
    app.locals.description = config.app.description;
    app.locals.keywords = config.app.keywords;
    app.locals.jsFiles = config.getJavaScriptAssets();
    app.locals.cssFiles = config.getCSSAssets();
    // Passing the request url to environment locals
    app.use(function (req, res, next) {
        res.locals.url = req.protocol + '://' + req.headers.host + req.url;
        next();
    });

    // Should be placed before express.static
    app.use(compress({
        filter: function (req, res) {
            return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
        },
        level: 9
    }));

    // Showing stack errors
    app.set('showStackError', true);

    // Set swig as the template engine
    app.engine('server.view.html', consolidate[config.templateEngine]);

    // Set views path and view engine
    app.set('view engine', 'server.view.html');
    app.set('views', './app/views');

    // Environment dependent middleware
    if (process.env.NODE_ENV === 'development') {
        // Enable logger (morgan)
        app.use(morgan('dev'));

        // Disable views cache
        app.set('view cache', false);
    } else if (process.env.NODE_ENV === 'production') {
        app.locals.cache = 'memory';
    }
    // Request body parsing middleware should be above methodOverride
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
    app.use(methodOverride());

    // CookieParser should be above session
    app.use(cookieParser());
    // Express MongoDB session storage
    app.use(session({
        saveUninitialized: true,
        resave: true,
        secret: config.sessionSecret,
        cookie: {maxAge: 2628000000},
        store: new mongoStore({
            mongooseConnection: db
        })
    }));

    // use passport session
    app.use(passport.initialize());
    app.use(passport.session());

    // connect flash for flash messages
    app.use(flash());
    // Use helmet to secure Express headers
    app.use(helmet.xframe());
    app.use(helmet.xssFilter());
    app.use(helmet.nosniff());
    app.use(helmet.ienoopen());
    app.disable('x-powered-by');

    // Setting the app router and static folder
    app.use(express.static(path.resolve('./public')));

    // Globbing routing files
    config.getGlobbedFiles('./app/routes/**/*.js').forEach(function (routePath) {
        require(path.resolve(routePath))(app);
    });

    // Assume 'not found' in the error msgs is a 404. this is somewhat silly, but valid, you can do whatever you like, set properties, use instanceof etc.
    app.use(function (err, req, res, next) {
        // If the error object doesn't exists
        if (!err) return next();

        if (process.env.NODE_ENV === 'production') {
            //Send message to admin.
            var nodemailer = require('nodemailer');
            var transporter = nodemailer.createTransport({
                host: config.emailAddress.host,
                auth: {
                    user: config.emailAddress.bugSender.account,
                    pass: config.emailAddress.bugSender.pass
                }
            });
            var mailOptions = {
                from: 'siyee-bug-reporter<' + config.emailAddress.bugSender.account + '>', // sender address
                to: config.emailAddress.adminEmail, // list of receivers
                subject: 'Bug Report', // Subject line
                text: err.stack // plaintext body
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log('send failed:', error);
                }
            });
        } else {
            console.log(err.stack);
        }
        // Error page
        res.status(500).jsonp({
            statusCode: 93000,
            message: 'Internal Server Error, please contact admin!'
        });
    });

    // Assume 404 since no middleware responded
    app.use(function (req, res) {
        res.status(404).jsonp({
            statusCode: 404,
            url: req.originalUrl,
            message: 'The API does not exist!'
        });
    });

    if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
        app.listen(config.port);
        // Return Express server instance
        return app;
    }

    var cluster = require('cluster');
    var numCPUs = require('os').cpus().length;

    if (cluster.isMaster) {
        // Fork workers.
        for (var i = 0; i < numCPUs; i++) {
            cluster.fork();
        }

        cluster.on('exit', function (worker, code, signal) {
            console.log('worker ' + worker.process.pid + ' died');
        });
    } else {
        // Workers can share any TCP connection
        // In this case it is an HTTP server
        if (process.env.NODE_ENV === 'secure') {
            // Log SSL usage
            console.log('Securely using https protocol');

            // Load SSL key and certificate
            var privateKey = fs.readFileSync('./config/sslcerts/duriantrip.cn.key', 'utf8');
            var certificate = fs.readFileSync('./config/sslcerts/duriantrip.cn_bundle.crt', 'utf8');

            //var options = {
            //    pfx: fs.readFileSync('./config/sslcerts/duriantrip.cn.pfx')
            //};
            //https.createServer(options,app);
            //Create HTTPS Server
            var httpsServer = https.createServer({
                key: privateKey,
                cert: certificate
            }, app);
            httpsServer.listen(config.port);
            // Return HTTPS server instance
            return httpsServer;
        }
        app.listen(config.port);
        // Return Express server instance
        return app;
    }

};
