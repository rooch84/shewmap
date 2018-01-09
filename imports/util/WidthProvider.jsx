// @flow
import React from "react";
import PropTypes from "prop-types";
import type { ComponentType as ReactComponentType } from "react";

type Props = {
  className?: string,
  measureBeforeMount: boolean,
  style?: Object
};

type State = {
  width: number
};

/*
 * A simple HOC that provides facility for listening to container resizes.
 */
type ProviderT = (
  ComposedComponent: ReactComponentType<any>
) => ReactComponentType<any>;
const WidthProvider: ProviderT = ComposedComponent =>
  class WidthProvider extends React.Component<Props, State> {
    static defaultProps = {
      measureBeforeMount: false,
      width: 0
    };

    static propTypes = {
      // If true, will not render children until mounted. Useful for getting the exact width before
      // rendering, to prevent any unsightly resizing.
      measureBeforeMount: PropTypes.bool
    };

    state: State = {
      width: 1280
    };

    mounted: boolean = false;

    componentDidMount() {
      this.mounted = true;

      //window.addEventListener("resize", this.onWindowResize);
      // Call to properly set the breakpoint and resize the elements.
      // Note that if you're doing a full-width element, this can get a little wonky if a scrollbar
      // appears because of the grid. In that case, fire your own resize event, or set `overflow: scroll` on your body.
      //this.onWindowResize();
    }

    componentWillUnmount() {
      this.mounted = false;
    }

    componentWillReceiveProps(nextProps) {
      if (nextProps.width != this.props.width) {
        this.setState({ width: nextProps.width });
      }
    }

    render() {
      if (this.props.measureBeforeMount && !this.mounted) {
        return (
          <div className={this.props.className} style={this.props.style} />
        );
      }

      return <ComposedComponent {...this.props} {...this.state} />;
    }
  };

export default WidthProvider;
