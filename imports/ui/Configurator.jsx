import React, { Component } from 'react';
import Slider from 'material-ui/Slider';

export default class Configurator extends Component {

  constructor(props) {
    super(props);

  };

  render() {
    return (
      <div>
        <Slider
         min={0}
         max={1}
         value={this.props.opacity}
         onChange={this.props.opacityChangeHandler}
       />
      </div>
    );
  }
}
