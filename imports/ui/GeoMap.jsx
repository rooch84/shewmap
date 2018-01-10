import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import d3 from 'd3';
import { initalizeToolip } from './modules/spc_map/src/tooltip.js';
import * as geo from './modules/spc_map/src/geomap.js';
import * as Const from '../util/constants.js';

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
        geo.removeHighlight(this.geoMapContainer, "." + this.props.highlightedCell);
        geo.addHighlight(this.geoMapContainer, "." + nextProps.highlightedCell);
      }
    }
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
        tooltip: initalizeToolip('body'),
        highlight: function(){},
        colourScale: type === "NPU" ? npuColours : popColours,
        colourAttribute: type,
        opacity: this.props.bgOpacity,
        cellHoverHandler: this.props.handleHightedCell,
      });

      this.setState({initRender: false});
    }

    if (this.props.resize && this.props.ready) {
      geo.resize({data: this.geoData, container: this.geoMapContainer});
    }
  }

  render() {

    return (
      <div className="component-container" ref={ (e) => this.geoMapContainer = e}  >
      </div>
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
