import React, { Component } from 'react';

import * as Views from './Views.jsx';

export default class View extends Component {

  constructor(props) {
    super(props);
    this.state = {
      w: 0,
      h: 0,
    }
  };

  onResize = (evt) => {
    this.setState({w: evt.w, h: evt.h});
  }

  render() {
    return (
      <div className="view-container">
        <div className="view-header">{this.props.type}</div>
        <div className="view-main">
          {React.createElement(Views[this.props.type], {w: this.state.w, h: this.state.h})}
        </div>
      </div>
    );
  }
}
