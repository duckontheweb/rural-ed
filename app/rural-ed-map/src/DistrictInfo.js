import React, { Component } from 'react';
import { Table, Panel } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';

export default class DistrictInfo extends Component {
  constructor(props) {
    super(props);
    this.onDistrictSelect = this.onDistrictSelect.bind(this);
  }

  onDistrictSelect(selected) {
    const selectedFeature = selected.length ? selected[0] : null;
    if (selectedFeature) {
      let newDistrict;
      for (let i = 0; i < this.props.districts.length; i++) {
        if (selected[0].gid === this.props.districts[i].properties.gid) {
          newDistrict = this.props.districts[i];
          break;
        }
      }
      this.props.onDistrictSelect(newDistrict);
    }
  }

  render() {
    // console.log(this.props.districts)
    const options = this.props.districts.map(o => o.properties);
    const districtInfoContent = <div>
        <header>
          <h3 className="district-info-title"><Typeahead
            key={this.props.district ? `auto-complete-${this.props.district.properties.gid}` : 'none-selected'}
            labelKey='lgname'
            options={options}
            selected={this.props.district ? [this.props.district.properties.lgname] : []}
            placeholder="Choose a district..."
            onChange={this.onDistrictSelect}
          /></h3>
          {this.props.district && <a className="district-info-link" href={this.props.district.properties.link} target="_blank">Go to District Website</a>}
        </header>
        {this.props.district && <Table striped bordered condensed>
          <tbody>
            <tr>
              <td className="district-info-label">Rural Designation</td>
              <td className="district-info-value">{this.props.district.properties.rural_des}</td>
            </tr>
            <tr>
              <td className="district-info-label">Percent Minority</td>
              <td className="district-info-value">{
                this.props.formatters.per_minorities(this.props.district.properties.per_minorities)
              }</td>
            </tr>
            <tr>
              <td className="district-info-label">Percent Free/Reduced Lunch</td>
              <td className="district-info-value">{
                this.props.formatters.per_free_reduced(this.props.district.properties.per_free_reduced)
              }</td>
            </tr>
            <tr>
              <td className="district-info-label">Total Students</td>
              <td className="district-info-value">{this.props.district.properties.total_students}</td>
            </tr>
          </tbody>
        </Table>}
      </div>

      return <Panel className="district-info" header={<h3>District Information</h3>}>
          {districtInfoContent}
      </Panel>
  }
}
