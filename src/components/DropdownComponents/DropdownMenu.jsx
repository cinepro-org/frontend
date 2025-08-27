import React from 'react';
import PropTypes from 'prop-types';

export const DropdownMenu = ({ children }) => {
  return <div className="dropdown-menu-root">{children}</div>;
};

DropdownMenu.propTypes = {
  children: PropTypes.node.isRequired,
};


export const DropdownMenuTrigger = ({ children }) => {
  return children;
};

DropdownMenuTrigger.propTypes = {
  asChild: PropTypes.bool,
  children: PropTypes.node.isRequired,
};


export const DropdownMenuContent = ({ className, children, onBlur, setIsOpen }) => {
  const handleBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      onBlur && onBlur();
      setIsOpen(false);
    }
  };
  return (
    <div
      className={`dropdown-menu-content ${className}`}
      onBlur={handleBlur}
      tabIndex="-1"
    >
      {children}
    </div>
  );
};

DropdownMenuContent.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  onBlur: PropTypes.func,
  setIsOpen: PropTypes.func.isRequired,
};


export const DropdownMenuLabel = ({ children }) => {
  return <div className="dropdown-menu-label">{children}</div>;
};

DropdownMenuLabel.propTypes = {
  children: PropTypes.node.isRequired,
};


export const DropdownMenuRadioGroup = ({ value, onValueChange, children }) => {
  return (
    <div className="dropdown-menu-radio-group">
      {React.Children.map(children, child =>
        React.cloneElement(child, {
          isSelected: child.props.value === value,
          onSelect: () => onValueChange(child.props.value),
        })
      )}
    </div>
  );
};

DropdownMenuRadioGroup.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onValueChange: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

export const DropdownMenuRadioItem = ({ value, onSelect, isSelected, children }) => {
  return (
    <button
      className={`dropdown-menu-radio-item ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
      role="menuitemradio"
      aria-checked={isSelected}
      value={value}
    >
      {children}
    </button>
  );
};

DropdownMenuRadioItem.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onSelect: PropTypes.func.isRequired,
  isSelected: PropTypes.bool,
  children: PropTypes.node.isRequired,
};


export const DropdownMenuSeparator = () => {
  return <div className="dropdown-menu-separator" />;
};

DropdownMenuSeparator.propTypes = {};