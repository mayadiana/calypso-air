import React from 'react';

const PresentationView = () => {
  return (
    <div style={{ padding: '40px', textAlign: 'center', borderBottom: '2px solid #6A0DAD' }}>
      <div style={{ fontSize: '50px' }}>✈️</div>
      <h1 style={{ color: '#6A0DAD', margin: '10px 0' }}>Calypso Air</h1>
      <h3 style={{ color: '#FF007F', fontWeight: 'normal' }}>Your gateway to the skies</h3>
      <p style={{ maxWidth: '600px', margin: '20px auto', lineHeight: '1.6' }}>
        Welcome to Calypso Air, where we redefine flight management. 
        Our platform provides seamless tracking and management of your global fleet 
        with efficiency and style.
      </p>
    </div>
  );
};

export default PresentationView;