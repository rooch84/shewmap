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
      <ConfigItem key="1" title="Background Opacity">
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

      <ConfigItem key="2" title="Signals">
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

      <ConfigItem key="3" title="Background Opacity" />,

    ]

    return [items[0], items[2], items[1]]

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
