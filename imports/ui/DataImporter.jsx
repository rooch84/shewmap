import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import Snackbar from 'material-ui/Snackbar';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import FlatButton from 'material-ui/FlatButton';
import * as d3 from 'd3';

import * as Const from '../util/constants.js'

export default class DataImporter extends Component {

  constructor() {
    super()
    this.state = {
      accept: '',
      files: [],
      dropzoneActive: false,
      snackBarOpen: false,
      snackBarMessage: "",
      exampleDataset: Object.values(Const.exampleDatasets)[0].id,
      dateChooseList: [],
      npuChooseList: [],
      neighbourhoodChooseList: [],
      categories: [],
      showAttributeSelections: false,
      selectedDateField: "",
      selectedNPUField: "",
      selectedNeighbourhoodField: "",
      data: [],
      defaultAggregation: Const.defaultFormat.id,
    }
  }

  setSnackBarMessage = (m) => {
    this.setState({
      snackBarOpen: true,
      snackBarMessage: m,
    });
  }

  handleRequestClose = () => {
    this.setState({
      snackBarOpen: false,
    });
  };

  onDragEnter() {
    this.setState({
      dropzoneActive: true
    });
  }

  onDragLeave() {
    this.setState({
      dropzoneActive: false
    });
  }

  onDrop(files) {
    this.setState({
      files,
      dropzoneActive: false
    });

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const fileAsBinaryString = reader.result;
        this.readData(fileAsBinaryString);
      };
      reader.onabort = () => console.log('file reading was aborted');
      reader.onerror = () => this.setSnackBarMessage('File reading has failed.');

