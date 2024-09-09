import moment from "moment-timezone";
moment.tz.setDefault("America/Mazatlan");

Meteor.callSync = (method, params) => {
  return new Promise((resolve, reject) => {
    Meteor.call(method, params, (err, res) => {
      if (err) {
        return reject(err);
      }
      resolve(res);
    });
  });
};

Accounts.validateLoginAttempt((options) => {
  if (options.user && options.user.profile && !options.user.profile.estatus) {
    throw new Meteor.Error("Usuario deshabilitado", "Usuario deshabilitado");
  }
  return true;
  // if (!options.allowed && options.error) {
  //   throw options.error;
  // } else
});

Accounts.config({
  loginExpirationInDays: 11,
});

if (Meteor.isDevelopment) {
  Meteor.settings.urlBase =
    "http://cloud.calzzapato.com/ApiCore/GrupoCalzapato_General/";
} else {
  Meteor.settings.urlBase =
    "http://cloud.calzzapato.com/ApiCore/GrupoCalzapato_General/";
}

import "../../api/collections/Collections";
import "../../api/collections/Page";
import "../../api/collections/Role";

import "../../api/methods/api";
import "../../api/methods/clientesAuth";
import "../../api/methods/getApiMethods";
import "../../api/methods/page";
import "../../api/methods/roles";
import "../../api/methods/usuarios";
import "../../api/methods/empresas";

import "./startup";
import "./initialLoad";
