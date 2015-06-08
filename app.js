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
	'and listings."RegionName"=\'' + zip + '\'',
	'and listings."Year"=sales."Year"'].join(' ');
	
	return query;	
} 

function listQuery(zip, ord) {
	var query = 
	['SELECT "State" as state,',
	    '"RegionName" as regionName,', 
		'"Value" as listValue,',
		'"Month" as month,', 
		'"Year" as year',
	 'from zillow_zip_median_listing_price_all_homes_norm',
	 'where "City"=\'San Diego\'',
	 'and "RegionName"=\'' + zip + '\'',
	 'order by listValue ' + (ord ? 'asc' : 'desc') + ' limit 1' 
	].join(' ');
	return query;
}

function salesQuery(zip, ord){
	var query = 
	['SELECT "State" as state,',
	    '"RegionName" as regionName,', 
		'"Value" as listValue,',
		'"Month" as month,', 
		'"Year" as year',
	 'from zillow_zip_median_sold_price_all_homes_norm',
	 'where "City"=\'San Diego\'',
	 'and "RegionName"=\'' + zip + '\'',
	 'order by listValue ' + (ord ? 'asc' : 'desc') + ' limit 1'
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

function foreclosurequery(zip) {
	var query = [
	selectAllFrom,
	foreclosure,
	whereInSD,
	'and "RegionName"=\'' + zip + '\''].join(' ');

	return query;
}
// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
var foreclosure = 'zillow_zip_homes_sold_as_foreclosures_ratio_all_homes_norm'
var mlp = 'zillow_zip_median_listing_price_all_homes_norm';
var msp = 'zillow_zip_median_sold_price_all_homes_norm';
var iv = 'zillow_zip_pct_of_homes_increasing_in_values_all_homes_norm';
var dv = 'zillow_zip_pct_of_homes_decreasing_in_values_all_homes_norm';
var sfg = 'zillow_zip_pct_of_homes_selling_for_gain_all_homes_norm';
var sfl = 'zillow_zip_pct_of_homes_selling_for_loss_all_homes_norm';
var selectAllFrom = 'select * from';
var limit = 'limit 10'
var whereInSD = 'where \"State\"=\'CA\' and \"City\"=\'San Diego\'';

function soldForGain(zip) {
	var query = [
		selectAllFrom,
		sfg,
		whereInSD,
		'and "RegionName"=\'' + zip + '\''
	].join(' ');

	return query;
}

app.get('/medianListPrice/:zip', function(req, res) {
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
				res.send(rows);
			}
		});
	});
});

app.get('/foreclosureratio/:zip', function(req, res) {
	var zip = req.params.zip;
	pg.connect(conn, function(err, client, done) {
		if(err) return console.log(err);

		client.query(foreclosurequery(zip), function(err, response) {
			if(err) return console.log(err);
			if(response.rows) {
				var data = response.rows;
				data.sort(function(a, b) {
					if(a.Year === b.Year) {
						return a.Month - b.Month;
					}

					return a.Year - b.Year;
				});

				// var modData = data.map(function(d) {
				// 	if(d.Value === null) {
				// 		d.Value = 0;
				// 	}
				// })

				res.send(data);
			}
		})
	})
})

