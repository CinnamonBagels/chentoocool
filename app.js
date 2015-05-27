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

function medianRelationQuery(zip) {
	var query = 
	['SELECT listings."State" as state,', 
		'listings."RegionName" as regionName,', 
		'listings."Value" as listValue,',
		'listings."Month" as month,', 
		'listings."Year" as year,',
		'sales."Value" as saleValue',
	'from zillow_zip_median_listing_price_all_homes_norm as listings,',
	     'zillow_zip_median_sold_price_all_homes_norm as sales',
	'where listings."State"=\'CA\'',
	'and listings."City"=\'San Diego\'',
	'and listings."RegionName"=sales."RegionName"',
	'and listings."Month"=sales."Month"',
	'and listings."RegionName"=\'' + zip + \'',
	'and listings."Year"=sales."Year" limit 10'].join(' ');
	
	return query;	
} 

function highestLowestPriceQuery(zip) {
	var query = 
	[
		'blah',
		'blah'
	].join(' ');

	return query;
}

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
		whereInSD
		/* limit */
	].join(' ');
	pg.connect(conn, function(err, client, done) {
		if(err) return console.log(err);

		client.query(query, function(err, rows) {
			if(err) return console.log(err) 
			if(rows) {
				console.log(rows);
				res.send(rows);
			}
		});
	});
});

app.get('/highestandlowest', function(req, res) {
	var zip = req.body.zip;
	//query database to get highest limit 1/lowest
	//query 
});
//find a way to get the highest list price, lowest price
//as well as highest sale price, and lowest sale price of a zip code
app.get('/medianRelation', function(req, res) {
	var zip = req.body.zip;
	pg.connect(conn, function(err, client, done) {
		if(err) return console.log(err);
		client.query(medianRelationQuery(zip), function(err, data) {
			if(err) return console.log(err);
			if(data.rows) {
				var modData = data.rows.map(function(row) {
					var tempjson = row;
					tempjson.listvalue = row.listvalue === null ? 0 : Math.floor(row.listvalue);
					tempjson.salevalue = row.salevalue === null ? 0 : Math.floor(row.salevalue);
					tempjson.date = row.month + '/' + row.year;
					return tempjson;
				});

				modData.sort(function(first, second) {
					if(first.year === second.year) {
						return first.month - second.month;
					}

					return first.year - second.year;
				});

				console.log(modData);
				res.send(modData);
			}

			res.end();
		});
	})
});

app.get('/medianSalePrice', function(req, res) {
	var query = [
		selectAllFrom,
		msp,
		whereInSD
	].join(' ');

	pg.connect(conn, function(err, client, done) {
		if(err)  return console.log(err);

		client.query(query, function(err, rows) {
			if(err) return console.log(err);
			if(rows) {
				res.send(rows);
			}
		})
	})
});
//route
app.get("*", function(req, res){
	res.sendFile(__dirname + "/public/index.html");
});

http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});
