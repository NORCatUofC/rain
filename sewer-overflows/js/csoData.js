var csoLatLongs = {};
var csoEvents = [];

function readCsoPoints() {
    $.ajax({
        url: "/data/outfall_points.csv",
        async: false,
        dataType: "text",
        success: function (csvd) {
            var csoPoints = $.csv.toObjects(csvd);
            for (var i = 0; i < csoPoints.length; i++) {
                var csoPoint = csoPoints[i];
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
        url: "/data/merged_cso_with_durations.csv",
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
}

function drawMap() {
    if ((jQuery.isEmptyObject(csoLatLongs)) || (csoEvents.length == 0)) {
        return;
    }
    
    // Find cumulative for outfall points
    var cumulative = {};
    for (var i = 0; i < csoEvents.length; i++) {
        var csoEvent = csoEvents[i];
        if (csoEvent['Outfall Structure'] in csoLatLongs) {
            if (!(csoEvent['Outfall Structure'] in cumulative)) {
                cumulative[csoEvent['Outfall Structure']] = 0.0;
            }
            cumulative[csoEvent['Outfall Structure']] += parseFloat(csoEvent['Duration_mins']);
        }
    }
    
    var data = dictToSortedList(cumulative);
    
    for (var i = 0; i < data.length; i++) {

        var color = 'blue';
        var size = 200;
        if (i < 10) {
            color = 'red';
            size = 500;
        }
        
        var value = data[i];
        var point = csoLatLongs[value.outfall_name];

        var circle = L.circle([point.lat, point.lon], size, {
            color: color,
            fillColor: color,
            fillOpacity: 1
        }).addTo(mymap);
        
        circle.bindPopup(value.outfall_name + "<br>Cum. dump: " + value.value + " mins.");
        
    }
}

function dictToSortedList(dict) {
    outfalls_by_num = {}
    values = [];
    $.each( dict, function( key, value ) {
        outfalls_by_num[value] = key;
        values.push(parseFloat(value));
    });

    values.sort(function(a,b) { return b - a;});
    retVal = [];
    for (i = 0; i < values.length; i++) {
        retVal.push({outfall_name: outfalls_by_num[values[i]], value: values[i]});
    }
    return retVal;
    
        
    
}