class 

var markers = new Array();
var map;
var currentMarker = null;
var initialLocation;
var browserSupportFlag =  new Boolean();
var tuesLocation;
var addSpaceContent;
var removeMarker = false;
var currentTitle = "Title";
var currentDescription = "You can plant a tree here";

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

	if(removeMarker)
	{		
		currentMarker.setMap(null);
	}
	else
	{
		removeMarker = true;
	}

	for (i = 0; i < markers.length; i++) {
		markers[i].info.close();
	}

	currentMarker = new google.maps.Marker({
		position: pos,
		map: map,
		icon: "../images/freespot.png"
	});
	
	currentMarker.info = new google.maps.InfoWindow({
		content: addSpaceContent
	});
	
	currentMarker.addListener("click", function(){
		this.info.open(map, this);
		removeMarker = true;
		for (i = 0; i < markers.length; i++) {
			markers[i].info.close();
		}			
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

					if(removeMarker)
					{		
						currentMarker.setMap(null);
					}
					else
					{
						removeMarker = true;
					}

					this.info.open(map, this);
					removeMarker = false;
				});
				
				markers[markers.length-1].setMap(map);
			}
		},
		error: function(error){
			alert("error " + error.code);
		}
	});
}

function getFileName()
{
	var fullPath = document.getElementById('file-input').value;
	if (fullPath) {
		var startIndex = (fullPath.indexOf('\\') >= 0 ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/'));
		var filename = fullPath.substring(startIndex);
		if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
			filename = filename.substring(1);
		}
		return filename;
	}
}

function saveMarker(){

	localStorage.clear();
	var ParseSpace = Parse.Object.extend("Spaces");
	var new_parse_space = new ParseSpace();
	var space_pos = new Parse.GeoPoint(currentMarker.position.lat(), currentMarker.position.lng());
	// new_parse_space.set("objectId", $("#infoTitle").html());
	new_parse_space.set("coordinates", space_pos);
	new_parse_space.set("info", spaceContent);

	// imageUpload

	var fileUploadControl = $("#file-input")[0];

	//get the file from the html element
	var file = fileUploadControl.files[0];

	if(file)
	{
		//name for the file
		var name = getFileName();
		//make the file ready for the DB
		var parseFile = new Parse.File(name, file);

		new_parse_space.set("image", parseFile);

		new_parse_space.save(null, {
			success: function(object) {			
				currentMarker.info.close();			
				markers[markers.length] = currentMarker;
				currentMarker = 0;
				removeMarker = false;
				markers[markers.length-1].info = new google.maps.InfoWindow({
					content: spaceContent
				});
				alert("Success");
			},
			error: function(model, error) {
			// Show the error message somewhere and let the user try again.
					alert("Error: " + error.code + " " + error.message);
			}
		});	
	}
	else
	{
		alert("You must add an image!");
	}
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
            $('#image-label').attr('src', e.target.result);
        }

        reader.readAsDataURL(input.files[0]);
    }
}

function deleteMarker(){
	currentMarker.setMap(null);
}

addSpaceContent = '<div id = "contentsDiv">' +
					'<h3 id = "infoTitle">'+currentTitle+'</h3><p id = "infoDescription">'+currentDescription+'</p>' +
					'<div id = "spotPicture"></div>'+
					'<div id = "infoAddButton">'+
						'<div id="image-upload"><label for="file-input"><img id="image-label" src="../images/add_picture.png"/>'+
						'</label><input id="file-input" onchange="readURL(this)" type="file"/></div>'+
					'</div>'+
					'<div id = "AcceptButton">'+
						'<button onclick="saveMarker()">Accept</button>'+
					'</div>'+
				'</div>';

spaceContent = '<div id = "contentsDiv">' +
					'<h3 id = "infoTitle">'+currentTitle+'</h3><p id = "infoDescription">'+currentDescription+'</p>' +
					'<div id = "spotPicture"></div>'+
					'<div id = "infoAddButton">'+
						'<div id="image-upload"><label for="file-input"><img id="image-label" src="../images/add_picture.png"/>'+
						'</label><input id="file-input" onchange="readURL(this)" type="file"/></div>'+
					'</div>'+

					'<span id = "DeleteButton">'+
						'<button onclick="deleteMarker()">Delete</button>'+
					'</span>'+

					'<span id = "UpdateButton">'+
						'<button onclick="saveMarker()">Update</button>'+
					'</span>'+
				'</div>';

/*

'<input type="file" name="fileselect" id="fileselect"></input>'+
    					'<input id="uploadbutton" type="button" value="Upload"> </input>'+


addSpaceContent = '<div style = "background-color: color: black">'+
	'<h3 id = "infoTitle">name</h3><p id = "infoDescription"> description </p>' +

	'<table style="width:100%"><tr id = "infoTR"><td id = "infoTD"><center>' + 
						'<div #id = "spotPicture"></div>'+
						'</center></td>'+
		'<td id = "infoTD"><center>'+
						'<div #id = "spotPicture"></div>'+
					'</div></center></td></tr>'+
		'<tr id = "infoTR"><center><td id = "infoTD"><div id = "infoAddButton">'+
						'<input type="submit" value = "Add picture" id = "ADDING"/>'+
					'</div></td><td id = "infoTD">'+
					'<div id = "infoAddButton">'+
						'<input type="submit" value = "Add picture" id = "ADDING"/>'+
					'</div></td></center></tr></table></div>';*/