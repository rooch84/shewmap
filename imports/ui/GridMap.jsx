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
      this.redraw(this.props);
    }
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

      if (this.props.highlightedCell.nest !== "all") {
        gridmap.removeHighlight(this.gridMapContainer, "." + this.props.highlightedCell.cell);
      }
      if (nextProps.highlightedCell.nest !== "all") {
        gridmap.addHighlight(this.gridMapContainer, "." + nextProps.highlightedCell.cell);
      }
    }

    if (this.state.initRender == 2) {
      if (
        nextProps.signalOpacity !== this.props.signalOpacity ||
        nextProps.processOpacity !== this.props.processOpacity ||
        nextProps.processEnabled !== this.props.processEnabled ||
        nextProps.processScale !== this.props.processScale ||
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
        nextProps.signalBelowColour !== this.props.signalBelowColour ||
        nextProps.signalChange !== this.props.signalChange
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

  handleZoomReset = () => {
    gridmap.resetZoom(this.gridMapContainer);
  }

  redraw(props) {
    let container = this.gridMapContainer;

    let npuColours = d3.scaleOrdinal()
    .domain(d3.map(this.props.gridData, function(d){return d.NPU;}).keys())
    .range(Const.npuColours);

    d3.select(this.gridMapContainer).html("");

    gridmap.drawMultiple(props.data.facet.data.map( d => {return {label: d.key, class: d.uuid}} ), {
      data: props.gridData,
      container: this.gridMapContainer,
      tooltip: null,
      colourScale: npuColours,
      colourAttribute: "NPU",
      strokeColour : function (d) { return "#FFFFFF";},
      offsetX: 1,
      offsetY: 0,
      opacity: props.bgOpacity,
      cellHoverHandler: props.handleHightedCell,
      cellSelectionHandler: props.handleCellSelection,
      cellDeselectionHandler: props.handleCellDeselection,
    });

    gridmap.toggleZoomMode(this.gridMapContainer, this.state.zoomMode);

    props.data.facet.data.forEach(function(facet) {
      facet.values.forEach(function(d) {
        gridmap.clearCell({container: container, facet: facet.uuid, cell: "." + d.key} );
        if (props.signalEnabled && !props.trendOverride) {
          if (props.signalType === "icon") {
            gridmap.addSignalsAsIcons({
              container: container,
              facet: "." + facet.uuid,
              cell: "." + d.key,
              signalData: facet.props[d.key],
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
              facet: "." + facet.uuid,
              cell: "." + d.key,
              signalData: facet.props[d.key],
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
          let min = 0;
          let max = 0;
          let field = "Count";
          switch(props.processScale) {
            case "global":
            min = d.minGlobalCount;
            max = d.maxGlobalCount;
            break;
            case "local":
            min =  d.min;
            max = d.max;
            break;
            case "globalVar":
            min = d.minGlobalVar;
            max = d.maxGlobalVar;
            break;
            case "volume":
            min = d.minVolume;
            max = d.maxVolume;
            field = "Volume";
            break;
          }
          gridmap.processesAsBackgroundShade({
            container: container,
            facet: "." + facet.uuid,
            cell: "." + d.key,
            signalData: facet.props[d.key],
            data: d.values,
            minY: min,
            maxY: max,
            meanLine: true,
            opacity: props.processOpacity,
            margin: props.trendEnabled ? props.trendHeight : 0,
            field: field
          });
        }

        if (props.gaugeEnabled && !props.trendOverride) {
          gridmap.addSignalsAsGlyphsAngleAsMean({
            container: container,
            cell: "." + d.key,
            facet: "." + facet.uuid,
            signalData: facet.props[d.key],
            data: d.values,
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
            facet: "." + facet.uuid,
            cell: "." + d.key,
            signalData: facet.props[d.key],
            data: d.values,
            size: !props.trendOverride ? props.trendHeight : 0.5
          });

        }
        //gridmap.addSignalsAsGlyphsAngleAsMean({container: ".grid", cell: "." + d.key, signalData: properties[d.key], data: d.values, today: today, opacity: 0.8, signalDescriptors: signalDescriptors});
        //gridmap.addSignalsAsTrendChannel({container: ".grid", cell: "." + d.key, signalData: properties[d.key], data: d.values, signalDescriptors: signalDescriptors});

      });
    });
  }

  componentDidUpdate() {
    if (this.state.initRender == 1 ) {

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
          <FontIcon onClick={this.handleZoomReset} className="zoomReset material-icons">undo</FontIcon>

        </React.Fragment>
      </View>
    );
  }
}
