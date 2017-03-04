import React, { Component } from 'react';
import { FormGroup, ControlLabel, FormControl, Panel } from 'react-bootstrap';
import * as d3 from 'd3';
import { schemeBlues } from 'd3-scale-chromatic';

import './App.css';
import MapComponent from './MapComponent';
import MapLegend from './MapLegend';

import mapData from '../public/districts_with_data.topo.json';

const selectOptions = [{
  value: 'per_minorities',
  label: 'Percent Minorities'
}, {
  value: 'per_free_reduced',
  label: 'Percent Free/Reduced Lunch'
}, {
  value: 'rural_des',
  label: 'Rural Designation'
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
};

const formatters = {
  'rural_des': (label) => label,
  'per_free_reduced': d3.format(".0%"),
  'per_minorities': d3.format(".0%"),
};

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedVariable: 'rural_des'
    }

    this.onVariableSelect = this.onVariableSelect.bind(this);
  }

  onVariableSelect(e) {
    this.setState({
      selectedVariable: e.target.value
    });
  }

  render() {
    return (
      <div className="App container-fluid">
        <div className="row">
          <section className="map-container col-md-9">
            <MapComponent
              data={mapData}
              variable={this.state.selectedVariable}
              colorScales={colorScales}
            />
          </section>
          <aside className="sidebar col-md-3">
            <Panel className="map-controls" header={<h3>Map Controls</h3>}>
              <FormGroup controlId="map-form-control">
                <ControlLabel>Map Variable</ControlLabel>
                <FormControl componentClass="select" onChange={this.onVariableSelect}>
                  {selectOptions.map(option => {
                    return <option
                      key={option.value}
                      value={option.value}
                      selected={option.value === this.state.selectedVariable}
                    >
                      {option.label}
                    </option>
                  })}
                </FormControl>
              </FormGroup>
              <FormGroup>
                <ControlLabel>Map Legend</ControlLabel>
                <MapLegend
                  colorScales={colorScales}
                  variable={this.state.selectedVariable}
                  formatters={formatters}
                />
              </FormGroup>
            </Panel>
            <Panel className="filters" header={<h3>Filters</h3>}>
              <section>
                Coming Soon!
              </section>
            </Panel>
            <Panel
              className="district-info"
              header={<h3>District Information</h3>}
            >
              <section>
                Click one of the highlighted districts for more information
              </section>
            </Panel>
          </aside>
        </div>
      </div>
    );
  }
}

export default App;
