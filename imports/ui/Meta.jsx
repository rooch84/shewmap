import React, { Component } from 'react';
import Chip from 'material-ui/Chip';
import * as d3 from 'd3';

import * as Const from '../util/constants.js';
import View from './View.jsx';

export default class Meta extends Component {

  constructor(props) {
    super(props);

  };

  signalData(data, props) {
    let chips = [];
    let numSignals = d3.sum(props.processes, d => {return Object.keys(d.signals).length});
    let numRecords = d3.sum(data, d => {return d.Count});
    let mean = d3.mean(data, d => {return d.Count});
    let sd = d3.deviation(data, d => {return d.Count});
    numSignals += numSignals == 1 ? " signal point" : " signal points";
    numRecords += numRecords == 1 ? " record" : " records";
    chips.push(<Chip key="rec" className="chip">{numRecords}</Chip>)
    chips.push(<Chip key="mean" className="chip">{"mean of " + mean.toFixed(2)}</Chip>)
    chips.push(<Chip key="sd" className="chip">{"sd of " + sd.toFixed(2)}</Chip>)
    chips.push(<Chip key="time" className="chip">{props.dates.length + " time points"}</Chip>)
    chips.push(<Chip key="sig" className="chip">{numSignals}</Chip>)
    chips.push(<Chip key="pro" className="chip">{props.processes.length +
    " process" + (props.processes.length == 1 ? "es" : "")}</Chip>)

    return chips;
  }

  render() {
    let neighbourhood = "";
    let npu = "";
    let population = "";
    let chips = [];
    let h = this.props.highlightedCell;

    if (h.nest === "all" ) {
      chips.push(<Chip key="a" className="chip">All data</Chip>)
      if (this.props.data.all.props) {
        chips = chips.concat(this.signalData(this.props.data.all.data, this.props.data.all.props));
      }
    } else if (h.nest === "facet") {
      for (let row of this.props.gridData) {
        if (row.region === this.props.highlightedCell.cell) {
          if (h.facet !== "__none__") {
            chips.push(<Chip key="f" className="chip">{h.facet}</Chip>);
          }
          chips.push(<Chip key="n" className="chip">{row.Neighbourh}</Chip>);
          chips.push(<Chip key="npu" className="chip">{row.NPU}</Chip>);
          chips.push(<Chip key="pop" className="chip">{"Population of " + row.pop2011}</Chip>);
          break;
        }
      }
      for (let facet of this.props.data.facet.data) {
        if (facet.key === h.facet) {
          for (let row of facet.values) {
            if (row.key === h.cell) {
              chips = chips.concat(this.signalData(row.values, facet.props[h.cell]));
              break;
            }
          }
        }
      }
    } else if (h.nest === "npu") {
      for (let row of this.props.gridData) {
        if (row.NPU_code === this.props.highlightedCell.cell) {
          chips.push(<Chip key="npu" className="chip">{row.NPU}</Chip>);
          break;
        }
      }
      let data = this.props.data.npu;
      for (let row of data.data) {
        if (row.key === h.cell) {
          chips = chips.concat(this.signalData(row.values, data.props[h.cell]));
          break;
        }
      }
    } else if (h.nest === "neighbourhood") {
      for (let row of this.props.gridData) {
        if (row.region === this.props.highlightedCell.cell) {
          chips.push(<Chip key="n" className="chip">{row.Neighbourh}</Chip>);
          chips.push(<Chip key="npu" className="chip">{row.NPU}</Chip>);
          chips.push(<Chip key="pop"className="chip">{"Population of " + row.pop2011}</Chip>);
          break;
        }
      }
      let data = this.props.data.neighbourhood;
      for (let row of data.data) {
        if (row.key === h.cell) {
          chips = chips.concat(this.signalData(row.values, data.props[h.cell]));
          break;
        }
      }
    }

    return (
      <View name={this.props.type} >
        <div className="chipContainerOuter">
          <div className="chipContainerInner">
            {chips}
          </div>
        </div>
      </View>
    );
  }
}
