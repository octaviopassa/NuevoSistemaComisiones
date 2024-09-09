import Select from 'react-select';
import React from 'react';
import _ from 'underscore';
import { useTranslation } from 'react-i18next';

const CustomSelect = ({
  onChange,
  options,
  value,
  isMulti,
  valid,
  invalid,
  children,
  schema,
  disabled
}) => {
  const { t } = useTranslation();
  const color = () => {
    if (valid) {
      return '#1dc9b7';
    }
    return invalid ? '#fd3995' : '#E5E5E5';
  };

  if (children) {
    options = [];
    children.forEach((a) => {
      if (_.isArray(a)) {
        return a.forEach((b) => {
          options.push({
            label: b?.props?.children,
            value: b?.props?.value,
          });
        });
      }
      options.push({
        label: a?.props?.children,
        value: a?.props?.value,
      });
    });
  }

  return (
    <Select
      placeholder={t('select.emptyOption')}
      styles={{
        control: (baseStyles) => ({
          ...baseStyles,
          borderColor: color(),
        }),
      }}
      isDisabled={disabled}
      isClearable={!schema || schema.optional ? true : false}
      blurInputOnSelect="true"
      options={options}
      onChange={(val) => {
        if (!val) {
          onChange({
            target: {
              type: 'select',
              value: "",
            },
          });
        } else {
          onChange({
            target: {
              type: 'select',
              value: isMulti ? val.map((c) => c.value) : val.value,
            },
          });
        }
      }}
      value={
        isMulti
          ? options.filter((c) => value.includes(c.value))
          : options.find((c) => c.value === value)
      }
      isMulti={isMulti}
    />
  );
};

export default CustomSelect;
