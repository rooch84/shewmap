import React, { Component } from 'react';
import Paper from 'material-ui/Paper';
import {Toolbar, ToolbarGroup, ToolbarTitle} from 'material-ui/Toolbar';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';

const style = {
  width: 340,
  margin: 5,
  textAlign: 'center',
  display: 'inline-block',
  padding: 5
};

export default class ConfigItem extends Component {


  constructor(props) {
    super(props);
  };

  render() {
    return (
      <Paper style={style}  zDepth={1}>
           <Toolbar className="config-item-header" >
             <ToolbarGroup firstChild={true}>
               <ToolbarTitle text={this.props.title} />
             </ToolbarGroup>
             <ToolbarGroup lastChild={true}>
               <IconButton tooltip="Move up">
                 <FontIcon className="material-icons">keyboard_arrow_up</FontIcon>
               </IconButton>
               <IconButton tooltip="Move down">
                 <FontIcon className="material-icons">keyboard_arrow_down</FontIcon>
               </IconButton>
             </ToolbarGroup>

           </Toolbar>
         {this.props.children}
      </Paper>
    );
  }
}
