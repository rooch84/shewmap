import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import d3 from 'd3';
import { initalizeToolip } from './modules/spc_map/src/tooltip.js';
import * as gridmap from './modules/spc_map/src/gridmap.js';
import * as Const from '../util/constants.js';
import FontIcon from 'material-ui/FontIcon';

const Data = new Mongo.Collection('gridData');

class GridMap extends Component {

  static defaultProps = {
    gridData: {_id: ""},
  };

  constructor(props) {
    super(props);

    this.state = {
      initRender: false,
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

    if (nextProps.ready) {
      if (nextProps.gridData._id !== this.props.gridData._id) {
        this.setState({initRender: true});
      }

      if (nextProps.opacity !== this.props.opacity) {
          gridmap.setOpacity(this.gridMapContainer, nextProps.opacity);
      }

      if (nextProps.highlightedCell !== this.props.highlightedCell) {
        gridmap.removeHighlight(this.gridMapContainer, "." + this.props.highlightedCell);
        gridmap.addHighlight(this.gridMapContainer, "." + nextProps.highlightedCell);
      }
    }
  }

  componentDidUpdate() {
    if (this.state.initRender) {
      let smwgData = d3.csvParse(this.props.gridData._id);

      let npuColours = d3.scaleOrdinal()
      .domain(d3.map(smwgData, function(d){return d.NPU;}).keys())
      .range(Const.npuColours);

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
        opacity: this.props.opacity,
        cellHoverHandler: this.props.handleHightedCell,
        cellSelectionHandler: this.props.handleCellSelection,
        cellDeselectionHandler: this.props.handleCellDeselection,
      });

      let signals = this.props.signals;
      let container = this.gridMapContainer;
      this.props.data.forEach(function(d) {

        //gridmap.addSignalsAsColourOnly({container: ".grid", cell: "." + d.key, signalData: properties[d.key], today: today});
        gridmap.processesAsBackgroundShade({container: container, cell: "." + d.key, signalData: signals[d.key],
          data: d.values, minY: d.min, maxY: d.max, meanLine: true});
        gridmap.addSignalsAsIcons({container: container, cell: "." + d.key, signalData: signals[d.key], today: d3.timeParse("%m-%Y")(1 + "-" + 2016), opacity: 0.8});
        //gridmap.addSignalsAsGlyphsAngleAsMean({container: ".grid", cell: "." + d.key, signalData: properties[d.key], data: d.values, today: today, opacity: 0.8, signalDescriptors: signalDescriptors});
        //gridmap.addSignalsAsTrendChannel({container: ".grid", cell: "." + d.key, signalData: properties[d.key], data: d.values, signalDescriptors: signalDescriptors});
      });

      this.setState({initRender: false});
    }

    if (this.props.resize && this.props.ready) {
      gridmap.resize(this.gridMapContainer);
    }
  }

  render() {

    return (
      <React.Fragment>
        <div className="component-container" ref={ (gridMapContainer) => this.gridMapContainer = gridMapContainer} ></div>
        <FontIcon className="selectionLock material-icons">{this.props.selectionLocked ? "lock_outline" : "lock_open"}</FontIcon>
      </React.Fragment>
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
