import React, { Component } from 'react';
import { FormGroup, ControlLabel, FormControl, Panel, Accordion, Table } from 'react-bootstrap';
import * as d3 from 'd3';
import { schemeBlues } from 'd3-scale-chromatic';

import './App.css';
import MapComponent from './MapComponent';
import MapLegend from './MapLegend';
import DistrictInfo from './DistrictInfo';

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

  onDistrictSelect(selectedDistrict) {
    this.setState({
      selectedDistrict
    });
  }

  render() {

    const color = colorScales[this.state.selectedVariable];
    const formatter = formatters[this.state.selectedVariable];

    return (
      <div className="App container-fluid">
        <div className="row">
          <section className="map-container col-md-9">
            <MapComponent
              data={mapData}
              variable={this.state.selectedVariable}
              color={color}
              onDistrictSelect={this.onDistrictSelect}
            />
          </section>
          <aside className="sidebar col-md-3">
            <Accordion defaultActiveKey="1">
              <Panel className="map-controls" header={<h3>Map Legend</h3>} eventKey="1">
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
              <Panel className="filters" header={<h3>Filters</h3>} eventKey="2">
                <section>
                  Coming Soon!
                </section>
              </Panel>
            </Accordion>
            <DistrictInfo
              formatters={formatters}
              district={this.state.selectedDistrict}
            />
          </aside>
        </div>
      </div>
    );
  }
}

export default App;
