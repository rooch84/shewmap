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
    this.setState({resize: true});
  }

  componentDidUpdate() {
    if (this.state.resize) {
      this.setState({resize: false});
    }
  }

  render() {
    return (
      <div className="view-container">
        <div className="view-header">{this.props.type}</div>
        <div className="view-main">
          {React.createElement(Views[this.props.type], {resize: this.state.resize, ...this.props})}
        </div>
      </div>
    );
  }
}