app.get('/highestandlowest/:zip', function(req, res) {
	var zip = req.params.zip;
	var lowestList, highestList, lowestSale, highestSale;
	pg.connect(conn, function(err, client, done){
		if(err) return console.log(err);
		client.query(listQuery(zip, true), function(err, lowlist){
			if(err) return console.log(err);
			if(lowlist.rows[0]) {
				lowestList = lowlist.rows[0].listvalue === null ? 'Unknown' : lowlist.rows[0].listvalue;
			}
			client.query(listQuery(zip, false), function(err, highlist){
				if(err) return console.log(err);
				if(highlist.rows[0]) {
					highestList = highlist.rows[0].listvalue === null ? 'Unknown' : highlist.rows[0].listvalue;
				}
				client.query(salesQuery(zip, true), function(err, lowsale){
					if(err) return console.log(err);
					if(lowsale.rows[0]) {
						lowestSale = lowsale.rows[0].listvalue === null ? 'Unknown' : lowsale.rows[0].listvalue;
					}
					client.query(salesQuery(zip, false), function(err, highsale){
						if(err) return console.log(err);
						if(highsale.rows[0]) {
							highestSale = highsale.rows[0].listvalue === null ? 'Unknown' : highsale.rows[0].listvalue;
							res.send({
								lowestsaleyear : lowsale.rows[0].year,
								lowestlistyear : lowlist.rows[0].year,
								highestsaleyear : highsale.rows[0].year,
								highestlistyear : highlist.rows[0].year,
								zip : zip,
								lowestList : lowestList,
								highestList : highestList,
								lowestSale : lowestSale,
								highestSale : highestSale
							});
						}
					});
				});
			});
		});
	});
	//query database to get highest limit 1/lowest
	//query 
});
//find a way to get the highest list price, lowest price
//as well as highest sale price, and lowest sale price of a zip code
app.get('/medianRelation/:zip', function(req, res) {
	var zip = req.params.zip;
	pg.connect(conn, function(err, client, done) {
		if(err) return console.log(err);
		client.query(medianRelationQuery(zip), function(err, data) {
			if(err) return console.log(err);
			if(data.rows) {
				var modData = data.rows.map(function(row, index, array) {
					var tempjson = row;
					if(index !== 0 && row.salevalue === null) {
						tempjson.salevalue = 0;
					} else {
						tempjson.salevalue = row.salevalue === null ? Math.floor(array[index - 1].salevalue) : Math.floor(row.salevalue);
					}
					tempjson.listvalue = row.listvalue === null ? Math.floor(array[index - 1].listvalue) : Math.floor(row.listvalue);
					tempjson.values = {
						listvalue : tempjson.listvalue,
						salevalue : tempjson.salevalue
					};
					tempjson.date = row.month + '/' + row.year;
					tempjson.max = tempjson.listvalue > tempjson.salevalue ? tempjson.listvalue : tempjson.salevalue;
					return tempjson;
				});

				modData.sort(function(first, second) {
					if(first.year === second.year) {
						return first.month - second.month;
					}

					return first.year - second.year;
				});
				modData.shift();
				modData.shift();
				modData.shift();
				res.send(modData);
			}

			res.end();
		});
	})
});

app.get('/medianSalePrice/:zip', function(req, res) {

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

app.get('/data', function(req, res){
});

app.get('/soldForGain/:zip', function(req, res){
	var query = soldForGain(req.params.zip);
	pg.connect(conn, function(err, client, done) {
		if(err) return console.log(err);

		client.query(query, function(err, data) {
			if(err) return console.log(err) 
			if(data.rows) {
				var mod = data.rows;
				mod.forEach(function(d, index, array) {
					d.Value = d.Value === null ? Math.floor(array[index - 1].Value) : Math.floor(d.Value);
				})
				mod.sort(function(a, b) {
					if(a.Year === b.Year) {
						return a.Month - b.Month;
					}

					return a.Year - b.Year;
				});
				res.send(mod);
			}
		});
	});
});

app.get('/soldForLoss/:zip', function(req, res){
	var zip = req.params.zip;
	var query = [
		selectAllFrom,
		sfl,
		whereInSD
		/* limit */
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

app.get('/increasingValues', function(req, res){
	var query = [
		selectAllFrom,
		iv,
		whereInSD
		/* limit */
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

app.get('/decreasingValues', function(req, res){
	var query = [
		selectAllFrom,
		dv,
		whereInSD
		/* limit */
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


//route
app.get("*", function(req, res){
	res.sendFile(__dirname + "/public/index.html");
});

http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});
