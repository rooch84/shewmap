import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';

import '../imports/util/accounts.js';
import DataWrapper from '../imports/ui/DataWrapper.jsx';

Meteor.startup(() => {
  render(<DataWrapper />, document.getElementById('render-target'));
});
