import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';

import Canvas from './Canvas.jsx';

export default class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      leftOpen: false,
      canvasRowHeight: 0,
      rows: 18,
      space: 11
    }
  };

  handleLeftOpen = () => this.setState({leftOpen: true});
  handleRightOpen = () => this.setState({rightOpen: true});

  componentDidMount() {
      const height = this.gridContainer.clientHeight;
      this.setState({ canvasRowHeight: height / this.state.rows - this.state.space });  // Abitary values, bit of a hack.
    }

  render() {
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
            >
            Boo
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
            <Canvas rowHeight={this.state.canvasRowHeight} rows={this.state.rows} />
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}
