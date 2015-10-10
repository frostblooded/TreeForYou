var map;
var marker;
var hasMarker = false;

function initMap() {
  map_div = document.getElementById('map');
  map = new google.maps.Map(map_div, {
    center: {lat: 42.662810, lng: 23.373413},
    zoom: 17,
    streetViewControl: false,
    mapTypeControl: true
  });


  google.maps.event.addListener(map, 'click', function(event) {

    if(hasMarker == true)
    {
        deleteMarker();
    }

    addMarker(event.latLng, map);
  });

}

  function addMarker(location, map) {
    // Add the marker at the clicked location, and add the title    

    var image = '../images/freespot.png';

    marker = new google.maps.Marker({
      position: location,
      title: "Marker title. Change if you want ??",
      map: map,
      icon: image
    });    

    hasMarker = true;
  }

function deleteMarker() {
    marker.setMap(null);
}