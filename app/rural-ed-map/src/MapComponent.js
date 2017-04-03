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
  constructor(props) {
    super(props);

    this.state = {
      popupContent: null,

    }
  }

  getStroke(feature) {
    const isSelected = !!this.props.selectedDistrict &&
      (feature.properties.gid === this.props.selectedDistrict.properties.gid)
    return  isSelected ? this.props.highlightStroke : this.props.stroke;
  }

  getStrokeWidth(feature) {
    const isSelected = !!this.props.selectedDistrict &&
      (feature.properties.gid === this.props.selectedDistrict.properties.gid)
    return  isSelected ? this.props.highlightStrokeWidth : this.props.strokeWidth;
  }

  getFill(feature) {
    const isSelected = !!this.props.selectedDistrict &&
      (feature.properties.gid === this.props.selectedDistrict.properties.gid)
    return  isSelected ? this.props.highlightFill : this.props.color(feature.properties[this.props.variable]);
  }

  getFillOpacity(feature) {
    const isSelected = !!this.props.selectedDistrict &&
      (feature.properties.gid === this.props.selectedDistrict.properties.gid)
    return  isSelected ? this.props.highlightFillOpacity : this.props.fillOpacity;
  }

  componentWillReceiveProps(nextProps) {
    this.handleNewProps(nextProps);
  }

  componentWillMount() {
    this.handleNewProps(this.props);
  }

  handleNewProps(nextProps) {

    if ((this.props.data !== nextProps.data) || (!this.props.dataPaths)) {
      // Render background and shadow
      const backgroundFeatures = topojson.feature(
        this.props.data,
        this.props.data.objects.districts_with_data
      );

      // Set the projection and path
      const projection = d3.geoConicConformal()
        .rotate([105.5, -39.33333333333334])
        .fitExtent(
          [[20, 20],[this.props.containerWidth - 20, this.props.containerHeight - 20]],
          backgroundFeatures
        );
      const path = d3.geoPath()
        .projection(projection)

      const backgroundPaths = backgroundFeatures.features.map(f => {
        return <path
          key={f.properties.lgname}
          fill={this.props.backgroundFill}
          stroke={this.props.stroke}
          strokeWidth={this.props.strokeWidth}
          d={path(f)}
        />
      });
      const shadowFeature = topojson.merge(
        this.props.data,
        this.props.data.objects.districts_with_data.geometries.filter((o) => {
          return o.properties[this.props.variable] ||
            (o.properties[this.props.variable] === 0);
        })
      );
      const shadowPath = <path
      key="shadow-path"
      fill="white"
      stroke="#474747"
      strokeWidth="3"
      d={path(shadowFeature)}
      filter="url(#dropshadow)"
      />;

      // District paths
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
      const dataPaths = dataFeatures.features.map(f => {
        return <path
          key={f.properties.lgname}
          fill={this.getFill(f)}
          fillOpacity={this.getFillOpacity(f)}
          stroke={this.getStroke(f)}
          strokeWidth={this.getStrokeWidth(f)}
          className='data-feature'
          onMouseOver={(e) => {
            d3.select(e.target)
              .moveToFront()
              .attr('stroke', this.props.highlightStroke)
              .attr('stroke-width', this.props.highlightStrokeWidth)
              .attr('fill-opacity', this.props.highlightFillOpacity);

            this.setState({
              popupContent: f.properties.lgname,
              popupX: e.pageX,
              popupY: e.pageY
            })
          }}
          // onMouseMove={(e) => {
          //   this.setState({
          //     popupX: e.pageX,
          //     popupY: e.pageY
          //   })
          // }}
          onMouseOut={(e) => {
            d3.select(e.target)
              .attr('stroke', this.getStroke(f))
              .attr('stroke-width', this.getStrokeWidth(f))
              .attr('fill-opacity', this.getFillOpacity(f))

            this.setState({
              popupContent: null
            })
          }}
          onClick={() => this.props.onDistrictSelect(f)}
          d={path(f)}
        />
      });

      const citiesFeatures = topojson.feature(
        this.props.cities,
        this.props.cities.objects['colorado_cities_ne.geo']
      );
      const cityPaths = citiesFeatures.features.map(f => {
        return <circle
          key={f.properties.name}
          cx={projection(f.geometry.coordinates)[0]}
          cy={projection(f.geometry.coordinates)[1]}
          r="5"
          fill="#cf5300"
          stroke="black"
          strokeWidth="1"
          filter="url(#circle-dropshadow)"
        />
      });
      const cityLabels = citiesFeatures.features.map(f => {
        return <text
          key={f.properties.name}
          x={projection(f.geometry.coordinates)[0] + this.props.labelOffset.x}
          y={projection(f.geometry.coordinates)[1] +
            this.props.labelOffset.y + (f.properties.name === 'Aurora' ? 10 : 0)}
          fill="black"
          style={{
            pointerEvents: 'none',
          }}
        >{f.properties.name}</text>
      });

      const roadsFeatures = topojson.feature(
        this.props.roads,
        this.props.roads.objects.highways
      );
      const roadPaths = roadsFeatures.features.map((f, i) => {
        return <path
          key={`roads-feature-${f.properties.ref}-${i}`}
          fill='none'
          stroke='#2400b3'
          d={path(f)}
        />
      });

      this.setState({
        backgroundPaths,
        shadowPath,
        dataPaths,
        roadPaths,
        cityPaths,
        cityLabels,
      });
    }

  }

  render() {
    // Get GeoJSON FeatureCollections and geometries

    return <div style={{position: 'relative'}}><svg className="Map" height={this.props.containerHeight} width={this.props.containerWidth}>
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
        <filter id="circle-dropshadow" x="-20%" y="-20%" width="200%" height="200%">
          <feOffset result="offOut" in="SourceAlpha" dx="1" dy="1" />
          <feGaussianBlur result="blurOut" in="offOut" stdDeviation="1" />
          <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
        </filter>
      </defs>
      <g id="background-layer">
      {this.state.backgroundPaths}
      </g>
      <g id="shadow-layer">
        {this.state.shadowPath}
      </g>
      <g id="data-layer">
        {this.state.dataPaths}
      </g>
      {<g id="roads-layer">
        {this.state.roadPaths}
      </g>}
      <g id="cities-layer">
        {this.state.cityPaths}
        {this.state.cityLabels}
      </g>
    </svg>
    {this.state.popupContent && <div className="map-popup" style={{
      top: this.state.popupY,
      left: this.state.popupX
    }}>
      {this.state.popupContent}
    </div>}
    </div>
  }
}

MapComponent.defaultProps = {
  stroke: 'white',
  strokeWidth: '0.5',
  fillOpacity: '1',
  backgroundFill: 'lightgray',
  highlightStroke: 'yellow',
  highlightStrokeWidth: '2',
  highlightFill: '#f0f285',
  highlightFillOpacity: '0.8',
  labelOffset: {
    x: 10,
    y: -4
  }
}

export default Dimensions({})(MapComponent);
