d3.selection.prototype.moveToFront = function() {
    return this.each(function() {
        this.parentNode.appendChild(this);
    });
};

d3.selection.prototype.moveToBack = function() {
    return this.each(function() {
        var firstChild = this.parentNode.firstChild;
        if (firstChild) {
            this.parentNode.insertBefore(this, firstChild);
        }
    });
};

(function() {
    // Set up main elements
    const $map = $('#map');
    const $body = $('body');
    const mapWidth = +$map.outerWidth();
    const mapHeight = +$map.outerHeight();

    // Get initial variable
    const $variableSelect = $('[name="variable-select"]');
    const initialVariable = $variableSelect.val();

    d3.queue().defer(d3.json, "./districts_with_data.topo.json").await(ready);

    function ready(error, districts) {
        if (error)
            throw error;
        const geojsonData = topojson.feature(districts, districts.objects[Object.keys(districts.objects)[0]]);

        var path = d3.geoPath().projection(d3.geoConicConformal().rotate([105.5, -39.33333333333334]).fitExtent([
            [
                20, 20
            ],
            [
                mapWidth - 20,
                mapHeight - 20
            ]
        ], geojsonData));

        var color = d3.scaleThreshold().domain(d3.range(0.2, 1, 0.2)).range(d3.schemeBlues[5]);

        const mapLegend = createLegend('#map-legend');
        updateLegend(mapLegend, initialVariable, color);

        const districtsLayer = createMap('#map', geojsonData.features, path);
        const colorFunction = styleDistricts(districtsLayer, initialVariable, color);
        districtsLayer.on('mouseover', function () {
          if (d3.select(this).classed('no-data')) { return; }
          d3.select(this).moveToFront();
          d3.select(this)
            .attr('fill', '#fbffb5');
        }).on('mouseout', function () {
          d3.select(this).moveToBack();
          d3.select(this).transition().attr('fill', colorFunction);
        });

        // Add change listener for select
        $variableSelect.change(function (e) {
          const newVariable = String(e.target.value);
          updateLegend(mapLegend, newVariable, color);
          styleDistricts(districtsLayer, newVariable, color);
        })
    }

})();

function createMap(selector, features, path) {
  return d3.select(selector).append("g").attr("class", "districts").selectAll("path").data(features).enter().append("path").attr("d", path).classed('district', true);;
}

function styleDistricts(districtsLayer, attribute, colorScale) {
  let colorFunction;
  switch (attribute) {
    case 'rural_des':
      colorFunction = colorRuralDesignation;
      break;
    default:
      colorFunction = colorPercentage;
  }
  districtsLayer.attr("fill", colorFunction).classed('no-data', d => (!d.properties[attribute] && d.properties[attribute] !== 0)).classed(attribute, true);

  districtsLayer.selectAll(':not(.no-data)').moveToFront();

  return colorFunction;

  function colorPercentage(d) {
    let pointColor;
    if (d.properties[attribute] || d.properties[attribute] === 0) {
        pointColor = colorScale(d.properties[attribute]);
    } else {
        pointColor = 'lightgray';
    }
    return pointColor;
  }

  function colorRuralDesignation(d) {
    const value = d.properties[attribute];
    return value === 'Rural' ? '#31a354' : value === 'Small Rural' ? '#a1d99b' : 'lightgray';
  }
}

function createLegend(selector) {
  return d3.select(selector).append("g").attr("class", "key").attr("transform", "translate(0,6)");
}

function updateLegend(mapLegend, variable, colorScale) {
  var width = $(mapLegend.node()).closest('svg').width();

  mapLegend.selectAll("rect").remove();
  mapLegend.selectAll(".tick").remove();

  switch(variable) {
    case 'rural_des':
      createRuralDesignationLegend();
      break;
    default:
      createPercentLegend();
  }

  function createRuralDesignationLegend() {
    const categories = ['Small Rural', 'Rural'];
    const legendItems = mapLegend.selectAll(".legend-items").data(categories).enter().append("g").attr("transform", function(d, i) {
        return `translate(${i * (width/2)}, 0)`;
    });
    legendItems.append('rect').attr("height", 20).attr("width", 20).attr("height", 20).attr("fill", function(d, i) {
        return d === 'Rural' ? '#31a354' : '#a1d99b';
    });
    legendItems.append("text").attr('x', (d, i) => i === 0 ? 60 : 40).attr('y', 16).attr('font-size', 12).text(d => d).attr('fill', '#000').attr('text-anchor', 'left');
  }

  function createPercentLegend() {
    var xScale = d3.scaleLinear().domain([0, 1]).rangeRound([
        0.1 * width,
        0.9 * width
    ]);

    mapLegend.selectAll("rect").data(colorScale.range().map(function(d) {
        d = colorScale.invertExtent(d);
        if (d[0] == null)
            d[0] = xScale.domain()[0];
        if (d[1] == null)
            d[1] = xScale.domain()[1];
        return d;
    })).enter().append("rect").attr("height", 12).attr("x", function(d) {
        return xScale(d[0]);
    }).attr("width", function(d) {
        return xScale(d[1]) - xScale(d[0]);
    }).attr("fill", function(d) {
        return colorScale(d[0]);
    });

    mapLegend.call(d3.axisBottom(xScale).tickSize(16).tickFormat(function(x, i) {
        return `${Math.round(x * 100)}%`;
    }).tickValues(colorScale.domain())).select(".domain").remove();
  }
}
