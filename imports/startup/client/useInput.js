/* eslint-disable react-hooks/rules-of-hooks */
import { useState } from "react";
import _ from 'underscore'
import SimpleSchema from "simpl-schema";

window.SimpleSchema = SimpleSchema
const reserved = ['isValid', 'toObject', 'validation']

const useInput = (obj) => {
	const original = { ...obj };
	obj.validation = {}
	for (let k in original) {
		let isObject =
			typeof obj[k] === "object" && obj[k] !== null && !obj[k]._isAMomentObject;
		let [value, setValue] = useState(isObject ? obj[k].value : obj[k]);
		let [valid, setValid] = useState(null);
		let [texterror, setTextError] = useState(null);
		let [invalid, setInvalid] = useState(null);
		
		function validate(val) {
			try {
				const validationContext = new SimpleSchema({
					[k]: original[k].schema
				}, {
					clean: {
						removeEmptyStrings: true
					}
				}).validate({
					[k]: val === '' ? null : val,
				});
				setValid(true);
				setInvalid(null);
				setTextError(null);
				return true
			} catch (error) {
				setValid(false);
				setInvalid(true);
				setTextError(error.message);
				return false
			}
		}

		function onChange(e) {
			let val;
			switch (e.target.type) {
				case "number":
					val = e.target.value ? parseFloat(e.target.value) : e.target.value
					break;
				case "checkbox":
					val = e.target.checked
					break;
				default:
					val = e.target.value
			}
			setValue(val)
			validate(val)
		}

		obj.validation[k] = {
			validate: validate
		}
		obj[k] = {
			get value() {
				return value;
			},
			set value(val) {
				setValue(val);
			},
			set setschema(val) {
				setSchema(val);
				original[k].schema = val;
			},
			set setinvalid (val) {
				setInvalid(val);
			},
			set settexterror (val) {
				setTextError(val);
			},
			checked: value,
			onChange,
			valid,
			invalid,
			texterror,
			schema: original[k].schema
		};
	}

	obj.toObject = () => {
		return Object.entries(original).reduce((acum, [k]) => {
			acum[k] = obj[k].value;
			return acum;
		}, {});
	};

	obj.isValid = () => {
		let isValid = true;
		for (let k of Object.keys(original)) {
			if (!obj.validation[k].validate(obj[k].value)) {
				console.log({k})
				isValid = false
			}
		}
		return isValid;
	};

	return obj;
};

export default useInput;
