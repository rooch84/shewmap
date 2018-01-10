import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';
import * as d3 from 'd3';
import * as spc from '@valcri/spc-sd'
import Canvas from './Canvas.jsx';
import Configurator from './Configurator.jsx';
import * as util from '../util/util.js';

const Data = new Mongo.Collection('demo');

const signalDescriptors = spc.SIGNALS;
signalDescriptors.EIGHT_OVER_MEAN.shape = function (container, x, y, size, colours = ["",""]) {
  spc.createCircle(size, x, y, container, "spc__icon", colours[0]);
}
signalDescriptors.EIGHT_UNDER_MEAN.shape = function (container, x, y, size, colours = ["",""]) {
  spc.createCircle(size, x, y, container, "spc__icon", colours[1]);
}
signalDescriptors.THREE_OVER_ONE_FIVE.shape = function (container, x, y, size, colours = ["",""]) {
  spc.createTriangle(size, x, y, container, "spc__icon", colours[0]);
}
signalDescriptors.THREE_UNDER_ONE_FIVE.shape = function (container, x, y, size, colours = ["",""]) {
  spc.createTriangle(size, x, y, container, "spc__icon", colours[1]);
}
signalDescriptors.TWO_OVER_TWO.shape = function (container, x, y, size, colours = ["",""]) {
  spc.createDiamond(size, x, y, container, "spc__icon", colours[0]);
}
signalDescriptors.TWO_UNDER_TWO.shape = function (container, x, y, size, colours = ["",""]) {
  spc.createDiamond(size, x, y, container, "spc__icon", colours[1]);
}
signalDescriptors.ONE_OVER_THREE.shape = function (container, x, y, size, colours = ["",""]) {
  spc.createCross(size, x, y, container, "spc__icon", colours[0]);
}
signalDescriptors.ONE_UNDER_THREE.shape = function (container, x, y, size, colours = ["",""]) {
  spc.createCross(size, x, y, container, "spc__icon", colours[1]);
}

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      leftOpen: false,
      rowHeight: 0,
      rows: 18,
      space: 11,
      bgOpacity: 0.2,
      highlightedCell: "",
      signals: {},
      selectionLocked: false,
      signalType: "icon",
      signalOpacity: 0.8,
      signalColour: "#FFF",
      signalBelowColour: "#0571b0",
      signalAboveColour: "#ca0020",
      bivariateSignalColours: true,

    }
  };

  handleLeftOpen = () => this.setState({leftOpen: true});
  handleRightOpen = () => this.setState({rightOpen: true});

  onBgOpacityChange = (e, v) => this.setState({bgOpacity: v});
  onSignalOpacityChange = (e, v) => this.setState({signalOpacity: v});
  onSignalTypeChange = (e, v) => this.setState({signalType: v});
  onSignalColourChange = (v) => {this.setState({signalColour: v.hex})};
  onSignalAboveColourChange = (v) => {this.setState({signalAboveColour: v.hex})};
  onSignalBelowColourChange = (v) => {this.setState({signalBelowColour: v.hex})};
  onBivariateSignalColoursChange = (evt, v) => {this.setState({bivariateSignalColours: v})};

  onCellHightlight = (cell) => {
    if (!this.state.selectionLocked) {
      this.setState({highlightedCell: cell});
    }
  }

  onCellSelection = (cell) => {
    this.setState({highlightedCell: cell, selectionLocked: true});
  }

  onCellDeselection = (cell) => {
    this.setState({selectionLocked: false});
  }

  componentDidUpdate() {
    if (this.props.ready) {
      const height = this.gridContainer.clientHeight;
      const _rowHeight = height / this.state.rows - this.state.space;
      if (this.state.rowHeight !== _rowHeight)
      this.setState({ rowHeight: _rowHeight });  // Abitary values, bit of a hack.
      if (util.isEmpty(this.state.signals)) {
        var month = 7;
        var year = 2014;//2012;
        var today = d3.timeParse("%m-%Y")(month + "-" + year);
        var autoDetectCap = today;
        today = d3.timeParse("%m-%Y")(1 + "-" + 2016);
        var properties = {};

        this.props.data.data.forEach(function(d) {

          d.values.forEach( function (d) {
            d.Date = d3.timeParse("%Y-%m")(d.key);
            d.Count = +d.value;
          });
          d.values.sort(function(a,b) {return a.Date-b.Date;});

          let i = 0;
          while(d.values[i].Date <= today) {
            i++;
          }

          d.values.splice(i, d.values.length);
          spc.getSignals(d.values, properties[d.key] = {
            "autoDetectProcess" : true,
            "autoDetectUntil" : autoDetectCap,
            "signalDescriptors": signalDescriptors,
          });
          d.max = d3.max(properties[d.key].processes, function(d1) { return d1.mean + 3.5 * d1.sd});
          d.min = d3.min(properties[d.key].processes, function(d1) { return d1.mean - 3.5 * d1.sd});
          d.mean = d3.mean(d.values, function(d1) { return d1.Count});
        });
        this.setState({signals: properties});
      }
    }
  }

  render() {
    let {leftOpen, space, ...canvasProps}  = this.state;
    if (!this.props.ready) return <span></span>
    return (
      <MuiThemeProvider>
        <div className="container">

          <AppBar
            title="ShewMap"
            iconElementLeft={<IconButton tooltip="Configure Grid">
              <FontIcon className="material-icons mi-button">menu</FontIcon>
            </IconButton>}
            iconElementRight={<IconButton tooltip="Options">
              <FontIcon className="material-icons mi-button">menu</FontIcon>
            </IconButton>}
            onLeftIconButtonClick={this.handleLeftOpen}
            onRightIconButtonClick={this.handleRightOpen}
            style={{backgroundColor: "#999", flexShrink: 0}}
            />
          <Drawer
            docked={false}
            open={this.state.leftOpen}
            onRequestChange={(leftOpen) => this.setState({leftOpen})}
            width={350}
            >
            <Configurator
              bgOpacityChangeHandler={this.onBgOpacityChange}
              bgOpacity={this.state.bgOpacity}
              signalTypeChangeHandler={this.onSignalTypeChange}
              signalType={this.state.signalType}
              signalOpacityChangeHandler={this.onSignalOpacityChange}
              signalOpacity={this.state.signalOpacity}
              signalColourChangeHandler={this.onSignalColourChange}
              signalColour={this.state.signalColour}
              signalBelowColourChangeHandler={this.onSignalBelowColourChange}
              signalAboveColourChangeHandler={this.onSignalAboveColourChange}
              bivariateSignalColoursChangeHandler={this.onBivariateSignalColoursChange}
              signalBelowColour={this.state.signalBelowColour}
              signalAboveColour={this.state.signalAboveColour}
              bivariateSignalColours={this.state.bivariateSignalColours}
              />
          </Drawer>
          <Drawer
            docked={false}
            openSecondary={true}
            open={this.state.rightOpen}
            onRequestChange={(rightOpen) => this.setState({rightOpen})}
            >
            Hiss
          </Drawer>
          <div className="grid-container" ref={ (gridContainer) => this.gridContainer = gridContainer} >
            <Canvas
              data={this.props.data.data}
              handleHightedCell={this.onCellHightlight}
              handleCellSelection={this.onCellSelection}
              handleCellDeselection={this.onCellDeselection}
              {...canvasProps}
              />

          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}

App.propTypes = {
  data: PropTypes.object,
  ready: PropTypes.bool.isRequired,
};

export default withTracker((props) => {
  const handler = Meteor.subscribe('demo');
  return {
    ready: handler.ready(),
    data: Data.findOne({_id: "crime"}),
  };
})(App);
