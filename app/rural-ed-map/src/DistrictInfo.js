import React, { Component } from 'react';
import { Table, Panel } from 'react-bootstrap';

export default class DistrictInfo extends Component {
  render() {
    console.log(this.props.district)
    const districtInfoContent = !this.props.district ?
      'Click one of the highlighted districts for more information' :<div>
        <header>
          <h3 className="district-info-title">{this.props.district.properties.lgname}</h3>
          <a className="district-info-link" href={this.props.district.properties.link} target="_blank">Go to District Website</a>
        </header>
        <Table striped bordered condensed>
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
        </Table>
      </div>

      return <Panel className="district-info" header={<h3>District Information</h3>}>
          {districtInfoContent}
      </Panel>
  }
}
