var markers = [];
var map;
var currentMarker = null;
var initialLocation;
var browserSupportFlag =  new Boolean();
var tuesLocation;
var addSpaceContent;
var removeMarker = false;
var currentTitle = "Title";
var currentDescription = "You can plant a tree here";
var editingTitle = false;
var editingDescription = false;

$(document).ready(function(){
	Parse.initialize("ypv4dSS2h2pN6UTduc8hC9czpjBRJIklN7gN4ULv", "EgGSdtxDzc7GtuIvnGaaF3NBbRmuRRPq6B6yKbRV");
	$("#saving").hide();
	loadMarkers();
});

function initMap() {	
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 42.667877, lng: 25.163029},
		zoom: 8
	});
	google.maps.event.addListener(map, "click", function(e) {
		placeMarker(e.latLng, map);
	});

	if(navigator.geolocation) {
    	browserSupportFlag = true;
    	navigator.geolocation.getCurrentPosition(function(position) {
      	initialLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
      	map.setCenter(initialLocation);
    	}
					//bugs out for me
				 //, function() {
      	//	handleNoGeolocation(browserSupportFlag);
    		//}
																							);
	}
	// Browser doesn't support Geolocation
	else {
		browserSupportFlag = false;
	    handleNoGeolocation(browserSupportFlag);
	}
}

function hideInfos()
{
	for (var key in markers) {
	    markers[key].info.close();
	}
}

function setImage(id)
{
	var ParseSpace = Parse.Object.extend("Spaces");
	var query = new Parse.Query(ParseSpace);
	$("#saving").show();
	query.get(id, {
	  success: function(object) {
		  var imageFile = object.get('image');
			var imageURL = imageFile.url();
			$('#spot-image')[0].src = imageURL;
			$('#spot-image-big')[0].href = imageURL;

			imageFile = object.get('image2');
			if(imageFile)
			{
				imageURL = imageFile.url();
				$('#image-label')[0].src = imageURL;
			}
			else
			{
				$('#image-label')[0].src = "../images/add_picture.png";
			}
			$("#saving").hide();
	  },
	  error: function(object, error) {
	    alert ("error "+ error.code);
			$("#saving").hide();
	  }
	});
}

function findId(mark)
{
	for (var key in markers) {

	    if(markers[key] == mark)
	    {
	    	return key;
	    }
	}

	return false;
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

	hideInfos()

	currentMarker = new google.maps.Marker({
		position: pos,
		map: map,
		icon: "../images/freespot.png"
	});
	
	currentMarker.info = new google.maps.InfoWindow({
		content: addSpaceContent
	});
	
	currentMarker.addListener("click", function(){
		hideInfos();
		this.info.open(map, this);
		removeMarker = !findId(currentMarker);
		setImage(findId(this));
	});

	currentMarker.info.open(map, currentMarker);
}

