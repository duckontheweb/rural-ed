import React, { Component } from 'react';
import * as d3 from 'd3';

export default class MapLegend extends Component {
  render() {
    const categories = this.props.color.domain().reverse().map((x, i) => {
      let rowLabel;
      if (this.props.variable !== 'rural_des') {
        const lowerLabel = (i === this.props.color.domain().length - 1) ? 0 :
          this.props.color.domain().reverse()[i + 1];
        rowLabel = `${this.props.formatter(lowerLabel)}- ${this.props.formatter(x)}`
      } else {
        rowLabel = this.props.formatter(x);
      }

      return <div className="map-legend-row" key={`map-legend-row-${i}`}>
        <div
          style={{
            height: this.props.symbolHeight,
            width: this.props.symbolWidth,
            backgroundColor: this.props.color.range().reverse()[i]
          }}
          className="map-legend-symbol"
        />
        <label className="map-legend-label">{rowLabel}</label>
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
