import React, { Component } from 'react';
import * as d3 from 'd3';
import * as spc from './modules/spc_chart/src/spc.js'

export default class Spc extends Component {

  constructor(props) {
    super(props);
    this.spcElement;
  };

  componentWillUpdate(nextProps, nextState) {
    if (nextProps.highlightedCell !== this.props.highlightedCell) {
      d3.select(this.spcElement).html("");
      for (let row of this.props.data) {
        if (row.key === nextProps.highlightedCell) {
          spc.displayChart(row.values, this.spcElement, this.props.signals[nextProps.highlightedCell]);
          break;
        }
      }
    }
  }

  render() {
    return (
      <div className="component-container" ref={ (e) => this.spcElement = e} >
      </div>
    );
  }
}
