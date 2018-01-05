import { Meteor } from 'meteor/meteor';

const dataFile = "data/west-mids-smwg.csv";


Meteor.publish('gridData', function() {
  this.added('gridData', Assets.getText(dataFile));
  this.ready();
});
