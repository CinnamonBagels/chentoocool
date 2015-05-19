//dependencies for each module used
var express = require('express');
var passport = require('passport');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var dotenv = require('dotenv');
var async = require('async');
var app = express();
var pg = require('pg');

var local = false;
//client id and client secret here, taken from .env
//dotenv.load();

var conn = 'postgres://cogsci_121_1:Lj9vQnwMVikW@delphidata.ucsd.edu:5432/delphibetadb';

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Instagram profile is
//   serialized and deserialized.

// Use the InstagramStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Instagram
//   profile), and invoke a callback with a user object.


//Configures the Template engine
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({ secret: 'keyboard cat',
                  saveUninitialized: true,
                  resave: true}));

//set environment ports and start application
app.set('port', process.env.PORT || 3000);

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
var mlp = 'zillow_zip_median_listing_price_all_homes_norm';
var msp = 'zillow_zip_median_sold_price_all_homes_norm';
var iv = 'zillow_zip_pct_of_homes_increasing_in_values_all_homes_norm';
var dv = 'zillow_zip_pct_of_homes_decreasing_in_values_all_homes_norm';
var sfg = 'zillow_zip_pct_of_homes_selling_for_gain_all_homes_norm';
var sfl = 'zillow_zip_pct_of_homes_selling_for_loss_all_homes_norm';
var selectAllFrom = 'select * from';
var limit = 'limit 10'
var whereInSD = 'where \"State\"=\'CA\' and \"City\"=\'San Diego\'';

app.get('/medianListPrice', function(req, res) {
	var query = [
		selectAllFrom,
		mlp,
		whereInSD,
		limit
	].join(' ');
	pg.connect(conn, function(err, client, done) {
		if(err) return console.log(err);

		client.query(query, function(err, rows) {
			if(err) return console.log(err) 
			if(rows) {
				res.send(rows);
			}
		});
	});
});

app.get('/medianSalePrice', function(req, res) {

});
//route
app.get("*", function(req, res){
	res.sendFile(__dirname + "/public/index.html");
});

http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});
