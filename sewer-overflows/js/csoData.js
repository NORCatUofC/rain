var csoLatLongs = {};
var csoEvents = [];
var markers = [];

const CUMULATIVE = "cumulative"; 

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
            drawMap(CUMULATIVE, csoEvents);
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
            drawMap(CUMULATIVE, csoEvents);
        },
        error: function (xhr, textStatus, errorThrown) {
            alert('Failed to retrieve cso events: ' + textStatus);
        }

    })
}

function drawMap(mapType, argCsoEvents) {
    if ((jQuery.isEmptyObject(csoLatLongs)) || (csoEvents.length == 0)) {
        return;
    }
    
    if (mapType == CUMULATIVE) {
        drawCumulative(argCsoEvents);
    }
}

// When the dates are changed, update the values
$("#slider").bind("valuesChanged", function(e, data){
    var modifiedCsoEvents = [];
    var a = Object.prototype.toString.call(data.values.min);
    var startDate = data.values.min;
    var endDate = data.values.max;
    for (var i = 0; i < csoEvents.length; i++) {
        var csoEvent = csoEvents[i];
        var csoStart = new Date(csoEvent['Open date/time']);
        var csoEnd = new Date(csoEvent['Close date/time']);
        if ((startDate <= csoStart) && (endDate >= csoEnd)) {
            modifiedCsoEvents.push(csoEvent);
        }
        
    }
    drawMap(CUMULATIVE, modifiedCsoEvents);
});
    
    
function drawCumulative(argCsoEvents) {

    // Find cumulative for outfall points
    var cumulative = {};
    for (var i = 0; i < argCsoEvents.length; i++) {
        var csoEvent = argCsoEvents[i];
        if (csoEvent['Outfall Structure'] in csoLatLongs) {
            if (!(csoEvent['Outfall Structure'] in cumulative)) {
                cumulative[csoEvent['Outfall Structure']] = 0.0;
            }
            cumulative[csoEvent['Outfall Structure']] += parseFloat(csoEvent['Duration_mins']);
        }
    }
    
    var data = dictToSortedList(cumulative);
    clearMarkers();
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
        markers.push(circle);
        
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

function clearMarkers() {
    for (var i = 0; i < markers.length; i++) {
        mymap.removeLayer(markers[i]);
    }
    markers = [];
}