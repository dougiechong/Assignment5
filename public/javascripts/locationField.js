$(document).ready(function(){
    geocoder = new google.maps.Geocoder();

    var input = /** @type {HTMLInputElement} */(
        document.getElementById('location'));
    if(input) {
        var autocomplete = new google.maps.places.Autocomplete(input);
    }
});