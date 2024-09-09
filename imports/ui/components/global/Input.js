import React, { useState } from 'react';
import { Input as BootInput } from 'reactstrap';
import CustomSelect from './CustomSelect';

function validationError(valid, texterror) {
  if (!valid && texterror) {
    return <div className="invalid-feedback">{texterror}</div>;
  }
  return null;
}

function Input({ valid, texterror, ...props }) {
  const label = props.schema?.label || props.label;
  const [id] = useState(Math.random());
  if (props.type == undefined || props.type == 'text') {
    return (
      <div className={`form-group`}>
        <label className="form-label" htmlFor={label}>
          {label}
        </label>
        <BootInput {...props} name={props.name} valid={valid} />
        {validationError(valid, texterror)}
      </div>
    );
  } else if (props.type == 'checkbox') {
    return (
      <div className="custom-control custom-switch">
        <input
          type="checkbox"
          className="custom-control-input"
          id={id}
          {...props}
        />
        {
          <label className="custom-control-label" htmlFor={id}>
            {label || ''}
          </label>
        }
      </div>
    );
  } else if (props.type == 'select') {
    return (
      <div className={`form-group`}>
        <label className="form-label" htmlFor={id}>
          {label}
        </label>
        <CustomSelect
          className="form-control"
          {...props}
          valid={valid}
        ></CustomSelect>
        {validationError(valid, props.texterror)}
      </div>
    );
  } else {
    return (
      <div className={`form-group`}>
        <label className="form-label" htmlFor={label}>
          {label}
        </label>
        <BootInput {...props} valid={valid} />
        {validationError(valid, props.texterror)}
      </div>
    );
  }
}

export default Input;
