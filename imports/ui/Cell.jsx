import React, { Component } from 'react';
import * as d3 from 'd3';
import * as gridmap from './modules/spc_map/src/gridmap.js';

export default class GeoMap extends Component {

  constructor(props) {
    super(props);
    this.cellContainer;
  };

  componentWillUpdate(nextProps, nextState) {
    if (nextProps.highlightedCell !== this.props.highlightedCell) {
      let signals = this.props.signals;
      d3.select(this.cellContainer).html("");
      for (let row of this.props.data) {
        if (row.key === nextProps.highlightedCell) {
          gridmap.initCell(this.cellContainer, row.key);
          gridmap.processesAsBackgroundShade({container: this.cellContainer, cell: "." + row.key, signalData: signals[row.key],
            data: row.values, minY: row.min, maxY: row.max, meanLine: true});
          gridmap.addSignalsAsIcons({container: this.cellContainer, cell: "." + row.key, signalData: signals[row.key], today: d3.timeParse("%m-%Y")(1 + "-" + 2016), opacity: 0.8});
          break;
        }
      }
    }
  }

  render() {
    return (
      <div className="component-container cell-view"  ref={ (e) => {this.cellContainer = e} }> </div>
    );
  }
}