function loadMarkers(){
	var ParseSpace = Parse.Object.extend("Spaces");
	var query = new Parse.Query(ParseSpace);
	query.find({
		success: function(results){
			for(var i = 0; i < results.length; i++){
				var id = results[i].id;
				var currIcon;

				if(results[i].get("plantedTree"))
				{
					currIcon = "../images/tree_small.png";
				}
				else{
					currIcon = "../images/freespot.png";
				}
				var marker_pos = results[i].get("coordinates");
				markers[id ] = new google.maps.Marker({
					position: new google.maps.LatLng(marker_pos.latitude, marker_pos.longitude),
					icon: currIcon
				});
				
				markers[id].info = new google.maps.InfoWindow({
					content: results[i].get("info")
				});
				
				markers[id].addListener("click", function(){
					hideInfos()

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
					currentMarker = this;
					setImage(findId(this));
				});
				
				markers[id].setMap(map);
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

	spaceContent = '<div style = "background-color: color: black">'+
	'<h3 id = "infoTitle">'+currentTitle+'</h3><div class="clear"></div><p id = "infoDescription"> '+currentDescription+' </p><div class="clear"></div>' +

	'<table style="width:100%"><tr id = "infoTR"><td id = "infoTD"><center></div>' + 
						'<a id="spot-image-big" href="large_image.jpg" class="fancybox" title="Sample title"><img id="spot-image" src="#" /></a>'+
						'</center></td>'+
		'<td id = "infoTD"><center>'+
						'<span id = "infoAddButton">'+
							'<span id="image-upload"><label for="file-input"><img id="image-label" src="../images/add_picture.png"/>'+
							'</label><input id="file-input" onchange="readURL(this)" type="file"/></span>'+
						'</span>'+
					'</div></center></td></tr>'+
					'<tr id = "infoTR"><center><td id = "infoTD">'+
					'<center>'+
					'<span id = "DeleteButton">'+
							'<button onclick="deleteMarker()">Delete</button>'+
						'</span>'+
					'</center>'+
					'</td>'+
					'<td id = "infoTD">'+
					'<span id = "UpdateButton">'+
							'<button onclick="updateMarker()">Update</button>'+
					'</span>'
					'</td></center></tr></table></div>';

	localStorage.clear();
	var ParseSpace = Parse.Object.extend("Spaces");
	var new_parse_space = new ParseSpace();
	var space_pos = new Parse.GeoPoint(currentMarker.position.lat(), currentMarker.position.lng());
	// new_parse_space.set("objectId", $("#infoTitle").html());
	new_parse_space.set("coordinates", space_pos);
	new_parse_space.set("info", spaceContent);
	new_parse_space.set("name", currentTitle);
	new_parse_space.set("plantedTree", false);

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
		$("#saving").show();
		new_parse_space.save(null, {
			success: function(object) {			
				currentMarker.info.close();			
				markers[new_parse_space.id] = currentMarker;
				currentMarker = 0;
				removeMarker = false;
				markers[new_parse_space.id].info = new google.maps.InfoWindow({
					content: spaceContent
				});
				$("#saving").hide();
			},
			error: function(model, error) {
			// Show the error message somewhere and let the user try again.
					alert("Error: " + error.code + " " + error.message);
					$("#saving").hide();
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

	if(currentMarker)
	{
		var ParseSpace = Parse.Object.extend("Spaces");
		var query = new Parse.Query(ParseSpace);
		$("#saving").show();

		query.get(findId(currentMarker), {
		  success: function(object) {
			    object.destroy();
				$("#saving").hide();
		  },
		  error: function(object, error) {
		    alert ("error "+ error.code);
				$("#saving").hide();
		  }
		});

		currentMarker.setMap(null);
	}
}

function editTitle()
{	
	if(!editingTitle)
	{
		$("#infoTitle").before('<input type="text" id = "titleEdit" class = "editingBox" name="" value="'+$("#infoTitle").html()+'">');
		document.getElementById("infoTitle").style.display = 'none';		
	}
	else
	{
		currentTitle = $('#titleEdit').val();
		$("#infoTitle").html(currentTitle);
		document.getElementById("infoTitle").style.display = 'block';
		$("#titleEdit").remove();

	}

	editingTitle = !editingTitle;
}

function editDescription()
{
	if(!editingDescription)
	{
		$("#infoDescription").before('<input type="text" id = "descriptionEdit" class = "editingBox" name="" value="'+$("#infoDescription").html()+'">');
		document.getElementById("infoDescription").style.display = 'none';
	}
	else
	{
		currentDescription = $('#descriptionEdit').val();
		$("#infoDescription").html(currentDescription);
		document.getElementById("infoDescription").style.display = 'block';
		$("#descriptionEdit").remove();
	}

	editingDescription = !editingDescription;
}

function updateMarker(){

	if(currentMarker)
	{

		var ParseSpace = Parse.Object.extend("Spaces");
		var query = new Parse.Query(ParseSpace);
		var id = findId(currentMarker);
		$("#saving").show();
		query.get(id, {
		  success: function(object) {
			    var fileUploadControl = $("#file-input")[0];

				var file = fileUploadControl.files[0];

				if(file)
				{
					//name for the file
					var name = getFileName();
					//make the file ready for the DB
					var parseFile = new Parse.File(name, file);

					object.set("image2", parseFile);
					object.set("plantedTree", true);
					currentMarker.setIcon("../images/tree_small.png");		
					currentMarker.info.close();
					currentMarker = 0;
					removeMarker = false;
					object.save();		
				}
				else
				{
					alert("You must add an image!");
				}
				$("#saving").hide();
		  },
		  error: function(object, error) {
		    alert ("error "+ error.code);
				$("#saving").hide();
		  }
		});
	}
};

addSpaceContent = '<div id = "contentsDiv">' +
					'<h3 id = "infoTitle">'+currentTitle+'</h3><input class ="editButton"type=image src = "../images/pencil.png" onclick = "editTitle()"><div class="clear"></div>'+
					'<p id = "infoDescription">'+currentDescription+'</p> <input class ="editButton"type=image src = "../images/pencil.png" onclick = "editDescription()"><div class="clear"></div>' +
					'<div id = "spotPicture"></div>'+
					'<div id = "infoAddButton">'+
						'<div id="image-upload"><label for="file-input"><img id="image-label" src="../images/add_picture.png"/>'+
						'</label><input id="file-input" onchange="readURL(this)" type="file"/></div>'+
					'</div>'+
					'<div id = "AcceptButton">'+
						'<button onclick="saveMarker()">Accept</button>'+
					'</div>'+
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