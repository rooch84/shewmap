import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import Paper from 'material-ui/Paper';
import {Toolbar, ToolbarGroup, ToolbarTitle} from 'material-ui/Toolbar';
import Checkbox from 'material-ui/Checkbox';
import IconButton from 'material-ui/IconButton';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';
import {List, ListItem} from 'material-ui/List';

import { Profiles, insertProfile, removeProfile, updateProfileAccessedTime} from '../api/profiles.js'

const style = {
  width: 340,
  margin: 5,
  textAlign: 'center',
  display: 'inline-block',
  padding: 5
};

class Menu extends Component {

  constructor(props) {
    super(props)

    this.state = {
      profileName: "",
      dialogOpen: false,
      profileRemoveId: "",
    };
  }

  handleProfileNameChange = (event) => {
    this.setState({
      profileName: event.target.value,
    });
  };

  handleCreateProfile = (event) => {
    insertProfile.call({name: this.state.profileName});

    this.setState({
      profileName: "",
    });
  }

  handleRemoveProfile = (event) => {
    removeProfile.call({id: this.state.profileRemoveId});

    this.setState({
      profileRemoveId: "",
    });

    this.handleDialogClose();
  }

  handleDialogOpen = (p) => {
    return onHandleDialog = () => {
      this.setState({dialogOpen: true, profileRemoveId: p});
    }
  };

  handleDialogClose = () => {
    this.setState({dialogOpen: false});
  };

  updateAccessedTime = (o) => {
    updateProfileAccessedTime.call({id: o.currentTarget.id})
  }

  render() {
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onClick={this.handleDialogClose}
        />,
      <FlatButton
        label="Confirm"
        primary={true}
        keyboardFocused={true}
        onClick={this.handleRemoveProfile}
        />,
    ];


    return (
      <div>


        <Paper style={style}  zDepth={1}>
          <Toolbar className="config-item-header" >
            <ToolbarGroup firstChild={true}>
              <ToolbarTitle text="Profile Selection" />
            </ToolbarGroup>

          </Toolbar>
          <div className="config-item-row">
            <span className="config-item__row-item">Create: </span>
            <TextField
              className="config-item__row-item"
              hintText="Profile Name"
              value={this.state.profileName}
              onChange={this.handleProfileNameChange}
              />
            <IconButton
              onClick={this.handleCreateProfile}
              className="config-item__row-item"
              tooltip="Create Profile"
              disabled={this.state.profileName === ""}
              >
              <FontIcon className="material-icons mi-button">add_circle</FontIcon>
            </IconButton>
          </div>
          <List>
            {this.createListItems()}
          </List>
        </Paper>
        <Dialog
          title="Remove Profile"
          actions={actions}
          modal={false}
          open={this.state.dialogOpen}
          onRequestClose={this.handleDialogClose}
          >
          Are you sure you want to delete this profile?
        </Dialog>
      </div>
    )
  }

  createListItems() {
    function removeProfile(callback) {
      return(
        <IconButton
          tooltip="Remove profile"
          tooltipPosition="bottom-left"
          onClick={callback}
          >
          <FontIcon className="material-icons mi-button">remove_circle</FontIcon>
        </IconButton>
      )
    }

    return (this.props.profiles.map( e =>
      <ListItem
        id={e._id}
        key={e._id}
        primaryText={e.name}
        onClick={this.updateAccessedTime}
        rightIconButton={removeProfile(this.handleDialogOpen(e._id))}
        >
      </ListItem>));
    }

  }

  Menu.propTypes = {
    profiles: PropTypes.array,
    ready: PropTypes.bool.isRequired,
  };

  export default withTracker((props) => {
    const handler = Meteor.subscribe('profiles');
    return {
      ready: handler.ready(),
      profiles: Profiles.find({userId: Meteor.userId, name: { $ne: "default" }}, {sort: {lastAccessed: -1}}).fetch(),
    };
  })(Menu);
