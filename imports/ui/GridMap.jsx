import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import d3 from 'd3';
import * as gridmap from './modules/spc_map/src/gridmap.js';
import * as Const from '../util/constants.js';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';

import View from './View.jsx';
import * as pngExport from '../util/pngExport.js';

export default class GridMap extends Component {

  constructor(props) {
    super(props);

    this.state = {
      initRender: 0,
      zoomMode: false
    }
  };

  onResize = () => {
    if (this.state.initRender == 2) {
      gridmap.resize(this.gridMapContainer);
      this.redraw(this.props);
    }
    //gridmap.clearCells(this.gridMapContainer);
    //crimeData.forEach(function(d) {
    //  gridmap.processesAsBackgroundShade({container: ".grid", cell: "." + d.key, signalData: properties[d.key],
    //  data: d.values, signalDescriptors: signalDescriptors, minY: d.min, maxY: d.max, meanLine: true});
    //});
    this.props.resizeComplete();
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextProps.gridData !== this.props.gridData && this.state.initRender == 0) {
      this.setState({initRender: 1});
    }

    if (nextProps.bgOpacity !== this.props.bgOpacity) {
      gridmap.setOpacity(this.gridMapContainer, nextProps.bgOpacity);
    }

    if (nextProps.highlightedCell !== this.props.highlightedCell) {
      gridmap.removeHighlight(this.gridMapContainer, "." + this.props.highlightedCell);
      gridmap.addHighlight(this.gridMapContainer, "." + nextProps.highlightedCell);
    }

    if (this.state.initRender == 2) {
      if (
        nextProps.signalOpacity !== this.props.signalOpacity ||
        nextProps.processOpacity !== this.props.processOpacity ||
        nextProps.processEnabled !== this.props.processEnabled ||
        nextProps.trendEnabled !== this.props.trendEnabled ||
        nextProps.trendHeight !== this.props.trendHeight ||
        nextProps.trendOverride !== this.props.trendOverride ||
        nextProps.signalEnabled !== this.props.signalEnabled ||
        nextProps.gaugeEnabled !== this.props.gaugeEnabled ||
        nextProps.gaugeException !== this.props.gaugeException ||
        nextProps.gaugeOpacity !== this.props.gaugeOpacity ||
        nextProps.gaugeColour !== this.props.gaugeColour ||
        nextProps.bgEnabled !== this.props.bgEnabled ||
        nextProps.bivariateSignalColours !== this.props.bivariateSignalColours ||
        nextProps.signalType !== this.props.signalType ||
        nextProps.signalColour !== this.props.signalColour ||
        nextProps.signalAboveColour !== this.props.signalAboveColour ||
        nextProps.signalBelowColour !== this.props.signalBelowColour
      ) {
        this.redraw(nextProps);
      }
    }

    if (nextState.zoomMode != this.state.zoomMode ) {
      gridmap.toggleZoomMode(this.gridMapContainer, nextState.zoomMode);
    }
  }

  handleZoomChange = () => {
    this.setState({zoomMode: !this.state.zoomMode});
  }

  redraw(props) {
    let signals = props.signals;
    let container = this.gridMapContainer;
    props.data.forEach(function(d) {
      gridmap.clearCell({container: container, cell: "." + d.key} );

      if (props.signalEnabled && !props.trendOverride) {
        if (props.signalType === "icon") {
          gridmap.addSignalsAsIcons({
            container: container,
            cell: "." + d.key,
            signalData: signals[d.key],
            today: d3.timeParse("%m-%Y")(1 + "-" + 2016),
            opacity: props.signalOpacity,
            colour: props.signalColour,
            posColour: props.signalAboveColour,
            negColour: props.signalBelowColour,
            bivariate: props.bivariateSignalColours,
            colourOverride: true,
            margin: props.trendEnabled ? props.trendHeight : 0
          });
        } else {
          gridmap.addSignalsAsColourOnly({
            container: container,
            cell: "." + d.key,
            signalData: signals[d.key],
            today: d3.timeParse("%m-%Y")(1 + "-" + 2016),
            opacity: props.signalOpacity,
            colour: props.signalColour,
            posColour: props.signalAboveColour,
            negColour: props.signalBelowColour,
            bivariate: props.bivariateSignalColours,
            colourOverride: true
          });
        }
      }

      if (props.processEnabled && !props.trendOverride) {
        gridmap.processesAsBackgroundShade({
          container: container,
          cell: "." + d.key,
          signalData: signals[d.key],
          data: d.values,
          minY: d.min,
          maxY: d.max,
          meanLine: true,
          opacity: props.processOpacity,
          margin: props.trendEnabled ? props.trendHeight : 0
        });
      }

      if (props.gaugeEnabled && !props.trendOverride) {
        gridmap.addSignalsAsGlyphsAngleAsMean({
          container: container,
          cell: "." + d.key,
          signalData: signals[d.key],
          data: d.values,
          today: d3.timeParse("%m-%Y")(1 + "-" + 2016),
          opacity: props.gaugeOpacity,
          exception: props.gaugeException,
          strokeColour: props.gaugeColour,
          posColour: props.signalAboveColour,
          negColour: props.signalBelowColour
        });
      }

      if (props.trendEnabled) {
        gridmap.addSignalsAsTrendChannel({
          container: container,
          cell: "." + d.key,
          signalData: signals[d.key],
          data: d.values,
          size: !props.trendOverride ? props.trendHeight : 0.5
        });

      }
      //gridmap.addSignalsAsGlyphsAngleAsMean({container: ".grid", cell: "." + d.key, signalData: properties[d.key], data: d.values, today: today, opacity: 0.8, signalDescriptors: signalDescriptors});
      //gridmap.addSignalsAsTrendChannel({container: ".grid", cell: "." + d.key, signalData: properties[d.key], data: d.values, signalDescriptors: signalDescriptors});
    });

  }

  componentDidUpdate() {
    if (this.state.initRender == 1) {
      let smwgData = this.props.gridData;

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
        tooltip: null,
        colourScale: type === "NPU" ? npuColours : popColours,
        colourAttribute: type,
        strokeColour : function (d) { return "#FFFFFF";},
        offsetX: 1,
        offsetY: 0,
        opacity: this.props.bgOpacity,
        cellHoverHandler: this.props.handleHightedCell,
        cellSelectionHandler: this.props.handleCellSelection,
        cellDeselectionHandler: this.props.handleCellDeselection,
      });
      this.redraw(this.props);

      this.setState({initRender: 2});
    }

    if (this.props.resize && this.state.initRender == 2) {
      this.onResize();
    }
  }

  render() {

    return (
      <View name={this.props.type} container={this.gridMapContainer} saveEnabled={true}>
        <React.Fragment>
          <div className="component-container" ref={ (gridMapContainer) => this.gridMapContainer = gridMapContainer} ></div>
          <FontIcon onClick={this.props.handleSelectionModeChange}
            className="selectionLock material-icons">{this.props.selectionLocked ? "lock_outline" : "lock_open"}</FontIcon>
          <FontIcon onClick={this.handleZoomChange} className="zoomOrSelect material-icons">{this.state.zoomMode ? "pan_tool" : "search"}</FontIcon>

        </React.Fragment>
      </View>
    );
  }
}
