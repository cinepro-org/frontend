import { Menu } from '@vidstack/react';
import { ListVideoIcon } from 'lucide-react';
import PropTypes from 'prop-types';


function SourceSubmenu({ sources, selectedValue, onSelect }) {
//   const selectedLabel = sources.find(s => s.value === selectedValue)?.label || 'Source';

  return (
    <Menu.Root>
      <Menu.Button className='vds-menu-button vds-button' style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backdropFilter: 'blur(10px)' }}>
        <ListVideoIcon className='vds-icon' />
      
      </Menu.Button>
      <Menu.Content placement={'top center'}>
        <Menu.RadioGroup
          value={selectedValue}
          className='vds-settings-menu-items vds-menu-items'
          style={{
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
           background: '#222222d4',
            borderRadius: '10px',
            overflow: 'auto',
            transition: 'all 0.4s ease-in-out',
            maxHeight: '400px',
          }}
        >
          <h4 className='custom-vds-menu-item-label'>Sources</h4>
          {sources.map((source) => (
            <Menu.Radio
              value={source.value}
              onSelect={() => onSelect(source.value)}
              key={source.value}
              className='vds-menu-item'
            >
              {source.label}
            </Menu.Radio>
          ))}
        </Menu.RadioGroup>
      </Menu.Content>
    </Menu.Root>
  );
}

export default SourceSubmenu;

SourceSubmenu.propTypes = {
  sources: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  selectedValue: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
};
