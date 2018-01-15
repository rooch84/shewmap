import React, { Component } from 'react';
import IconButton from 'material-ui/IconButton';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import {Toolbar, ToolbarGroup, ToolbarTitle} from 'material-ui/Toolbar';
import * as d3 from 'd3';
import * as pngExport from '../util/pngExport.js'
import * as Views from './Views.jsx';

export default class View extends Component {

  static defaultProps = {
    saveEnabled: false
  }

  constructor(props) {
    super(props);
    this.state = {
      saveDialogOpen: false,
      fileName: "",
    }
  };

  handleOpenDialog = () => {
    let format = d3.timeFormat("%Y-%m-%d_%H%M%S");
    this.setState({
      saveDialogOpen: true,
      fileName: this.props.name + "_" + (format(new Date())) + ".png",
    })
  }

  handleCloseDialog = () => {
    this.setState({
      saveDialogOpen: false,
    })
  }

  handleFilenameChange = (event) => {
      this.setState({
        fileName: event.target.value,
      });
    };

  handleSave = () => {
    let fn = this.state.fileName;
    if (!fn.toLowerCase().endsWith(".png")) {
      fn += ".png"
      this.setState({fileName: fn});
    }
    pngExport.save(this.props.container, fn);
    this.handleCloseDialog();
  }

  saveButton = () => {
    if (this.props.saveEnabled) {
      return (<IconButton className="header-button">
        <FontIcon className="toolbar-icon material-icons" onClick={this.handleOpenDialog}>save</FontIcon>
      </IconButton>)
    }
    return (<span></span>)
  }

  render() {
    const actions = [
          <FlatButton
            label="Cancel"
            primary={true}
            onClick={this.handleCloseDialog}
          />,
          <FlatButton
            label="Submit"
            primary={true}
            keyboardFocused={true}
            onClick={this.handleSave}
          />,
        ];

    return (
      <div className="view-container">
        <Toolbar className="view-header">
          <ToolbarGroup firstChild={true}>
            <ToolbarTitle text={this.props.name} />
          </ToolbarGroup>
          <ToolbarGroup lastChild={true}>
            {this.saveButton()}
          </ToolbarGroup>
        </Toolbar>
        <div ></div>
        <div className="view-main">
          {this.props.children}
        </div>

        <Dialog
          title={"Export " + this.props.name + " as PNG"}
          actions={actions}
          modal={false}
          open={this.state.saveDialogOpen}
          onRequestClose={this.handleCloseDialog}
        >
          <div>Please enter the filename:</div>
          <TextField
            name="filename"
            value={this.state.fileName}
            onChange={this.handleFilenameChange}/>
        </Dialog>
      </div>
    );
  }
}
