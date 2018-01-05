import React, { Component } from 'react';
import RGL, { WidthProvider } from "react-grid-layout";

import View from './View.jsx';

const ReactGridLayout = WidthProvider(RGL);

export default class App extends Component {

  constructor(props) {
    super(props);
    this.componentRefs = {};
  };

  static defaultProps = {
    isDraggable: true,
    isResizable: true,
    rowHeight: 0,
    onLayoutChange: function() {},
    cols: 20,
    rows: 18,
    draggableHandle: ".view-header"
  };

  generateDOM() {
    const layout = [
      {i: 'GridMap', x: 0, y: 0, w: 15, h: 12},
      {i: 'GeoMap', x: 15, y: 0, w: 5, h: 9},
      {i: 'Spc', x: 0, y: 12, w: 15, h: 6},
      {i: 'Cell', x: 15, y: 9, w: 5, h: 9}
    ];
    return layout.map( (l) => {
      return (
        <div key={l.i} data-grid={l}>
          <View ref={ (elem) => {this.componentRefs[l.i] = elem}} type={l.i} />
        </div>
      );
    });
  }

  onResize = (layout, oldLayoutItem, layoutItem, placeholder) => {
    if(this.componentRefs[layoutItem.i] && this.componentRefs[layoutItem.i].onResize) {
      this.componentRefs[layoutItem.i].onResize(layoutItem);
    }
  }

  render() {
    return (
      <ReactGridLayout
        onLayoutChange={this.onLayoutChange}
        onResizeStop={this.onResize}
        ref={ (gridElement) => this.gridElement = gridElement}
        {...this.props}
        >
        {this.generateDOM()}
      </ReactGridLayout>
    );
  }

  onLayoutChange(layout) {
    this.props.onLayoutChange(layout);
  }

}
