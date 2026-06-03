import React, { useState } from 'react';

const MasterTable = ({ flights, onErase, onAdd, onUpdate, onSelectFlight }) => {
  const [formData, setFormData] = useState({ 
    id: '', 
    destination: '', 
    status: 'On Time', 
    pilot: '', 
    plane: '' 
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3; 

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = flights.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(flights.length / itemsPerPage);

  const handleAddSubmit = (e) => {
  e.preventDefault();
  
  if (!formData.id || !formData.destination || !formData.pilot) {
    alert("Validation Error: ID, Destination, and Pilot are required!");
    return;
  }

  if (flights.find(f => f.id.toString() === formData.id.toString())) {
    alert("Validation Error: This Flight ID already exists!");
    return;
  }

  onAdd(formData);
  setFormData({ id: '', destination: '', status: 'On Time', pilot: '', plane: '' }); 
};
  return (
    <div style={{ padding: '20px' }}>
      {}
      <div style={{ 
        marginBottom: '30px', 
        padding: '20px', 
        backgroundColor: '#fff', 
        border: '1px solid #6A0DAD', 
        borderRadius: '10px' 
      }}>
        <h3 style={{ color: '#6A0DAD', marginTop: 0 }}>Add New Flight</h3>
        <form onSubmit={handleAddSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input 
            type="text" placeholder="Flight ID" 
            value={formData.id} 
            onChange={e => setFormData({...formData, id: e.target.value})} 
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <input 
            type="text" placeholder="Destination" 
            value={formData.destination} 
            onChange={e => setFormData({...formData, destination: e.target.value})} 
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <input 
            type="text" placeholder="Pilot Name" 
            value={formData.pilot} 
            onChange={e => setFormData({...formData, pilot: e.target.value})} 
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <input 
            type="text" placeholder="Plane Model" 
            value={formData.plane} 
            onChange={e => setFormData({...formData, plane: e.target.value})} 
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <button 
            type="submit" 
            style={{ backgroundColor: '#6A0DAD', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '4px', cursor: 'pointer' }}
          >
            + Add Flight
          </button>
        </form>
      </div>

      {}
      <h2 style={{ color: '#213547' }}>Flight Management (Master View)</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8f9fa', textAlign: 'left', borderBottom: '2px solid #6A0DAD' }}>
            <th style={{ padding: '12px', border: '1px solid #eee' }}>ID</th>
            <th style={{ padding: '12px', border: '1px solid #eee' }}>Destination</th>
            <th style={{ padding: '12px', border: '1px solid #eee' }}>Status</th>
            <th style={{ padding: '12px', border: '1px solid #eee' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((flight) => (
            <tr key={flight.id} style={{ borderBottom: '1px solid #eee' }} data-testid="flight-row">
              <td style={{ padding: '12px' }}>{flight.id}</td>
              <td style={{ padding: '12px' }}>{flight.destination}</td>
              <td style={{ padding: '12px' }}>
                <span style={{ 
                  padding: '4px 8px', 
                  borderRadius: '12px', 
                  backgroundColor: flight.status === 'Delayed' ? '#ffebee' : '#e8f5e9',
                  color: flight.status === 'Delayed' ? '#c62828' : '#2e7d32'
                }}>
                  {flight.status}
                </span>
              </td>
              <td style={{ padding: '12px', display: 'flex', gap: '8px' }}>
                {}
                <button onClick={() => onSelectFlight(flight)} style={{ cursor: 'pointer' }}>Details</button>
                <button 
                  onClick={() => onUpdate(flight.id)} 
                  style={{ backgroundColor: '#e0e0e0', cursor: 'pointer' }}
                >
                  Toggle Status
                </button>
                <button 
                  onClick={() => onErase(flight.id)}
                  style={{ backgroundColor: '#ff4d4d', color: 'white', border: 'none', cursor: 'pointer', padding: '5px 10px', borderRadius: '4px' }}
                >
                  Erase
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {}
      <div style={{ marginTop: '20px', display: 'flex', gap: '15px', justifyContent: 'center', alignItems: 'center' }}>
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>Previous</button>
        <span style={{ fontWeight: 'bold' }}>Page {currentPage} of {totalPages || 1}</span>
        <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>Next</button>
      </div>
    </div>
  );
};

export default MasterTable;