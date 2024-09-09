import React from "react";
import { Meteor } from "meteor/meteor";
import { BrowserRouter } from "react-router-dom";
import * as ReactDOM from "react-dom";
import App from "/imports/ui/App";
import toastr from "toastr";

// import "./imports/startup/stylesheets/custom.css";
import "../../../client/js/app.bundle";
import "../../../client/js/vendors.bundle";
import "../../../client/js/sync";

import "../../../client/css/app.bundle.css";
import "../../../client/css/vendors.bundle.css";
import "toastr/build/toastr.css";
import "animate.css/animate.css";

import bootbox from "bootbox/bootbox.all";
import Waves from "node-waves";
window.bootbox = bootbox;
window.Waves = Waves;

toastr.options = {
  progressBar: true,
};
Meteor.download = function (file) {
  let link = document.createElement("a");
  link.download = file.name;
  link.href = file.uri;
  link.click();
};

import { Provider } from "react-redux";
import { store } from "./store.js";

import "./i18n";

Meteor.startup(() => {
  const rootElement = document.getElementById("react-target");
  if (rootElement) {
    const root = createRoot(rootElement); // Crea una raíz con createRoot.
    root.render(
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    );
  } else {
    console.error("Failed to find the root element");
  }
});
