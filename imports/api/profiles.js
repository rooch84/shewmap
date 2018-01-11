import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Random } from 'meteor/random';
import { ValidatedMethod } from 'meteor/mdg:validated-method';

export const Profiles = new Mongo.Collection('profiles');

const DEFAULTS = {
  bgEnabled: true,
  bgOpacity: 0.2,
  signalEnabled: true,
  signalType: "icon",
  signalOpacity: 0.8,
  signalColour: "#FFF",
  signalBelowColour: "#0571b0",
  signalAboveColour: "#ca0020",
  bivariateSignalColours: true,
  processEnabled: true,
  processOpacity: 0.3,
  gaugeEnabled: true,
  gaugeOpacity: 0.8,
  gaugeException: true,
  gaugeColour: "#999",
  trendEnabled: true,
  trendHeight: 0.1,
  trendOverride: false,
};

let populateProps = function(p, dp) {
  for (let key of Object.keys(dp)) {
    if (!(key in p)) p[key] = dp[key];
  }
}

if (Meteor.isServer) {
  /* This code only runs on the server */
  Meteor.publish('profiles', function profilesPublication() {
    // Only return workspaces if we are logged in
    if (!this.userId) {
      return this.ready();
    }
    // And the userId matches
    return Profiles.find({userId: this.userId});
  });

  Meteor.users.after.insert(function (userId, doc) {
    console.log(this._id);
    let defaultProfile = {
      name: "default",
      createdAt: new Date(),
      lastAccessed: new Date(),
      userId: this._id,
    }
    populateProps(defaultProfile, DEFAULTS);
    Profiles.insert(defaultProfile);


  });

}



/* Workspace schema validation */
Profiles.schema = new SimpleSchema({
  _id: {type: String, optional: true},
  name: {type: String},
  userId: {type: String},
  lastAccessed: {type: Date},
  createdAt: {type: Date},
  bgEnabled: {type: Boolean},
  bgOpacity: {type: Number, decimal: true},
  signalEnabled: {type: Boolean},
  signalType: {type: String},
  signalOpacity: {type: Number, decimal: true},
  signalColour: {type: String},
  signalBelowColour: {type: String},
  signalAboveColour: {type: String},
  bivariateSignalColours: {type: Boolean},
  processEnabled: {type: Boolean},
  processOpacity: {type: Number, decimal: true},
  gaugeEnabled: {type: Boolean},
  gaugeOpacity: {type: Number, decimal: true},
  gaugeException: {type: Boolean},
  gaugeColour: {type: String},
  trendEnabled: {type: Boolean},
  trendHeight: {type: Number, decimal: true},
  trendOverride: {type: Boolean},
});

export const updateProfileAccessedTime = new ValidatedMethod({
  name: 'profiles.updateAccessedTime',
  validate: new SimpleSchema({
    id: { type: String },
  }).validator(),
  run({
    id
  }) {

    if (! Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    Profiles.update( {_id: id }, { $set: { lastAccessed: new Date() } });
  },
});

Meteor.methods({
  'profiles.updateField'({id, name, value}) {
    new SimpleSchema({
      id: { type: String },
      name: { type: String },
    }).validate({id, name});

    if (! Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    Profiles.update( {_id: id }, { $set: { [name]: value } });
  }
})

export const insertProfile = new ValidatedMethod({
  name: 'profiles.insert',
  validate: new SimpleSchema({
    name: { type: String },
  }).validator(),
  run(data) {

    if (! Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    let newProfile = {
      _id: Random.id(),
      name: data.name,
      createdAt: new Date(),
      lastAccessed: new Date(),
      userId: Meteor.userId(),
    }

    let defaultProfile = Profiles.findOne({name: "default"});
    populateProps(newProfile, defaultProfile);
    // Make sure the entry is valid before inserting it
    check(newProfile, Profiles.schema);
    Profiles.insert(newProfile);
  },
});

export const removeProfile = new ValidatedMethod({
  name: 'profile.remove',
  validate: new SimpleSchema({
    id: { type: String },
  }).validator(),
  run(data) {

    if (Profiles.findOne(data.id).userId != Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    Profiles.remove({_id: data.id});
  },
});
