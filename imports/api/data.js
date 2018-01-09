import { Meteor } from 'meteor/meteor';
import * as d3 from 'd3';

const gridDataFile = "data/west-mids-smwg.csv";
const geoDataFile = "data/west-mids-neighbourhoods.geojson";
const demoCrimeFile = "data/derived_data_2016.csv"

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

Meteor.publish('demo', function() {
  let theData = d3.csvParse(Assets.getText(demoCrimeFile));
  let crimeData = d3.nest()
    .key(function(d) { return d.neighbourhood; })
    .key(function(d) { return d.Month; })
    .rollup(function(v) {
      return d3.sum(v, function(d) {
        return d.Count;
      })
    })
    .entries(theData);
  this.added('demo', "crime", {data: crimeData} );
  this.ready();
});
