import { Meteor } from "meteor/meteor";
import "../imports/startup/server/index"


Meteor.startup(() => {
  const mongoUrl = Meteor.settings.mongoUrl;
});
