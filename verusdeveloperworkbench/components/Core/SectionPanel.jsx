import React from 'react';

const SectionPanel = ({ title, children }) => {
  return (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  );
};

export default SectionPanel; 