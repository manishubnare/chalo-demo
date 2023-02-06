import React from 'react'

const HidableComponent = (Component) => (props) => {
    const { isHidden, children, ...componentProps } = props;
    if(isHidden){
      return null;
    }
  
    return (<Component {...componentProps}>{children}</Component>);
}
  
export default HidableComponent;