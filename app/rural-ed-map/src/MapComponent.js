import React, { Component } from 'react';
import Dimensions from 'react-dimensions';
import * as topojson from 'topojson-client';
import * as d3 from 'd3';

import './Map.css';

// Extend d3
d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
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

class MapComponent extends Component {
  render() {

    // Get GeoJSON FeatureCollections and geometries
    const backgroundFeatures = topojson.feature(
      this.props.data,
      this.props.data.objects.districts_with_data
    );
    const shadowFeature = topojson.merge(
      this.props.data,
      this.props.data.objects.districts_with_data.geometries.filter((o) => {
        return o.properties[this.props.variable] ||
          (o.properties[this.props.variable] === 0);
      })
    )

    const dataObject = Object.assign(
      {},
      this.props.data.objects.districts_with_data,
      {
        geometries: this.props.data.objects.districts_with_data.geometries.filter((o) => {
          return o.properties[this.props.variable] ||
            (o.properties[this.props.variable] === 0);
        })
      }
    )
    const dataFeatures = topojson.feature(
      this.props.data,
      dataObject
    );

    // Set the color ramp
    const color = this.props.colorScales[this.props.variable];

    // Set the projection and path
    const path = d3.geoPath()
      .projection(
        d3.geoConicConformal()
          .rotate([105.5, -39.33333333333334])
          .fitExtent(
            [[20, 20],[this.props.containerWidth - 20, this.props.containerHeight - 20]],
            backgroundFeatures
          )
      )

    return <svg className="Map" height={this.props.containerHeight} width={this.props.containerWidth}>
      <defs>
        {/*filter for shadow effect*/}
        <filter id="dropshadow" height="130%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
          <feOffset dx="2" dy="2" result="offsetblur"/>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <g id="background-layer">
      {backgroundFeatures.features.map(f => {
        return <path
          key={f.properties.lgname}
          fill={this.props.backgroundFill}
          stroke={this.props.stroke}
          strokeWidth={this.props.strokeWidth}
          d={path(f)}
        />
      })}
      </g>
      <g id="shadow-layer">
        <path
        key="shadow-path"
        fill="white"
        stroke="#474747"
        strokeWidth="3"
        d={path(shadowFeature)}
        filter="url(#dropshadow)"
        />
      </g>
      <g id="data-layer">
        {dataFeatures.features.map(f => {
          return <path
            key={f.properties.lgname}
            fill={color(f.properties[this.props.variable])}
            stroke={this.props.stroke}
            strokeWidth={this.props.strokeWidth}
            className='data-feature'
            onMouseOver={(e) => {
              d3.select(e.target)
                .moveToFront()
                .attr('stroke', 'yellow')
                .attr('stroke-width', '2')
                .attr('fill-opacity', 0.8);
            }}
            onMouseOut={(e) => {
              d3.select(e.target)
                .attr('stroke', this.props.stroke)
                .attr('stroke-width', this.props.strokeWidth)
                .attr('fill-opacity', 1)
            }}
            d={path(f)}
          />
        })}
      </g>
    </svg>
  }
}

MapComponent.defaultProps = {
  stroke: 'white',
  strokeWidth: '0.5',
  backgroundFill: 'lightgray',
}

export default Dimensions({})(MapComponent);
