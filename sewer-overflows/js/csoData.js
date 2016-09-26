var csoLatLongs = {};
var csoEvents = [];

function readCsoPoints() {
    $.ajax({
        url: "data/outfall_points.csv",
        async: false,
        dataType: "text",
        success: function (csvd) {
            var csoPoints = $.csv.toObjects(csvd);
            for (var i = 0; i < csoPoints.length; i++) {
                csoPoint = csoPoints[i];
                csoLatLongs[csoPoint.outfall_name] = csoPoint;
            }
            drawMap();
        },
        error: function (xhr, textStatus, errorThrown) {
            alert('Failed to retrieve lat/longs: ' + textStatus);
        }


    })
}

function readCsoEvents(csoPoints) {
    $.ajax({
        url: "data/merged_cso_data.csv",
        async: false,
        dataType: "text",
        success: function (csvd) {
            csoEvents = $.csv.toObjects(csvd);
            drawMap();
        },
        error: function (xhr, textStatus, errorThrown) {
            alert('Failed to retrieve cso events: ' + textStatus);
        }


    })


    $.ajax({
        dataType: 'json',
        url: '/json/cumulative_outfall_duration.json',
        success: function (data) {

        }
    });

}

function drawMap() {
    if ((jQuery.isEmptyObject(csoLatLongs)) || (csoEvents.length == 0)) {
        return;
    }
    alert("We're Good!");
    for (var i = 0; i < data.length; i++) {

        var color = 'blue';
        if (i < 10) {
            color = 'red';
        } else {
            continue;
        }

        var circle = L.circle([data[i].lat, data[i].lon], 500, {
            color: color,
            fillColor: color,
            fillOpacity: 1
        }).addTo(mymap);

    }
}