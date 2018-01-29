import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';
import Paper from 'material-ui/Paper';
import {Toolbar, ToolbarGroup, ToolbarTitle} from 'material-ui/Toolbar';
import * as d3 from 'd3';
import * as pako from 'pako';

import * as spc from '@valcri/spc-sd'

import Canvas from './Canvas.jsx';
import Logo from './Logo.jsx';
import DataImporter from './DataImporter.jsx';
import Configurator from './Configurator.jsx';
import Menu from './Menu.jsx';
import * as util from '../util/util.js';
import {Profiles} from '../api/profiles.js';
import * as Const from '../util/constants.js';
import AccountsUIWrapper from './AccountsUIWrapper.jsx';


const Data = new Mongo.Collection('demoBinary');
const GridData = new Mongo.Collection('gridData');

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
      highlightedCell: "",
      selectionLocked: false,
      signals: {},
      signalUpdate: false,
      data:[],
      dataLoaded: false,
      signalsReady: false,
      dateAggregation: Const.defaultFormat.id,
      signalChange: Math.random(),
      autoDetectProcess: false,
      minDate: new Date(),
      maxDate: new Date(),
    }
  };

  handleLeftOpen = () => this.setState({leftOpen: true});
  handleRightOpen = () => this.setState({rightOpen: true});

  onColourChange = (k) => {
    return function(v) { Meteor.call('profiles.updateField', {id: this.props.profile._id, name: k, value: v.hex}); }.bind(this);
  }
  onConfigChange = (k) => {
    return function(e, v) { Meteor.call('profiles.updateField', {id: this.props.profile._id, name: k, value: v}); }.bind(this);
  }
  onSelectionChange = (k) => {
    return function(e, i, v) { Meteor.call('profiles.updateField', {id: this.props.profile._id, name: k, value: v}); }.bind(this);
  }

  onDateFilterChange = (k) => {
    return (e, v) => {
      let nestedData = this.rollData(
        this.state.raw_data,
        this.state.dateAggregation,
        k === "minDate" ? v : this.state.minDate,
        k === "maxDate" ? v : this.state.maxDate
      );



      this.setState({
        [k]: v,
        data: nestedData,
        signalChange: Math.random(),
      }) }
    }

    onSignalsChange = (c, s) => {
      this.state.signals[c] = s;
      for (let i of this.state.data) {
        if (i.key === c) {
          spc.getSignals(i.values, this.state.signals[c]);
        }
      }

      this.setState({
        signalChange: Math.random(),
      })
    }

    onAutoDetectProcessChange = (e, a) => {
      this.state.data.forEach(d => {
        this.state.signals[d.key].autoDetectProcess = a;
      });
      this.calculateSignals(this.state.data, this.state.signals);
      this.setState({
        signalChange: Math.random(),
        autoDetectProcess: a,
      });
    }


    onCellHightlight = (cell) => {
      if (!this.state.selectionLocked) {
        this.setState({highlightedCell: cell});
      }
    }

    onCellSelection = (cell) => {
      this.setState({highlightedCell: cell, selectionLocked: true});
    }

    onSelectionModeChange = () => {
      this.setState({selectionLocked: !this.state.selectionLocked});
    }

    onCellDeselection = (cell) => {
      this.setState({selectionLocked: false});
    }

    calculateSignals = (data, signals) => {
      var maxVal = 0;
      var volMaxVal = 0;
      var minVal = Number.MAX_SAFE_INTEGER;
      var volMinVal = Number.MAX_SAFE_INTEGER;
      var maxRatio = 0;
      let gridData = d3.csvParse(this.props.gridData._id);


      data.forEach(function(d) {
        d.values.sort(function(a,b) {return a.Date-b.Date;});

        var mean = d3.mean(d.values, function(d1) { return d1.Count});
        var sd = d3.deviation(d.values, function(d1) { return d1.Count});
        var ratio = sd / mean;

        if (mean + 3 * sd > maxVal) {
          maxVal = mean + 3 * sd;
        }
        if (mean - 3 * sd < minVal) {
          minVal = mean - 3 * sd;
        }
        if (ratio > maxRatio) {
          maxRatio = ratio;
        }


        for (let n of gridData) {
          if (n.Neigh_code == d.key) {
            for (let m of d.values) {
              if (n.pop2011 == 0) {
                m.Volume = 0;
              } else {
                m.Volume = m.Count /  n.pop2011;
              }
            }
          }
        }

        var volMean = d3.mean(d.values, function(d1) { return d1.Volume});
        var volSd = d3.deviation(d.values, function(d1) { return d1.Volume});

        if (volMean + 3 * volSd > volMaxVal) {
          volMaxVal = volMean + 3 * volSd;
        }
        if (volMean - 3 * volSd < volMinVal) {
          volMinVal = volMean - 3 * volSd;
        }

        spc.getSignals(d.values, signals[d.key]);

      });

      data.forEach(function(d) {
        d.max = d3.max(signals[d.key].processes, function(d1) { return d1.mean + 3.5 * d1.sd});
        d.min = d3.min(signals[d.key].processes, function(d1) { return d1.mean - 3.5 * d1.sd});
        d.mean = d3.mean(d.values, function(d1) { return d1.Count});
        d.minGlobalVar = d.mean - 3.5 * d.mean * maxRatio;
        d.maxGlobalVar = d.mean + 3.5 * d.mean * maxRatio;
        d.minGlobalCount = minVal;
        d.maxGlobalCount = maxVal;
        d.minVolume = volMinVal;
        d.maxVolume = volMaxVal;
      });
    }

    componentDidUpdate() {
      if (this.props.data && !this.state.dataLoaded) {

        let win1251decoder = new TextDecoder('utf-8');
        let result = d3.csvParse(win1251decoder.decode(pako.inflate(this.props.data.data)));
        let ds = Const.exampleDatasets[this.props.datasetId];
        this.loadDataset(result, ds.Date, ds.npu, ds.neighbourhood, ds.aggregateBy);
      };
      if (this.props.dataReady && this.props.profileReady && this.state.dataLoaded) {
        if (this.props.profile !== undefined) {
          const height = this.gridContainer.clientHeight;
          const _rowHeight = height / this.state.rows - this.state.space;
          if (this.state.rowHeight !== _rowHeight)
          this.setState({ rowHeight: _rowHeight });  // Abitary values, bit of a hack.
        }
        if (util.isEmpty(this.state.signals)) {
          var properties = {};
          this.state.data.forEach( (d) => {
            properties[d.key]  = {
              "autoDetectProcess" : this.state.autoDetectProcess,
              "signalDescriptors": signalDescriptors,
            }
          })

          this.calculateSignals(this.state.data, properties);
          //console.log(this.state.signals);

          this.setState({signals: properties, signalsReady: true});
        }
      }
    }

    loadDataset = (data, dataField, npuField, neighbourhoodField, defaultAggregation) => {
      data.forEach( function (d) {
        d.Date = d3.timeParse(Const.dateFormat)(d.Date);
        for (let key of Object.keys(Const.dateAggregations)) {
          d[Const.dateAggregations[key].field] = d3.timeFormat(Const.dateAggregations[key].format)(d.Date);
        }
      });

      let minDate = d3.min(data, function(d) {return d.Date});
      let maxDate = d3.max(data, function(d) {return d.Date});

      let nestedData = this.rollData(data, defaultAggregation, minDate, maxDate);

      this.setState({
        raw_data: data,
        data: nestedData,
        dateAggregation: defaultAggregation,
        dataLoaded: true,
        minDate: minDate,
        maxDate: maxDate,
      })
    }

    rollData(data, agg, minDate, maxDate) {
      let nData = d3.nest()
      .key(function(d) { return d.neighbourhood; })
      .key(function(d) { return d[Const.dateAggregations[agg].field]; })
      .rollup(function(v) {
        return v.length;
      })
      .entries(data.filter(d => d.Date >= minDate && d.Date <= maxDate ));

      nData.forEach( function(d) {

        d.values.forEach( function (d) {
          d.Date = d3.timeParse(Const.dateAggregations[agg].format)(d.key);
          d.Count = +d.value;
        });
      })
      return nData;
    }

    render() {
      if (!this.props.dataReady || !this.props.gridDataReady) return <span></span>
      let {leftOpen, space, ...canvasProps}  = this.state;
      let {_id, userId, name, createdAt, lastAccessed, ...configSettings} = this.props.profile ? this.props.profile : {};
      return (
        <MuiThemeProvider>
          <div className="container">

            <Toolbar className="main-header">
              <ToolbarGroup firstChild={true}>
                <IconButton iconStyle={{color: "white"}} tooltip="Configure Grid" onClick={this.handleLeftOpen}>
                  <FontIcon className="material-icons mi-button">menu</FontIcon>
                </IconButton>
                <Logo />
                <ToolbarTitle style={{color: "white"}} text="ShewMap v0.1" />
              </ToolbarGroup>
              <ToolbarGroup lastChild={true}>
                  <AccountsUIWrapper />
                <IconButton iconStyle={{color: "white"}} tooltip="Options" onClick={this.handleRightOpen}>
                  <FontIcon className="material-icons mi-button">menu</FontIcon>
                </IconButton>
              </ToolbarGroup>
            </Toolbar>
            <Drawer
              docked={false}
              open={this.state.leftOpen}
              onRequestChange={(leftOpen) => this.setState({leftOpen})}
              width={350}
              >
              {this.renderConfigurator(configSettings)}
            </Drawer>
            <Drawer
              docked={false}
              openSecondary={true}
              open={this.state.rightOpen}
              onRequestChange={(rightOpen) => this.setState({rightOpen})}
              width={350}
              >
              <Menu />
            </Drawer>
            {this.renderMain(configSettings)}
          </div>
        </MuiThemeProvider>
      );
    }

    renderConfigurator(configSettings) {
      if (!this.props.profile) return (<span></span>)
      return (
        <Configurator
          bgEnabledChangeHandler={this.onConfigChange("bgEnabled")}
          bgOpacityChangeHandler={this.onConfigChange("bgOpacity")}
          signalEnabledChangeHandler={this.onConfigChange("signalEnabled")}
          signalTypeChangeHandler={this.onConfigChange("signalType")}
          signalOpacityChangeHandler={this.onConfigChange("signalOpacity")}
          signalColourChangeHandler={this.onColourChange("signalColour")}
          signalBelowColourChangeHandler={this.onColourChange("signalBelowColour")}
          signalAboveColourChangeHandler={this.onColourChange("signalAboveColour")}
          bivariateSignalColoursChangeHandler={this.onConfigChange("bivariateSignalColours")}
          processEnabledChangeHandler={this.onConfigChange("processEnabled")}
          processOpacityChangeHandler={this.onConfigChange("processOpacity")}
          processScaleChangeHandler={this.onSelectionChange("processScale")}
          gaugeEnabledChangeHandler={this.onConfigChange("gaugeEnabled")}
          gaugeOpacityChangeHandler={this.onConfigChange("gaugeOpacity")}
          gaugeExceptionChangeHandler={this.onConfigChange("gaugeException")}
          gaugeColourChangeHandler={this.onColourChange("gaugeColour")}
          trendEnabledChangeHandler={this.onConfigChange("trendEnabled")}
          trendHeightChangeHandler={this.onConfigChange("trendHeight")}
          trendOverrideChangeHandler={this.onConfigChange("trendOverride")}
          autoDetectProcessChangeHandler={this.onAutoDetectProcessChange}
          autoDetectProcess={this.state.autoDetectProcess}
          minDate={this.state.minDate}
          maxDate={this.state.maxDate}
          minDateChangeHandler={this.onDateFilterChange("minDate")}
          maxDateChangeHandler={this.onDateFilterChange("maxDate")}
          {...configSettings}
          />
      )
    }

    paperContainer(m) {
      return (
        <div className="paper-outer">
          <Paper className="paper-inner" zDepth={2} >
            {m}
          </Paper>
        </div>
      )
    }

    renderMain(props) {
      if (!Meteor.userId()) {
        return (this.paperContainer(<div className="message">Please login to continue</div>))
      } else if (!this.props.profileReady) {
        return (<span></span>)
      } else if (this.props.profile === undefined) {
        return (this.paperContainer(<div className="message">Create a profile to start</div>))
      } else if (!this.state.dataLoaded) {
        return (this.paperContainer(<DataImporter loadDataset={this.loadDataset} loadExampleDataSet={this.props.onExampleDatasetSelection}/>))
      } else if (this.state.dataLoaded) {
        return(
          <div className="grid-container" ref={ (gridContainer) => this.gridContainer = gridContainer} >
            <Canvas
              data={this.state.data}
              handleHightedCell={this.onCellHightlight}
              handleCellSelection={this.onCellSelection}
              handleCellDeselection={this.onCellDeselection}
              handleSelectionModeChange={this.onSelectionModeChange}
              {...props}
              data={this.state.data}
              signals={this.state.signals}
              rowHeight={this.state.rowHeight}
              rows={this.state.rows}
              highlightedCell={this.state.highlightedCell}
              highlightedCell={this.state.highlightedCell}
              gridData={d3.csvParse(this.props.gridData._id)}
              selectionLocked={this.state.selectionLocked}
              onHandleLayoutChange={this.onConfigChange("layout")}
              onSignalsChange={this.onSignalsChange}
              signalChange={this.state.signalChange}
              />
          </div>
        )
      } else {
        return (<span></span>)
      }
    }
  }

  App.propTypes = {
    data: PropTypes.object,
    profile: PropTypes.object,
    gridData: PropTypes.object,
    profileReady: PropTypes.bool.isRequired,
    dataReady: PropTypes.bool.isRequired,
    gridDataReady: PropTypes.bool.isRequired,
    onExampleDatasetSelection: PropTypes.func.isRequired,
    datasetId: PropTypes.string.isRequired
  };

  export default withTracker((props) => {
    const handler1 = Meteor.subscribe('demoBinary', props.datasetId);
    const handler2 = Meteor.subscribe('profiles');
    const handler3 = Meteor.subscribe('gridData');
    return {
      dataReady: handler1.ready(),
      profileReady: handler2.ready(),
      gridDataReady: handler3.ready(),
      data: Data.findOne({_id: "data"}),
      profile: Profiles.findOne({userId: Meteor.userId, name: { $ne: "default" }}, { sort: { lastAccessed: -1 }}),
      gridData: GridData.findOne(),
    };
  })(App);
