import React from "react";
import { createRoot } from "react-dom/client";
import { Meteor } from "meteor/meteor";
import { App } from "/imports/ui/App";
import toastr from "toastr";

// import "./imports/startup/stylesheets/custom.css";
import "../client/js/app.bundle";
import "../client/js/vendors.bundle";
import "../client/js/sync";
import "../client/css/app.bundle.css";
import "../client/css/vendors.bundle.css";
import "../client/css/dropzone.css";
import "../client/stylesheets/timeline.css";
import "toastr/build/toastr.css";
import "animate.css/animate.css";

import bootbox from "bootbox/bootbox";
import Waves from "node-waves";
window.bootbox = bootbox;
window.Waves = Waves;

toastr.options = {
  closeButton: true,
  debug: false,
  newestOnTop: false,
  progressBar: true,
  positionClass: "toast-top-right",
  preventDuplicates: false,
  onclick: null,
  showDuration: "300",
  hideDuration: "1000",
  timeOut: "5000",
  extendedTimeOut: "1000",
  showEasing: "swing",
  hideEasing: "linear",
  showMethod: "fadeIn",
  hideMethod: "fadeOut",
};

Meteor.download = function (file) {
  let link = document.createElement("a");
  link.download = file.name;
  link.href = file.uri;
  link.click();
};

Meteor.startup(() => {
  const container = document.getElementById("react-target");
  const root = createRoot(container);
  root.render(<App />);
});
