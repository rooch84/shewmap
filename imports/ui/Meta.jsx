import React, { Component } from 'react';
import * as Const from '../util/constants.js';
import {List, ListItem} from 'material-ui/List';

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
      <List>
        <ListItem primaryText={neighbourhood} />
        <ListItem primaryText={npu} />
        <ListItem primaryText={population} />
      </List>
    );
  }
}
