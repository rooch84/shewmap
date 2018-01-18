import { Meteor } from 'meteor/meteor';
import * as d3 from 'd3';
import * as pako from'pako';

import * as Const from '../util/constants.js';

const gridDataFile = "data/west-mids-smwg.csv";
const geoDataFile = "data/west-mids-neighbourhoods.geojson";

Meteor.publish('gridData', function() {
  this.added('gridData', Assets.getText(gridDataFile));
  this.ready();
});

Meteor.publish('geoData', function() {
  this.added('geoData', Assets.getText(geoDataFile));
  this.ready();
});

Meteor.publish('regions', function() {
  let smwgData = d3.csvParse(Assets.getText(gridDataFile));
  let regions = d3.map(smwgData, function(d){return d.NPU;}).keys();
  this.added('regions', "1", {data: regions});
  this.ready();
});

Meteor.publish('demo', function(datasetId) {
  if (!(datasetId in Const.exampleDatasets)) return this.ready();
  let theData = d3.csvParse(Assets.getText(Const.exampleDatasets[datasetId].fileName));
  this.added('demo', "data", {data: theData} );
  this.ready();
});

Meteor.publish('demoBinary', function(datasetId) {
  if (!(datasetId in Const.exampleDatasets)) return this.ready();
  //let theData = Assets.getText(Const.exampleDatasets[datasetId].fileName);
  let theData = Assets.getBinary(Const.exampleDatasets[datasetId].fileName);
  this.added('demoBinary', "data", {data: theData} );
  this.ready();
});
