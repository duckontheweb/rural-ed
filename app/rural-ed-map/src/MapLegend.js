import React, { Component } from 'react';
import * as d3 from 'd3';

export default class MapLegend extends Component {
  render() {
    const categories = this.props.color.domain().reverse().map((x, i) => {
      return <div className="map-legend-row" key={`map-legend-row-${i}`}>
        <div
          style={{
            height: this.props.symbolHeight,
            width: this.props.symbolWidth,
            backgroundColor: this.props.color.range()[i]
          }}
          className="map-legend-symbol"
        />
        <label className="map-legend-label">{this.props.formatter(x)}</label>
      </div>
    })
    return <div>
      {categories}
      <div className="map-legend-row" key="map-legend-row-no-data">
      <div
        style={{
          height: this.props.symbolHeight,
          width: this.props.symbolWidth,
          backgroundColor: 'lightgray'
        }}
        className="map-legend-symbol"
      />
      <label className="map-legend-label">No Data</label>
      </div>
    </div>
  }
}

MapLegend.defaultProps = {
  symbolHeight: '20px',
  symbolWidth: '20px'
}
