import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import d3 from 'd3';

import * as legend from './modules/spc_map/src/legend.js';
import * as Const from '../util/constants.js';
import View from './View.jsx';

const Data = new Mongo.Collection('regions');

class Legend extends Component {

  constructor(props) {
    super(props);
    this.legendElement;
    this.npuColourScale;

    this.state = {
      initRender: true
    }
  };

  componentWillUpdateProps(nextProps) {
    if (this.props.ready) {
      if (nextProps.bgOpacity != this.props.bgOpacity) {
        legend.setOpacity(this.legendElement, nextProps.bgOpacity);
      }
    }
  }

  componentDidUpdate() {
    if (this.props.ready) {
      if (this.state.initRender) {

        this.npuColourScale = d3.scaleOrdinal()
        .domain(Object.keys(this.props.regions.data))
        .range(Const.npuColours);
        this.drawLegend();

        this.setState({
          initRender: false
        })
      }
      if (this.props.resize) {
        this.drawLegend();
        this.props.resizeComplete();
      }
    }
  }

  drawLegend() {
    d3.select(this.legendElement).html("");
    legend.draw(
      this.legendElement,
      "discreet",
      this.npuColourScale,
      this.props.bgOpacity,
      this.props.handleHightedCell,
      this.props.handleCellSelection,
      this.props.handleCellDeselection,
      this.props.regions.data
    );
  }

  render() {
    return (
      <View name={this.props.type} container={this.legendElement} saveEnabled={true}>
        <div className="component-container" ref={ (e) => (this.legendElement = e)}>
        </div>
      </View>
    );
  }
}

Legend.propTypes = {
  regions: PropTypes.object,
  ready: PropTypes.bool.isRequired,

};

export default withTracker((props) => {
  const handler = Meteor.subscribe('regions');
  return {
    ready: handler.ready(),
    regions: Data.findOne(),
  };
})(Legend);
