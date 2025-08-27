import React from 'react';
import PropTypes from 'prop-types';

export const ToggleGroup = ({ type, children, value, onValueChange }) => {
  return (
    <div className="toggle-group" data-type={type}>
      {React.Children.map(children, child =>
        React.cloneElement(child, {
          isActive: child.props.value === value,
          onToggle: () => onValueChange(child.props.value)
        })
      )}
    </div>
  );
};

ToggleGroup.propTypes = {
  type: PropTypes.oneOf(['single', 'multiple']).isRequired,
  children: PropTypes.node.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  onValueChange: PropTypes.func.isRequired,
};

export const ToggleGroupItem = ({ value, ariaLabel, children, isActive, onToggle }) => {
  return (
    <button
      className={`toggle-group-item ${isActive ? 'active' : ''}`}
      aria-label={ariaLabel}
      onClick={onToggle}
      value={value}
    >
      {children}
    </button>
  );
};

ToggleGroupItem.propTypes = {
  value: PropTypes.string.isRequired,
  ariaLabel: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  isActive: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};