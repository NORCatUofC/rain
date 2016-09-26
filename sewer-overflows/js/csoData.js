var csoLatLongs = [];
var csoEvents = [];

function readCsoPoints() {
    $.ajax({
        url: "data/outfall_points.csv",
        async: false,
        success: function (csvd) {
            var csoPoints = $.csv.toObjects(csvd);
            for (var i = 0; i < csoPoints.length; i++) {
    }
            readCsoEvents(csoPoints);
            alert(JSON.stringify(data));
        },
        error: function (xhr, textStatus, errorThrown) {
            alert('request failed');
        },
        dataType: "text",

    });

}

function readCsoEvents(csoPoints) {
    $.ajax({
        dataType: 'json',
        url: '/json/cumulative_outfall_duration.json',
        success: function (data) {
            for (var i = 0; i < data.length; i++) {
                
                var color = 'blue';
                if (i < 10) {
                    color = 'red';
                }
                else {
                    continue;
                }

                var circle = L.circle([data[i].lat, data[i].lon], 500, {
                    color: color,
                    fillColor: color,
                    fillOpacity: 1
                }).addTo(mymap);

            }
        }
    });

}

function drawMap() {
    if ((csoLatLongs.length == 0) || (csoEvents.length == 0)) {
        return;
    }
}
    