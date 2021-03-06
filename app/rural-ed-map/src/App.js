import React, { Component } from 'react';
import { FormGroup, FormControl, Panel } from 'react-bootstrap';
import * as d3 from 'd3';
import { schemeBlues } from 'd3-scale-chromatic';
import * as topojson from 'topojson-client';

import './App.css';
import MapComponent from './MapComponent';
import MapLegend from './MapLegend';
import DistrictInfo from './DistrictInfo';

import mapData from '../public/districts_with_data.topo.json';
import citiesData from '../public/colorado_cities_ne.topo.json';
import roadsData from '../public/colorado_roads.topo.json';

const selectOptions = [{
  value: 'per_minorities',
  label: 'Percent Minorities',
}, {
  value: 'per_free_reduced',
  label: 'Percent Free/Reduced Lunch',
}, {
  value: 'rural_des',
  label: 'Rural Designation',
}, {
  value: 'school_week',
  label: 'School Week',
}];

const colorScales = {
  'rural_des': d3.scaleOrdinal()
    .domain(['Small Rural', 'Rural'])
    .range(['#a1d99b', '#31a354']),
  'per_free_reduced': d3.scaleThreshold()
    .domain([0.2, 0.4, 0.6, 0.8, 1.0])
    .range(schemeBlues[6].slice(1)),
  'per_minorities': d3.scaleThreshold()
    .domain([0.2, 0.4, 0.6, 0.8, 1.0])
    .range(schemeBlues[6].slice(1)),
  'school_week': d3.scaleOrdinal()
    .domain(['4-day', '5-day', 'Both'])
    .range(['#a6cee3', '#1f78b4', '#b2df8a'])
};

const formatters = {
  'rural_des': (label) => label,
  'per_free_reduced': d3.format(".0%"),
  'per_minorities': d3.format(".0%"),
  'school_week': (label) => label,
};

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedVariable: 'rural_des',
      selectedDistrict: null
    }

    this.onVariableSelect = this.onVariableSelect.bind(this);
    this.onDistrictSelect = this.onDistrictSelect.bind(this);
  }

  onVariableSelect(e) {
    this.setState({
      selectedVariable: e.target.value
    });
  }

  onDistrictSelect(feature) {
    const selectedDistrict = this.state.selectedDistrict &&
      (feature.properties.gid === this.state.selectedDistrict.properties.gid) ?
        null : feature;
    this.setState({
      selectedDistrict
    });
  }

  render() {
    const color = colorScales[this.state.selectedVariable];
    const formatter = formatters[this.state.selectedVariable];

    const dataObject = Object.assign(
      {},
      mapData.objects.districts_with_data,
      {
        geometries: mapData.objects.districts_with_data.geometries.filter((o) => {
          return o.properties[this.state.selectedVariable] ||
            (o.properties[this.state.selectedVariable] === 0);
        })
      }
    )
    const districts = topojson.feature(
      mapData,
      dataObject
    ).features;

    return (
      <div className="App container-fluid">
        <div className="row">
          <section className="map-container col-xs-9">
            <MapComponent
              data={mapData}
              cities={citiesData}
              roads={roadsData}
              variable={this.state.selectedVariable}
              color={color}
              onDistrictSelect={this.onDistrictSelect}
              selectedDistrict={this.state.selectedDistrict}
            />
          </section>
          <aside className="sidebar col-xs-3">
            <Panel className="map-controls" header={<h3>Map Legend</h3>} eventKey="1">
              <p>Select the variable you would like to view on the map.</p>
              <FormGroup controlId="map-form-control">
                <FormControl
                  componentClass="select"
                  onChange={this.onVariableSelect}
                  defaultValue={this.state.selectedVariable}
                >
                  {selectOptions.map(option => {
                    return <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  })}
                </FormControl>
              </FormGroup>
              <FormGroup>
                <MapLegend
                  color={color}
                  variable={this.state.selectedVariable}
                  formatter={formatter}
                />
              </FormGroup>
            </Panel>
            <DistrictInfo
              formatters={formatters}
              district={this.state.selectedDistrict}
              districts={districts}
              onDistrictSelect={this.onDistrictSelect}
            />
          </aside>
        </div>
      </div>
    );
  }
}

export default App;