      if (file.name.endsWith('.csv')) {
        reader.readAsBinaryString(file);
      } else {
        this.setSnackBarMessage("Please choose a file ending in '.csv'.")
      }

    });
  }

  readData = (file) => {
    let data = d3.csvParse(file);
    if (data.length == 0) {
      this.setSnackBarMessage("No data found in file.")
      return
    }
    let keys = Object.keys(data[0]);
    let potentialDates = [], notPotentialDates = [],
    potentialNpu = [], notPotentialNpu = [],
    potentialNeighbourhood = [], notPotentialNeighbourhood = [],
    categories = [];

    let dateFormat = /^([0-2]+[1-9]+|3[0-1]+)\/(0[1-9]+|1[0-2]+)\/\d{4}\s\d{2}:\d{2}:\d{2}$/;

    for (key of keys) {
      if (data[0][key].match(dateFormat)) {
        potentialDates.push(key);
      }

      if (key.toLowerCase().includes("npu")) {
        potentialNpu.push(key);
      } else {
        notPotentialNpu.push(key);
      }

      if (key.toLowerCase().includes("neighbourhood")) {
        potentialNeighbourhood.push(key);
      } else {
        notPotentialNeighbourhood.push(key);
      }

      let i = 0;
      let notNum = false;
      let isNA = true;
      do {
        notNum = isNaN(data[i++][key]);
        if (data[0][key] !== "NA") {
          isNA = false;
        }
      } while ((data[0][key] === "NA" || !notNum) && i < data.length)
      if (notNum && !isNA) {
        categories.push(key);
      }
    }
    console.log(potentialDates);

    let tmpNpu = potentialNpu.concat(notPotentialNpu);
    let tmpNeighbourhood = potentialNeighbourhood.concat(notPotentialNeighbourhood);

    this.setState({
      data: data,
      dateChooseList: potentialDates,
      npuChooseList: tmpNpu,
      neighbourhoodChooseList: tmpNeighbourhood,
      selectedNPUField: tmpNpu[0],
      selectedNeighbourhoodField: tmpNeighbourhood[0],
      categories: categories,
    })

    if (potentialDates.length == 0) {
      this.setSnackBarMessage("Can't find a valid date column, please check the formatting.");
    } else {
      this.setState({
        selectedDateField: potentialDates[0],
        showAttributeSelections: true,
      });
    }

  }

  defaultAggregationChangeHandler = (e, i, v) => this.setState({defaultAggregation: v});
  selectedNeighbourhoodChangeHandler = (e, i, v) => this.setState({selectedNeighbourhoodField: v});
  selectedDateChangeHandler = (e, i, v) => this.setState({selectedDateField: v});
  selectedNpuChangeHandler = (e, i, v) => this.setState({selectedNPUField: v});

  fieldSelector = () => {
    return (
      <div>
        <div className="config-item-row">
          <span className="config-item__row-item">Select date field:</span>
          <DropDownMenu
            className="config-item__row-item"
            value={this.state.selectedDateField}
            onChange={this.selectedDateChangeHandler}
            >
            {this.state.dateChooseList.map( e => <MenuItem key={e} value={e} primaryText={e.replace(/\./g, " ")} /> )}
          </DropDownMenu>
        </div>
        <div className="config-item-row">
          <span className="config-item__row-item">Select NPU field:</span>
          <DropDownMenu
            className="config-item__row-item"
            value={this.state.selectedNPUField}
            onChange={this.selectedNpuChangeHandler}
            >
            {this.state.npuChooseList.map( e => <MenuItem key={e} value={e} primaryText={e.replace(/\./g, " ")} /> )}
          </DropDownMenu>
        </div>
        <div className="config-item-row">
          <span className="config-item__row-item">Select neighbourhood field:</span>
          <DropDownMenu
            className="config-item__row-item"
            value={this.state.selectedNeighbourhoodField}
            onChange={this.selectedNeighbourhoodChangeHandler}
            >
            {this.state.neighbourhoodChooseList.map( e => <MenuItem key={e} value={e} primaryText={e.replace(/\./g, " ")} /> )}
          </DropDownMenu>
        </div>
        <div className="config-item-row">
          <span className="config-item__row-item">Select default date agggregation:</span>
          <DropDownMenu
            className="config-item__row-item"
            value={this.state.defaultAggregation}
            onChange={this.defaultAggregationChangeHandler}
            >
            {Object.values(Const.dateAggregations).map( e => <MenuItem key={e.name} value={e.id} primaryText={e.name} /> )}
          </DropDownMenu>
        </div>
        <div className="config-item-row">
          <div></div>
          <FlatButton
            className="config-item__row-item"
            label="Load dataset"
            onClick={this.loadDataset}
            />
        </div>
      </div>
    )
  }

  loadDataset = (evt) => {
    this.props.loadDataset(this.state.data,
      this.state.selectedDateField,
      this.state.selectedNPUField,
      this.state.selectedNeighbourhoodField,
      this.state.defaultAggregation,
    );
  }

  exampleDatasetChangeHandler = ( e, i, v) => {
    this.setState({
      exampleDataset: v,
    })
  }

  loadExampleDataSet = (evt) => {
    this.props.loadExampleDataSet(this.state.exampleDataset);
  }

  listExamples() {
    return (Object.values(Const.exampleDatasets).map( (e) => { return(<MenuItem key={e.id} value={e.id} primaryText={e.name} />) } ));
  }

  populateContent = () => {
    if (this.state.showAttributeSelections) {
      return this.fieldSelector();
    } else {
      return (
        <div className="config-item-row">
          <DropDownMenu className="config-item__row-item" value={this.state.exampleDataset} onChange={this.exampleDatasetChangeHandler}>
            {this.listExamples()}
          </DropDownMenu>
          <FlatButton className="config-item__row-item" label="Load example dataset" onClick={this.loadExampleDataSet}/>
        </div>
      )
    }
  }

  render() {
    const { accept, files, dropzoneActive } = this.state;
    return (
      <Dropzone
        disableClick
        className="dropzone"
        accept={accept}
        onDrop={this.onDrop.bind(this)}
        onDragEnter={this.onDragEnter.bind(this)}
        onDragLeave={this.onDragLeave.bind(this)}
        >
        { dropzoneActive && <div className="dropzone-overlay">Release here to upload ...</div> }
        <div>Drop a csv file here to start, or chose an example dataset from the list below.</div>

        {this.populateContent()}

        <Snackbar
          open={this.state.snackBarOpen}
          message={this.state.snackBarMessage}
          autoHideDuration={4000}
          onRequestClose={this.handleRequestClose}
          />
      </Dropzone>
    )
  }

}
