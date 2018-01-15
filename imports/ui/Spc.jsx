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
    if (nextProps.highlightedCell !== this.props.highlightedCell) {
      this.setState({rendered: false});
      d3.select(this.spcElement).html("");
      for (let row of this.props.data) {
        if (row.key === nextProps.highlightedCell) {
          this.props.signals[nextProps.highlightedCell].colours = [this.props.signalAboveColour, this.props.signalBelowColour];
          spc.displayChart(row.values, this.spcElement, this.props.signals[nextProps.highlightedCell]);
          this.setState({rendered: true});
          break;
        }
      }
    }
  }

  componentDidUpdate() {
    if (this.props.resize && this.state.rendered) {
      spc.resizeChart(this.spcElement, this.props.signals[this.props.highlightedCell]);
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
