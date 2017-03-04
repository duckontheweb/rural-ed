import React, { Component } from 'react';
import * as d3 from 'd3';

export default class MapLegend extends Component {
  render() {
    const scale = this.props.colorScales[this.props.variable];
    const formatter = this.props.formatters[this.props.variable];
    const categories = scale.domain().reverse().map((x, i) => {
      return <div className="map-legend-row" key={`map-legend-row-${i}`}>
        <div
          style={{
            height: this.props.symbolHeight,
            width: this.props.symbolWidth,
            backgroundColor: scale.range()[i]
          }}
          className="map-legend-symbol"
        />
        <label className="map-legend-label">{formatter(x)}</label>
      </div>
    })
    return <div>
      {categories}
    </div>
  }
}

MapLegend.defaultProps = {
  symbolHeight: '20px',
  symbolWidth: '20px'
}
