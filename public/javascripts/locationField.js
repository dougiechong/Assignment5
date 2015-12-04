$(document).ready(function(){
    geocoder = new google.maps.Geocoder();

    var input = /** @type {HTMLInputElement} */(
        document.getElementById('location'));
    if(input) {
        var autocomplete = new google.maps.places.Autocomplete(input);
    }
    
    // only if the user selects the location dropdown on the search bar
    searchgeocoder = new google.maps.Geocoder();
    $('#searchform').on('click', '#searchfield', checkiflocation);

});
    

var checkiflocation = function(){
    var checkiflocationvalue = document.getElementById('searchfield').value;
    console.log("checkiflocation  "+ checkiflocationvalue);

    if (checkiflocationvalue == 'location')
    {
        var input = /** @type {HTMLInputElement} */(
            document.getElementById('searchterm'));
        if(input) {
            var autocomplete = new google.maps.places.Autocomplete(input);
        }
    }

};