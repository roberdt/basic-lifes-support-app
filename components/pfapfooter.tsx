import React from 'react';

export default function Pfapfooter() {
  const footerHTML: React.CSSProperties = {
    position: 'fixed',
    left: '0',
    bottom: '0',
    width: '100%',
    backgroundColor: '#0074C8',
    clear: 'both',
    textAlign: 'center',
    color: 'white',
    zIndex: 1200,
  };

  const footerStyle: React.CSSProperties = {
    fontSize: 'small',
    fontFamily: 'Verdana, Geneva, Tahoma, sans-serif',
    color: 'white',
    fontWeight: 'bold',
  };

  return (
    <div style={footerHTML}>
      <br />
      <span style={footerStyle}>© 2026 SafetyNetAccess.org™ LLC. All Rights Reserved.</span>
      <br />
      <br />
    </div>
  );
}

