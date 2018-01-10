import React, { Component } from 'react';
import Slider from 'material-ui/Slider';
import Paper from 'material-ui/Paper';
import { SketchPicker } from 'react-color'
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import {Popover} from 'material-ui/Popover';
import ConfigItem from './ConfigItem.jsx';
import Toggle from 'material-ui/Toggle';


export default class Configurator extends Component {

  constructor(props) {
    super(props);
    this.state = {
      popoverOpen: false,
      anchorEl: {},
      colourPickerCallback: function() {},
      colourPickerColour: "#FFF",
    };
  };

  handlePopoverOpenClick = (event, handler) => {
    event.preventDefault();

    this.setState({
      popoverOpen: true,
      anchorEl: event.currentTarget,
      colourPickerCallback: handler,
    });
  };

  handlePopoverRequestClose = () => {
    this.setState({
      popoverOpen: false,
    });
  };


  signalColours() {
    if (!this.props.bivariateSignalColours) {

      return (
        <div className="config-item-row">
          <span className="config-item__row-item">Colour: </span>
          <div
            className="config-item__row-item colour-picker-button"
            style={{"backgroundColor": this.props.signalColour}}
            onClick={(e) => {this.setState({colourPickerColour: "signalColour"}); this.handlePopoverOpenClick(e, this.props.signalColourChangeHandler)}}>
          </div>
        </div>
      )
    } else {
      return (
        <React.Fragment>
          <div className="config-item-row">
            <span className="config-item__row-item">Above mean colour: </span>
            <div
              className="config-item__row-item colour-picker-button"
              style={{"backgroundColor": this.props.signalAboveColour}}
              onClick={(e) => {this.setState({colourPickerColour: "signalAboveColour"}); this.handlePopoverOpenClick(e, this.props.signalAboveColourChangeHandler)}}>
            </div>
          </div>

          <div className="config-item-row">
            <span className="config-item__row-item">Below mean colour: </span>
            <div
              className="config-item__row-item colour-picker-button"
              style={{"backgroundColor": this.props.signalBelowColour}}
              onClick={(e) => {this.setState({colourPickerColour: "signalBelowColour"}); this.handlePopoverOpenClick(e, this.props.signalBelowColourChangeHandler)}}>
            </div>
          </div>
        </React.Fragment>
      )
    }
  }

  renderItems() {
    items = [
      <ConfigItem key="1" title="Background" enabled={this.props.bgEnabled} enabledChangeHander={this.props.bgEnabledChangeHandler}>
        <div className="config-item-row">
          <span className="config-item__row-item">0</span>
          <Slider
            min={0}
            max={1}
            value={this.props.bgOpacity}
            onChange={this.props.bgOpacityChangeHandler}
            className="config-item__row-item config-item__row-item--grow"
            />
          <span className="config-item__row-item">1</span>
        </div>
        <div className="config-item-row">
          <span>Opacity: </span><span>{this.props.bgOpacity.toFixed(2)}</span>
        </div>
      </ConfigItem>,

      <ConfigItem key="2" title="Signals" enabled={this.props.signalEnabled} enabledChangeHander={this.props.signalEnabledChangeHandler}>
        <RadioButtonGroup
          name="signalType"
          valueSelected={this.props.signalType}
          onChange={this.props.signalTypeChangeHandler}
          style={{textAlign: "left"}}
          labelPosition="left" >
          <RadioButton
            value="icon"
            label="Icon"
            />
          <RadioButton
            value="fill"
            label="Fill"
            />
        </RadioButtonGroup>
        <Toggle
          style={{textAlign: "left"}}
          label="Use bivariate colour scale"
          toggled={this.props.bivariateSignalColours}
          onToggle={this.props.bivariateSignalColoursChangeHandler}
          />
        { this.signalColours() }
        <div className="config-item-row">
          <span className="config-item__row-item">0</span>
          <Slider
            min={0}
            max={1}
            value={this.props.signalOpacity}
            onChange={this.props.signalOpacityChangeHandler}
            className="config-item__row-item config-item__row-item--grow"
            />
          <span className="config-item__row-item">1</span>
        </div>
        <div className="config-item-row">
          <span>Opacity: </span><span>{this.props.signalOpacity.toFixed(2)}</span>
        </div>
      </ConfigItem>,

      <ConfigItem key="3" title="Processes" enabled={this.props.processEnabled} enabledChangeHander={this.props.processEnabledChangeHandler}>
        <div className="config-item-row">
          <span className="config-item__row-item">0</span>
          <Slider
            min={0}
            max={1}
            value={this.props.processOpacity}
            onChange={this.props.processOpacityChangeHandler}
            className="config-item__row-item config-item__row-item--grow"
            />
          <span className="config-item__row-item">1</span>
        </div>
        <div className="config-item-row">
          <span>Opacity: </span><span>{this.props.processOpacity.toFixed(2)}</span>
        </div>

      </ConfigItem>,

      <ConfigItem key="4" title="Gauge Lines" enabled={this.props.gaugeEnabled} enabledChangeHander={this.props.gaugeEnabledChangeHandler}>
        <div className="config-item-row">
          <span className="config-item__row-item">0</span>
          <Slider
            min={0}
            max={1}
            value={this.props.gaugeOpacity}
            onChange={this.props.gaugeOpacityChangeHandler}
            className="config-item__row-item config-item__row-item--grow"
            />
          <span className="config-item__row-item">1</span>
        </div>
        <div className="config-item-row">
          <span>Opacity: </span><span>{this.props.gaugeOpacity.toFixed(2)}</span>
        </div>
        <Toggle
          style={{textAlign: "left"}}
          label="Highlight extended signals"
          toggled={this.props.gaugeException}
          onToggle={this.props.gaugeExceptionChangeHandler}
          />
          <div className="config-item-row">
            <span className="config-item__row-item">Colour: </span>
            <div
              className="config-item__row-item colour-picker-button"
              style={{"backgroundColor": this.props.gaugeColour}}
              onClick={(e) => {this.setState({colourPickerColour: "gaugeColour"}); this.handlePopoverOpenClick(e, this.props.gaugeColourChangeHandler)}}>
            </div>
          </div>
      </ConfigItem>,

      <ConfigItem key="5" title="Trend Channels" enabled={this.props.trendEnabled} enabledChangeHander={this.props.trendEnabledChangeHandler}>
        <Toggle
          style={{textAlign: "left"}}
          label="Fill"
          toggled={this.props.trendOverride}
          onToggle={this.props.trendOverrideChangeHandler}
          />
        <div className="config-item-row">
          <span className="config-item__row-item">0</span>
          <Slider
            min={0.05}
            max={0.3}
            value={this.props.trendHeight}
            onChange={this.props.trendHeightChangeHandler}
            className="config-item__row-item config-item__row-item--grow"
            />
          <span className="config-item__row-item">0.5</span>
        </div>
        <div className="config-item-row">
          <span>Height: </span><span>{this.props.trendHeight.toFixed(2)*100}%</span>
        </div>
      </ConfigItem>
    ]

    return items;

  }



  render() {
    return (
      <div>

        {this.renderItems()}
        <Popover
          className="popover"
          open={this.state.popoverOpen}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
          targetOrigin={{horizontal: 'left', vertical: 'top'}}
          onRequestClose={this.handlePopoverRequestClose}
          >
          <SketchPicker
            color={ this.props[this.state.colourPickerColour] }
            onChangeComplete={ this.state.colourPickerCallback} />
        </Popover>
      </div>
    );
  }
}
