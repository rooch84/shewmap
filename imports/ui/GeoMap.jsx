import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import d3 from 'd3';
import * as geo from './modules/spc_map/src/geomap.js';
import * as Const from '../util/constants.js';
import View from './View.jsx';

const Data = new Mongo.Collection('geoData');

class GeoMap extends Component {

  static defaultProps = {
    geoData: {_id: ""},
  };

  constructor(props) {
    super(props);

    this.geoData = {};

    this.state = {
      initRender: false,
    }
  };

  componentWillUpdate(nextProps, nextState) {
    if (nextProps.ready) {
      if (nextProps.geoData._id !== this.props.geoData._id && nextProps.ready) {
        this.setState({initRender: true});
      }

      if (nextProps.bgOpacity !== this.props.bgOpacity) {
        geo.setOpacity(this.geoMapContainer, nextProps.bgOpacity);
      }

      if (nextProps.highlightedCell !== this.props.highlightedCell) {

        if (this.props.highlightedCell.nest !== "all") {
          geo.removeHighlight(this.geoMapContainer, "." + this.props.highlightedCell.cell);
        }
        if (nextProps.highlightedCell.nest !== "all") {
          geo.addHighlight(this.geoMapContainer, "." + nextProps.highlightedCell.cell);
        }
      }

      if (
        nextProps.signalAboveColour !== this.props.signalAboveColour ||
        nextProps.signalBelowColour !== this.props.signalBelowColour ||
        nextProps.bgOpacity !== this.props.bgOpacity ||
        nextProps.signalChange !== this.props.signalChange
      ) {
        this.redraw(nextProps);
      }
    }
  }

  redraw = (props) => {
    let container = this.geoMapContainer;
    props.data.facet.data[0].values.forEach(function(d) {
      geo.resetCell({container: container, cell: "." + d.key} );

      if (props.facetOn === "__none__") {
        geo.addSignals({
          container: container,
          cell: "." + d.key,
          signalData: props.data.facet.data[0].props[d.key],
          today: d3.timeParse("%m-%Y")(1 + "-" + 2016),
          posColour: props.signalAboveColour,
          negColour: props.signalBelowColour,
        });
      }
    });
  }

  componentDidUpdate() {
    if (this.state.initRender) {

      this.geoData = JSON.parse(this.props.geoData._id);

      let npuColours = d3.scaleOrdinal()
      .domain(d3.map(this.geoData.features, function(d){return d.properties.NPU;}).keys())
      .range(Const.npuColours);

      let popColours = d3.scaleLinear()
      .domain(d3.extent(this.geoData.features, function(d) { return +d.properties.pop2011}))
      .range(["#00BDA6","#EB4551"]);

      let type = "NPU";

      geo.draw({
        data: this.geoData,
        container: this.geoMapContainer,
        tooltip: null,
        highlight: function(){},
        colourScale: type === "NPU" ? npuColours : popColours,
        colourAttribute: type,
        opacity: this.props.bgOpacity,
        cellHoverHandler: this.props.handleHightedCell,
        cellSelectionHandler: this.props.handleCellSelection,
        cellDeselectionHandler: this.props.handleCellDeselection,
      });
      this.redraw(this.props);
      this.setState({initRender: false});
    }

    if (this.props.resize && this.props.ready) {
      geo.resize({data: this.geoData, container: this.geoMapContainer});
      this.props.resizeComplete();
    }
  }

  render() {

    return (
      <View name={this.props.type} container={this.geoMapContainer} saveEnabled={true}>
        <div className="component-container" ref={ (e) => this.geoMapContainer = e}  >
        </div>
      </View>
    );
  }
}

GeoMap.propTypes = {
  geoData: PropTypes.object,
  ready: PropTypes.bool.isRequired,

};

export default withTracker((props) => {
  const handler = Meteor.subscribe('geoData');
  return {
    ready: handler.ready(),
    geoData: Data.findOne(),
  };
})(GeoMap);
