import React, { Component } from 'react';
import {List, ListItem} from 'material-ui/List';

import * as Const from '../util/constants.js';
import View from './View.jsx';

export default class Meta extends Component {

  constructor(props) {
    super(props);

  };

  render() {
    let neighbourhood = "";
    let npu = "";
    let population = "";

    for (let row of this.props.gridData) {
      if (row.region === this.props.highlightedCell) {
        neighbourhood += row.Neighbourh;
        npu += row.NPU;
        population += "Population of " + row.pop2011;
        break;
      }
    }
    return (
      <View name={this.props.type} >
        <List>
          <ListItem primaryText={neighbourhood} />
          <ListItem primaryText={npu} />
          <ListItem primaryText={population} />
        </List>
      </View>
    );
  }
}
