var markers = new Array();
var map;
var currentMarker = null;
var initialLocation;
var browserSupportFlag =  new Boolean();
var tuesLocation;
var contentString;
var removeMarker = false;

$(document).ready(function(){
	Parse.initialize("ypv4dSS2h2pN6UTduc8hC9czpjBRJIklN7gN4ULv", "EgGSdtxDzc7GtuIvnGaaF3NBbRmuRRPq6B6yKbRV");
	loadMarkers();
});

function initMap() {	
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 42.667877, lng: 25.163029},
		zoom: 16
	});
	google.maps.event.addListener(map, "click", function(e) {
		placeMarker(e.latLng, map);
	});

	if(navigator.geolocation) {
    	browserSupportFlag = true;
    	navigator.geolocation.getCurrentPosition(function(position) {
      	initialLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
      	map.setCenter(initialLocation);
    	}, function() {
      		handleNoGeolocation(browserSupportFlag);
    	});
	}
	// Browser doesn't support Geolocation
	else {
		browserSupportFlag = false;
	    handleNoGeolocation(browserSupportFlag);
	}
}

function placeMarker(pos, map){	
	
	if(currentMarker)
	{		
		currentMarker.setMap(null);
	}
	else
	{
		removeMarker = true;
	}

	currentMarker = new google.maps.Marker({
		position: pos,
		map: map,
		icon: "../images/freespot.png"
	});
	
	currentMarker.info = new google.maps.InfoWindow({
		content: contentString
	});
	
	currentMarker.addListener("click", function(){
		this.info.open(map, this);
	});

	currentMarker.info.open(map, currentMarker);
}

function loadMarkers(){
	var ParseSpace = Parse.Object.extend("Spaces");
	var query = new Parse.Query(ParseSpace);
	query.find({
		success: function(results){
			for(var i = 0; i < results.length; i++){
				var marker_pos = results[i].get("coordinates");
				markers[markers.length] = new google.maps.Marker({
					position: new google.maps.LatLng(marker_pos.latitude, marker_pos.longitude),
					icon: "../images/freespot.png"
				});
				
				markers[markers.length-1].info = new google.maps.InfoWindow({
					content: results[i].get("info")
				});
				
				markers[markers.length-1].addListener("click", function(){
					for (i = 0; i < markers.length; i++) {
						markers[i].info.close();
					}

					this.info.open(map, this);
				});
				
				markers[markers.length-1].setMap(map);
			}
		},
		error: function(error){
			alert("error " + error.code);
		}
	});
}


function saveMarker(){
	localStorage.clear();
	var ParseSpace = Parse.Object.extend("Spaces");
	var new_parse_space = new ParseSpace();
	var space_pos = new Parse.GeoPoint(currentMarker.position.lat(), currentMarker.position.lng());
	new_parse_space.set("coordinates", space_pos);
	new_parse_space.set("info", currentMarker.info.content);
	new_parse_space.save(null, {
		success: function(object) {			
			$("#save_current").text("Saved current marker");			
			currentMarker.info.close();			
			markers[markers.length] = currentMarker;
			currentMarker = 0;			
			removeMarker = false;
		},
		error: function(model, error) {
		// Show the error message somewhere and let the user try again.
				$("#save_current").text("Save current spaces");
				alert("Error: " + error.code + " " + error.message);
		}
	});	
};

function handleNoGeolocation(errorFlag) {
	if (errorFlag == true) {
	  alert("Geolocation service failed.");
	  initialLocation = tuesLocation;
	} else {
	  alert("Your browser doesn't support geolocation. We have placed you in TUES!");
	  initialLocation = tuesLocation;
	}

	map.setCenter(initialLocation);
}

function readURL(input) {

    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('.image-label').attr('src', e.target.result);
        }

        reader.readAsDataURL(input.files[0]);
    }
}

contentString ='<div class = "contentsDiv">' +
					'<h3 class = "infoTitle">Tree_0001</h3><p class = "infoDescription"> You can plant a tree here </p>' +
					'<div class = "spotPicture"></div>'+
					'<div class = "infoAddButton">'+
						'<div class="image-upload"><label for="file-input"><img class="image-label" src="../images/add_picture.png"/></label><input id="file-input" onchange="readURL(this)" type="file"/></div>'+
					'</div>'+
					'<div class = "AcceptButton">'+
						'<button onclick="saveMarker()">Accept</button>'+
					'</div>'+
				'</div>';

/*

'<input type="file" name="fileselect" id="fileselect"></input>'+
    					'<input id="uploadbutton" type="button" value="Upload"> </input>'+


contentString = '<div style = "background-color: color: black">'+
	'<h3 class = "infoTitle">name</h3><p class = "infoDescription"> description </p>' +

	'<table style="width:100%"><tr class = "infoTR"><td class = "infoTD"><center>' + 
						'<div #id = "spotPicture"></div>'+
						'</center></td>'+
		'<td class = "infoTD"><center>'+
						'<div #id = "spotPicture"></div>'+
					'</div></center></td></tr>'+
		'<tr class = "infoTR"><center><td class = "infoTD"><div class = "infoAddButton">'+
						'<input type="submit" value = "Add picture" class = "ADDING"/>'+
					'</div></td><td class = "infoTD">'+
					'<div class = "infoAddButton">'+
						'<input type="submit" value = "Add picture" class = "ADDING"/>'+
					'</div></td></center></tr></table></div>';*/