import React, { Component } from 'react';
import ReactDOM from "react-dom";
import RGL from "react-grid-layout";
import WidthProvider from "../util/WidthProvider.jsx"

import Views from './Views.jsx';

const ReactGridLayout = WidthProvider(RGL);

export default class App extends Component {

  constructor(props) {
    super(props);
    window.addEventListener("resize", this.onWindowResize);
    this.componentRefs = {};
    this.state = {
      resizeAll: false,
      resizeOne: "",
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

    return this.props.layout.map( (l) => {
      return (
        <div key={l.i} data-grid={l}>
          {/*
            <View {...this.props} ref={ (elem) => {this.componentRefs[l.i] = elem}} type={l.i}  />
            */}
            {React.createElement(Views[l.i], {
              type: l.i,
              resize: this.state[l.i + "_resize"],
              resizeComplete: () => {this.setState({[l.i + "_resize"]: false})}, ...this.props})}
          </div>
        );
      });
    }

    onResize = (layout, oldLayoutItem, layoutItem, placeholder) => {
        this.setState({[layoutItem.i + "_resize"]: true});
    }

    onResizeAll= () => {
      return this.props.layout.map( (l) => {
        this.setState({[l.i + "_resize"]: true});
      });
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

      if (this.state.resizeOne !== "") {
        this.componentRefs[this.state.resizeOne].onResize();
        this.setState({resizeOne: ""});
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
      this.props.onHandleLayoutChange({}, layout);
    }

  }
