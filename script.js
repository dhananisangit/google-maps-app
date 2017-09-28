var geocoder;
var map;
var markers = Array();
var infos = Array();

// initialization
google.maps.event.addDomListener(window, 'load', initMap);

function initMap() {
    // prepare Geocoder
    geocoder = new google.maps.Geocoder();
    // set initial position (New York)
    var myLatlng = new google.maps.LatLng(40.7143528,-74.0059731);
    // default map options
    var myOptions = {
        zoom: 14,
        center: myLatlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById('gmap_canvas'), myOptions);
}


// find address function
function findAddress() {
    var address = document.getElementById("gmap_where").value;

    // script uses our 'geocoder' in order to find location by address name
    clearPlaces();
    clearInfoWindows();
    geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) { // and, if everything is ok

            // we will center map
            var addrLocation = results[0].geometry.location;
            map.setCenter(addrLocation);

            // store current coordinates into hidden variables
            document.getElementById('lat').value = results[0].geometry.location.lat();
            document.getElementById('lng').value = results[0].geometry.location.lng();

            // and then - add new custom marker
            var addrMarker = new google.maps.Marker({
                position: addrLocation,
                map: map,
                title: results[0].formatted_address,
                icon: 'marker.png'
            });
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}

// find custom places function
function findPlaces() {
    clearPlaces();
    clearInfoWindows();
    // prepare variables (filter)
    var type = document.getElementById('gmap_type').value;
    var radius = document.getElementById('gmap_radius').value;
    // var keyword = document.getElementById('gmap_keyword').value;

    var lat = document.getElementById('lat').value;
    var lng = document.getElementById('lng').value;
    var cur_location = new google.maps.LatLng(lat, lng);

    // prepare request to Places
    var request = {
        location: cur_location,
        radius: radius,
        types: [type]
    };

    // send request
    service = new google.maps.places.PlacesService(map);
    service.search(request, createMarkers);
}

// create markers (from 'findPlaces' function)
function createMarkers(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {

        // if we have found something - clear map
        clearPlaces();
        // and create new markers by search result
        for (var i = 0; i < results.length; i++) {
            createMarker(results[i]);
        }
    } else if (status == google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
        alert('Sorry, nothing is found');
    }
}

// creare single marker function
function createMarker(obj) {
    var mark = new google.maps.Marker({
        position: obj.geometry.location,
        map: map,
        title: obj.name
    });

    var div = document.getElementById('list');
    var node = document.createElement("H4");
    var textnode = document.createTextNode(obj.name);
    node.id= obj.name;
    node.data = obj;
    node.appendChild(textnode);
    div.appendChild(node);

    node.addEventListener("mouseover", mouseOver);
    markers.push(mark);
    var infowindow = openInfoWindow(obj)
    // add event handler to current marker
    google.maps.event.addListener(mark, 'click', function() {
        clearInfoWindows();
        infowindow.open(map,mark);
    });
    infos.push(infowindow);

}


function openInfoWindow(obj){
    return new google.maps.InfoWindow({
        content: '<img src="' + obj.icon + '" /><font style="color:#000;"><h3>'+ obj.name +
        '</h3>Rating: ' + obj.rating + '<br />Address: ' + obj.vicinity + '</font>'
    });
}


function mouseOver(e){
    var targetDiv = e.target.data
    var mark = new google.maps.Marker({
        position: targetDiv.geometry.location,
        map: map,
        title: e.target.id
    });
    for(var i=0;i<infos.length;i++){
        if(infos[i].content.indexOf(e.target.id) > 0){
            var infowindow = openInfoWindow(targetDiv)
            infowindow.open(map,mark);

        }

    }
}

// clear places function
function clearPlaces() {
    var node  = document.getElementById("list");
    while (node.hasChildNodes()) {
    node.removeChild(node.lastChild);
}
    if (markers) {
        for (i in markers) {
            markers[i].setMap(null);
        }
        markers = [];
        infos = [];
    }
}

//clear infoWindow function
function clearInfoWindows() {
    if (infos) {
        for (i in infos) {
            if (infos[i].getMap()) {
                infos[i].close();
            }
        }
    }
}
