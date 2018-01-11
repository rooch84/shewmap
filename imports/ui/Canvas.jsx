import React, { Component } from 'react';
import ReactDOM from "react-dom";
import RGL from "react-grid-layout";
import WidthProvider from "../util/WidthProvider.jsx"

import View from './View.jsx';

const ReactGridLayout = WidthProvider(RGL);

export default class App extends Component {

  constructor(props) {
    super(props);
    window.addEventListener("resize", this.onWindowResize);
    this.componentRefs = {};
    this.state = {
      resizeAll: false,
    };
  };

  static defaultProps = {
    isDraggable: true,
    isResizable: true,
    rowHeight: 0,
    cols: 20,
    rows: 0,
    draggableHandle: ".view-header"
  };

  generateDOM() {
    const layout = [
      {i: 'GridMap', x: 0, y: 0, w: 15, h: 12},
      {i: 'GeoMap', x: 15, y: 0, w: 5, h: 6},
      {i: 'Spc', x: 0, y: 12, w: 15, h: 6},
      {i: 'Meta', x: 15, y: 12, w: 5, h: 6},
      {i: 'Legend', x: 15, y: 6, w: 5, h: 6}
    ];
    return layout.map( (l) => {
      return (
        <div key={l.i} data-grid={l}>
          <View {...this.props} ref={ (elem) => {this.componentRefs[l.i] = elem}} type={l.i}  />
        </div>
      );
    });
  }

  onResize = (layout, oldLayoutItem, layoutItem, placeholder) => {
    if(this.componentRefs[layoutItem.i] && this.componentRefs[layoutItem.i].onResize) {
      this.componentRefs[layoutItem.i].onResize(layoutItem);
    }
  }

  onResizeAll= () => {
    for (let e of Object.keys(this.componentRefs)) {
      this.componentRefs[e].onResize();
    }
  }

  onWindowResize = () => {
    const node = ReactDOM.findDOMNode(this.gridElement); // Flow casts this to Text | Element
    if (node instanceof HTMLElement) {
        this.setState({ width: node.offsetWidth });
        this.setState({ resizeAll: true });
    }
  }

  componentDidUpdate() {
    if (this.state.resizeAll) {
      this.onResizeAll();
      this.setState({ resizeAll: false });
    }
  }

  componentDidMount() {
    this.onWindowResize();
  }

  render() {
    return (
      <ReactGridLayout
        onLayoutChange={this.onLayoutChange}
        onResizeStop={this.onResize}
        ref={ (gridElement) => this.gridElement = gridElement}
        width={this.state.width}
        {...this.props}
        >
        {this.generateDOM()}
      </ReactGridLayout>
    );
  }

  onLayoutChange = (layout) => {
    //this.props.onLayoutChange(layout);
  }

}
