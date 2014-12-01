var INDEX_NAME =  9,
    INDEX_TYPE = 10,
    INDEX_ADDR = 13,
    INDEX_STATUS = 18,
    INDEX_FOOD = 19,
    INDEX_LAT = 22
    INDEX_LON = 23;

// var jsonLoaded = function(error, data) {
//     d3.select('.loading').remove();
//     d3.select('.controls').classed('hidden', false);

//     if (error) {
//         d3.select('body').append('div')
//             .text("Could not load data")
//             .classed('error', true);
//         return;
//     }

//     // basic chart setup
//     var body = d3.select('body');
//     var chart = body.append('div');
//     chart.classed('chart', true);
//     var rows = chart.selectAll('.row').data(data.data)
//         .enter().append('div');
//     rows.classed('row', true);
//     var getName = function(d,i,c) {
//         return d[INDEX_NAME];
//     };
//     rows.text(getName);

//     // set up basic text / name filter
//     var filterInput = d3.select('.controls input.filter');
//     filterInput.on('input', function(e) {
//         rows.classed('hidden', function(d,i,c) {
//             var filterProcessed = filterInput[0][0].value.toLowerCase();
//             var nameProcessed = d[INDEX_NAME].toLowerCase();
//             return nameProcessed.indexOf(filterProcessed) == -1;
//         });
//     });
// };

//d3.json('/sf-mobile-food-permits.json', jsonLoaded);

d3.json('/data/bay.json', function(error, data) {
    d3.select('.loading').remove();
    if (error) {
        console.log("An error occured: " + error);
    } else {
        var width = window.innerWidth,
            height = window.innerHeight;

        var svg = d3.select("body").append("svg")
            .attr("width", width)
            .attr("height", height);

        var geoData = topojson.feature(data.topo, data.topo.objects.geo);

        // get projection frame; based on mbostock SO answer:
        // http://stackoverflow.com/questions/14492284/center-a-map-in-d3-given-a-geojson-object
        var projection = d3.geo.albers().scale(1).translate([0,0]);
        var path = d3.geo.path().projection(projection);

        // Compute the bounds of a feature of interest, then derive scale & translate.
        var b = path.bounds(geoData.features[0]),
            s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
            t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
        projection.scale(s).translate(t);

        svg.selectAll(".geounit")
                .data(geoData.features)
            .enter().append("path")
                .attr("class", function(d) { 
                    return "geounit " + d.properties["AREA_NAME"].toLowerCase().replace(' ', '-');
                }).attr("d", path);

        var streetData = topojson.feature(data.topo, data.topo.objects.streets);

        svg.selectAll(".street")
                .data(streetData.features)
            .enter().append("path")
                .attr("class", function(d) {
                    var streetLabel = "null-st";
                    if (d.properties["STREET"]) {
                        streetLabel = d.properties["STREET"].toLowerCase().replace(/[^\w]/g, '-');
                        if (streetLabel.search(/[\d]/) == 0) {
                            streetLabel = 'num-' + streetLabel;
                        }
                    }
                    if (d.properties["ST_TYPE"]) {
                        streetLabel +=  '-' + d.properties["ST_TYPE"].toLowerCase();
                    }
                    return "street " + streetLabel;
                }).attr("d", path);

        svg.selectAll(".permit")
                .data(data["food-permits"].data)
            .enter().append("circle")
                .classed("permit", true)
                .attr("cx", function(d) {
                    return projection([d[INDEX_LON], d[INDEX_LAT]])[0];
                }).attr("cy", function(d) {
                    return projection([d[INDEX_LON], d[INDEX_LAT]])[1];
                }).attr("r", 5);
    }
});




