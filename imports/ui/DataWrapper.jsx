import React, { Component } from 'react';

import App from './App.jsx';

export default class DataWrapper extends Component {

  constructor(props) {
    super(props);
    this.state = {
      exampleDataset: "",
    };
  };

  exampleDatasetSelected = d => this.setState({exampleDataset: d});

  render() {
    return (
      <App onExampleDatasetSelection={this.exampleDatasetSelected} datasetId={this.state.exampleDataset} />
    );
  }
}
