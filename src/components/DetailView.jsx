import React from 'react';

const DetailView = ({ flight, onBack }) => {
  if (!flight) return null;

  return (
    <div style={{ padding: '20px', border: '2px solid #FF007F', borderRadius: '8px', margin: '20px' }}>
      <button onClick={onBack}>⬅ Back to List</button>
      <h2 style={{ color: '#6A0DAD' }}>Flight Details: {flight.id}</h2>
      <p><strong>Destination:</strong> {flight.destination}</p>
      <p><strong>Current Status:</strong> {flight.status}</p>
      <hr />
      <p><strong>Pilot in Command:</strong> {flight.pilot}</p>
      <p><strong>Aircraft Model:</strong> {flight.plane}</p>
    </div>
  );
};

export default DetailView;