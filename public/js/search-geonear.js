$("#jobSearchForm").submit(function(event){
	console.log("Submitted Job search form");
	event.preventDefault();
	$("#results").empty();
	$("#jobSearchForm").mask("Finding Jobs ...");
	
	var skills = $('input[name=skills]').val();
	
	console.log("skills : "+skills);
	
	getCurrentPosition(callback , skills);
	
});

function getCurrentPosition(callback , skills){

	navigator.geolocation.getCurrentPosition(function(position){
					
					var longitude = position.coords.longitude;
			    	var latitude = position.coords.latitude;
			    	callback(latitude , longitude , skills);
				}, function(e){
					$("#jobSearchForm").unmask();
					switch (e.code) {
						case e.PERMISSION_DENIED:
							alert('You have denied access to your position. You will ' +
									'not get the most out of the application now.'); 
							break;
						case e.POSITION_UNAVAILABLE:
							alert('There was a problem getting your position.'); 
							break;
						case e.TIMEOUT:
									alert('The application has timed out attempting to get ' +
											'your location.'); 
							break;
						default:
							alert('There was a horrible Geolocation error that has ' +
									'not been defined.');
					}
				},
					{ timeout: 45000 }
				
				);
}

function callback(latitude , longitude , skills){
	
	console.log('longitude .. '+longitude);
	console.log('latitude .. '+latitude);
	window.location.href = location.href + "/"+skills + "?lng="+longitude+"&lat="+latitude;
}