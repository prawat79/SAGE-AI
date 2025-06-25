import React from 'react';

const App = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: 'blue' }}>FlowGPT Clone - Test</h1>
      <p>If you can see this, React is working!</p>
      <div style={{ 
        backgroundColor: '#f0f0f0', 
        padding: '10px', 
        borderRadius: '5px',
        marginTop: '20px'
      }}>
        <h2>Status Check:</h2>
        <ul>
          <li>✅ React is mounting</li>
          <li>✅ JSX is rendering</li>
          <li>✅ Styles are working</li>
        </ul>
      </div>
    </div>
  );
};

export default App;