import React, { Component } from 'react';

import * as d3 from 'd3';
import * as spc from './modules/spc_chart/src/spc.js'
import View from './View.jsx';

export default class Spc extends Component {

  constructor(props) {
    super(props);
    this.spcElement;
    this.state = {rendered: false};
  };

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.highlightedCell !== this.props.highlightedCell  ||
      nextProps.signalChange !== this.props.signalChange
    ) {
      let rendered = false;
      d3.select(this.spcElement).html("");
      let signals = {};
      if (nextProps.highlightedCell.nest === "facet") {
        for (let facet of this.props.data.facet.data) {
          if (facet.key === nextProps.highlightedCell.facet) {
            for (let row of facet.values) {
              if (row.key === nextProps.highlightedCell.cell) {
                facet.props[nextProps.highlightedCell.cell].colours = [this.props.signalAboveColour, this.props.signalBelowColour];
                spc.displayChart(row.values, this.spcElement, facet.props[nextProps.highlightedCell.cell], this.updateSignals(nextProps.highlightedCell));
                signals = facet.props[nextProps.highlightedCell.cell];
                rendered = true;
                break;
              }
            }
          }
        }
      } else if (nextProps.highlightedCell.nest === "all") {
        nextProps.data.all.props.colours = [this.props.signalAboveColour, this.props.signalBelowColour];
        spc.displayChart(nextProps.data.all.data, this.spcElement, nextProps.data.all.props, this.updateSignals(nextProps.highlightedCell));
        signals = nextProps.data.all.props;
        rendered = true;
      } else if (nextProps.highlightedCell.nest === "neighbourhood" || nextProps.highlightedCell.nest === "npu") {
        let data = nextProps.data[nextProps.highlightedCell.nest];
        for (let row of data.data) {
          if (row.key === nextProps.highlightedCell.cell) {
            data.props[nextProps.highlightedCell.cell].colours = [this.props.signalAboveColour, this.props.signalBelowColour];
            spc.displayChart(row.values, this.spcElement, data.props[nextProps.highlightedCell.cell], this.updateSignals(nextProps.highlightedCell));
            signals = data.props[nextProps.highlightedCell.cell];
            rendered = true;
            break;
          }
        }
      }
      this.setState({rendered: rendered, signals: signals});
    }
  }

  updateSignals = (cell) => {
    return (s) => {
      this.props.onSignalsChange(cell, s);
    }
  }

  componentDidUpdate() {
    if (this.props.resize && this.state.rendered) {
      spc.resizeChart(this.spcElement, this.state.signals);
      this.props.resizeComplete();
    }
  }

  render() {
    return (
      <View name={this.props.type} container={this.spcElement} saveEnabled={true}>
        <div className="component-container" ref={ (e) => this.spcElement = e} >
        </div>
      </View>
    );
  }
}
