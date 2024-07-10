import React from 'react'

interface Props {
  children: any;
}

const FancyDiv: React.FC<Props> = ({ children }) => {
  return <div style={{ border: '1px solid red' }}>{children}</div>
}
export default FancyDiv
