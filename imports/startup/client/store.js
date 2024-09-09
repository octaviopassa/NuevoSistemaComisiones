import { Base64 } from "js-base64";
import { createStore } from "redux";
import { persistReducer, persistStore, createTransform } from "redux-persist";

import storage from "redux-persist/lib/storage";
import app from "../../ui/reducers/index.js";

const encrypt = createTransform(
	(inboundState) => {
		return Base64.encode(JSON.stringify(inboundState));
	},
	(outboundState) => {
		return JSON.parse(Base64.decode(outboundState));
	},
	{
		whitelist: ["user"],
	}
);

const persistConfig = {
	key: "root",
	storage,
	transforms: [encrypt],
};

const persistedReducer = persistReducer(persistConfig, app);
export const store = createStore(persistedReducer);
export const persistor = persistStore(store);
