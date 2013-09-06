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
					res.send("Job saved..");

				}
			});
			
		}
		
	});

};