import { Mongo } from "meteor/mongo";

const Accesos = new Mongo.Collection("accesos");
const Permisos = new Mongo.Collection("permisos");
const Bitacoras = new Mongo.Collection("bitacoras");

export { Accesos, Permisos, Bitacoras };
