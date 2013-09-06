var ip_addr = process.env.OPENSHIFT_NODEJS_IP   || '127.0.0.1';
var port    = process.env.OPENSHIFT_NODEJS_PORT || '8080';

var db_name = process.env.OPENSHIFT_APP_NAME || "localjobs";

var connection_string = '127.0.0.1:27017/' + db_name;
// if OPENSHIFT env variables are present, use the available connection info:
if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
  connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
  process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
  process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
  process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
  process.env.OPENSHIFT_APP_NAME;
}

var mongojs = require("mongojs");
var _underscore = require("underscore");

var db = mongojs(connection_string, ['localjobs']);
var jobs = db.collection("jobs");
var gm = require('googlemaps');

exports.new = function(req , res){
	res.render("jobs/create" , {"title" :"Create a new Job"});
};

exports.save = function(req , res){


	var title = req.body.title ,
		description = req.body.description,
		location = req.body.location,
		companyName = req.body["company.name"],
		companyWebSite = req.body["company.website"],
		companyContactEmail = req.body["company.contact.email"],
		companyContactTelephone = req.body["company.contact.telephone"],
		skills = _underscore.map(req.body.skills.split(",") , 
					function(element){return element.trim().toLowerCase();});

	var job = {
				"title" : title,
				"description" : description,
				"skills" : skills,
				"location" : location,
				"lngLat" : [],
				"createdOn" : new Date(),
				"company" : {
					"name" :companyName,
					"website" : companyWebSite,
					"contact" :{
						"email" : companyContactEmail,
						"telephone" : companyContactTelephone
					}
				}
			}
	
	gm.geocode(location , function(err , result){
		if(err){
			res.send('error ' + err);
		}else{
			var lat = result.results[0].geometry.location.lat;
			var lng = result.results[0].geometry.location.lng;
			console.log("Latitude "+lat);
			console.log("Longitude "+lng);

			job.lngLat = [lng , lat];
			
			jobs.save(job , function(err , saved){
				if(err || !saved){
					res.send("Job not saved");
				
				}else{
					res.redirect('/jobs');
				}
			});
			
		}
		
	});

};

exports.list = function(req, res){
	jobs.find().limit(20).sort({createdOn: -1} , function(err , docs){
		if(!err){
			res.render("jobs/showall", {"title" : "Recently created "+docs.length+" Job(s)", "docs": docs});
		}else{
			res.send("Error "+err);
		}
	});
  	
};

exports.searchPage = function(req , res){
	res.render("jobs/search" , {"title" :"Search Jobs"});	
}

exports.search = function(req , res){
	var lat = parseFloat(req.query.lat);
  	var lng = parseFloat(req.query.lng);
  	var skills = req.params.skills.split(",");
  	console.log(lat + " , " + lng + " , " + skills);
  	jobs.find({"skills" : {"$in" : skills},"lngLat" : {"$near": [lng , lat]}}).limit(10).sort({"createdOn":-1},function(err , docs){
  			if(!err){
  				res.header("Content-Type","application/json");
  				res.send(JSON.stringify(docs));
  			}else{
  				res.send("Error "+err);
  			}
  			
  	});
}

exports.searchPageWithGeoNear = function(req , res){
	res.render("jobs/search-geonear" , {"title" :"Search Jobs"});	
}

exports.searchWithGeoNear = function(req , res){
	var lat = parseFloat(req.query.lat);
  	var lng = parseFloat(req.query.lng);
  	var skills = req.params.skills.split(",");
  	console.log(lat + " , " + lng + " , " + skills);
  	
  	db.runCommand({
  		geoNear : "jobs",
  		near : [lng , lat],
  		query: {"skills" : {"$in" : skills}},
  		limit : 10,
  		distanceMultiplier : 111
  	} , function(err , docs){
  			if(!err){
  				var jobs = toJobs(docs);
  				res.render("jobs/showall", {"title" : "Recently created "+jobs.length+" Job(s)", "docs": jobs});
  			}else{
  				res.send("Error "+err);
  			}
  			
  	});
}

function toJobs(docs){
	return _underscore.map(docs.results,function(doc){
  					var job = {
						"title" : doc.obj.title,
						"description" : doc.obj.description,
						"skills" : doc.obj.skills,
						"location" : doc.obj.location,
						"lngLat" : doc.obj.lngLat,
						"createdOn" : doc.obj.createdOn,
						"company" : {
							"name" :doc.obj.company.name,
							"website" : doc.obj.company.website,
							"contact" :{
								"email" : doc.obj.company.contact.email,
								"telephone" : doc.obj.company.contact.telephone
							}
						},
						"distance" : doc.dis
					}
  					return job;
  				});
}