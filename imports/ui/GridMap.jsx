import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import d3 from 'd3';
import { initalizeToolip } from './modules/spc_map/src/tooltip.js';
import * as gridmap from './modules/spc_map/src/gridmap.js';
const Data = new Mongo.Collection('gridData');

class GridMap extends Component {

  static defaultProps = {
    gridData: {_id: ""},
  };

  constructor(props) {
    super(props);

    this.state = {

      initRender: false,
      resize: false
    }
  };

  onResize = () => {
    gridmap.resize(this.gridMapContainer);
    //gridmap.clearCells(this.gridMapContainer);
    //crimeData.forEach(function(d) {
    //  gridmap.processesAsBackgroundShade({container: ".grid", cell: "." + d.key, signalData: properties[d.key],
    //  data: d.values, signalDescriptors: signalDescriptors, minY: d.min, maxY: d.max, meanLine: true});
    //});
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextProps.gridData._id !== this.props.gridData._id && nextProps.ready) {
      this.setState({initRender: true});
    }

    if (nextProps.w != this.props.w || nextProps.h != this.props.h) {
      this.setState({resize: true});
    }
  }

  componentDidUpdate() {
    if (this.state.initRender) {
      let smwgData = d3.csvParse(this.props.gridData._id);

      let npuColours = d3.scaleOrdinal()
      .domain(d3.map(smwgData, function(d){return d.NPU;}).keys())
      .range(["#197F8E", "#B33355", "#02B395",  "#A3CD00", "#FF6529",  "#1E425C", "#E62A3D", "#FFBA00"]);

      let popColours = d3.scaleLinear()
      .domain(d3.extent(smwgData, function(d) { return +d.pop2011}))
      .range(["#00BDA6","#EB4551"]);

      let data = smwgData
      let type = "NPU";
      let opacity = 0.5;
      d3.select(this.gridMapContainer).html("");
      gridmap.draw({
        data: data,
        container: this.gridMapContainer,
        tooltip: initalizeToolip('body'),
        colourScale: type === "NPU" ? npuColours : popColours,
        colourAttribute: type,
        strokeColour : function (d) { return "#FFFFFF";},
        offsetX: 1,
        offsetY: 0,
        opacity: opacity
      });

      this.setState({initRender: false});
    }

    if (this.state.resize) {
      gridmap.resize(this.gridMapContainer);
      this.setState({resize: false});
    }
  }

  render() {

    return (
      <div className="component-container" ref={ (gridMapContainer) => this.gridMapContainer = gridMapContainer}  >

      </div>
    );
  }
}

GridMap.propTypes = {
  gridData: PropTypes.object,
  ready: PropTypes.bool.isRequired,

};

export default withTracker((props) => {
  const handler = Meteor.subscribe('gridData');
  return {
    ready: handler.ready(),
    gridData: Data.findOne(),
  };
})(GridMap);
