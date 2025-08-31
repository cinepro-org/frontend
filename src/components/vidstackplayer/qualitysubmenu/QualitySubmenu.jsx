import { Menu, useVideoQualityOptions  } from '@vidstack/react';

import '../Videoplayer.css';

function QualitySubmenu() {
  const options = useVideoQualityOptions({ auto: true, sort: 'descending' }),
    currentQualityHeight = options.selectedQuality?.height,
    hint =
      options.selectedValue !== 'auto' && currentQualityHeight
        ? `${currentQualityHeight}p`
        : `Auto${currentQualityHeight ? ` - ${currentQualityHeight}p` : ''}`;
  return (
    
    <Menu.Root>
      
      <Menu.Button disabled={options.disabled} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' , backdropFilter: 'blur(10px)' , WebkitBackdropFilter: 'blur(10px)', padding: '11px !important',flexWrap: 'nowrap' , lineClamp: '1' }} className='custom-vds-button'> {hint}</Menu.Button>
      <Menu.Content placement={'top center'}>
        <Menu.RadioGroup value={options.selectedValue} className='vds-settings-menu-items vds-menu-items' style={{ backdropFilter: 'blur(10px)' , WebkitBackdropFilter: 'blur(10px)' , background: '#222222d4' ,borderRadius: '10px' ,transition: 'all 0.4s ease-in-out'}}>
          <h4 className='custom-vds-menu-item-label'>Quality</h4>
          {options.map(({  label, value, select }) => (
            <Menu.Radio value={value} onSelect={select} key={value} className='vds-menu-item' >
              {label}
            </Menu.Radio>
          ))}
        </Menu.RadioGroup>
      </Menu.Content>
    </Menu.Root>
  );
}

export default QualitySubmenu;