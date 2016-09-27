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
$("#slider").bind("valuesChanged", function (e, data) {
    var modifiedCsoEvents = [];
    var startDate = data.values.min.setHours(0, 0, 0, 0, 0);;
    var endDate = data.values.max.setHours(0, 0, 0, 0, 0);;
    for (var i = 0; i < csoEvents.length; i++) {
        var csoEvent = csoEvents[i];
        var csoStart = new Date(csoEvent['Open date/time']).setHours(0, 0, 0, 0, 0);;
        var csoEnd = new Date(csoEvent['Close date/time']).setHours(0, 0, 0, 0, 0);;
        if ((startDate <= csoStart) && (endDate >= csoEnd)) {
            modifiedCsoEvents.push(csoEvent);
        }

    }
    drawMap(CUMULATIVE, modifiedCsoEvents);
});

$(".dateRange").focusout(function () {

    var startDateStr = $("#startDate").val();
    var endDateStr = $("#endDate").val();

    if (!isValidDate(startDateStr)) {
        alert("Start Date must be a valid date between 2009 and 2016 in the format MM/DD/YYYY");
        $("#startDate").val('');
    }

    if (!isValidDate(endDateStr)) {
        alert("End Date must be a valid date between 2009 and 2016 in the format MM/DD/YYYY");
        $("#endDate").val('');
    }

    var modifiedCsoEvents = [];
    var startDate = new Date(startDateStr);
    var endDate = new Date(endDateStr);
    for (var i = 0; i < csoEvents.length; i++) {
        var csoEvent = csoEvents[i];
        var csoStart = new Date(csoEvent['Open date/time']).setHours(0, 0, 0, 0, 0);;
        var csoEnd = new Date(csoEvent['Close date/time']).setHours(0, 0, 0, 0, 0);;
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
    $.each(dict, function (key, value) {
        outfalls_by_num[value] = key;
        values.push(parseFloat(value));
    });

    values.sort(function (a, b) {
        return b - a;
    });
    retVal = [];
    for (i = 0; i < values.length; i++) {
        retVal.push({
            outfall_name: outfalls_by_num[values[i]],
            value: values[i]
        });
    }
    return retVal;
}

function clearMarkers() {
    for (var i = 0; i < markers.length; i++) {
        mymap.removeLayer(markers[i]);
    }
    markers = [];
}

function isValidDate(dateStr) {
    var dateSplit = dateStr.split('/');
    if (dateSplit.length != 3)
        return false;
    var month = parseInt(dateSplit[0]);
    if (isNaN(month) || month < 1 || month > 12)
        return false;
    var day = parseInt(dateSplit[1]);
    if (isNaN(day) || day < 1 || day > 31)
        return false;
    var year = parseInt(dateSplit[2]);
    if (isNaN(year) || year < 2009 || year > 2016)
        return false;

    return true;
}