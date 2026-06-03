import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import PresentationView from './components/PresentationView.jsx';
import MasterTable from './components/MasterTable.jsx';
import DetailView from './components/DetailView.jsx';
import { initialFlights } from './data/flights.js';

const BACKEND_URL = window.location.hostname.includes('onrender.com') ? 'https://calypso-backend-6jr6.onrender.com' : `https://${window.location.hostname}:3001`;
const socket = io(BACKEND_URL);

function App() {
  const [flights, setFlights] = useState(initialFlights); 
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = isRegisterMode ? 'register' : 'login';

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password: passwordInput })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'An error occurred during authentication');
      }

      if (isRegisterMode) {
        alert('Account successfully created! You can now log in.');
        setIsRegisterMode(false);
        setPasswordInput('');
      } else {
        localStorage.setItem('token', data.token);
        setToken(data.token);
      }
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUsernameInput('');
    setPasswordInput('');
  };

  useEffect(() => {
    if (!token) return;
    let inactivityTimer;

    const INACTIVITY_LIMIT = 60000; 

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        handleLogout();
        alert('You have been automatically logged out due to inactivity!');
      }, INACTIVITY_LIMIT);
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);
    window.addEventListener('scroll', resetTimer);

    resetTimer();

    return () => {
      clearTimeout(inactivityTimer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('scroll', resetTimer);
    };
  }, [token]);

    useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineData(); 
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    socket.on('flight_added', (newFlight) => {
      setFlights((prevFlights) => [...prevFlights, newFlight]);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      socket.off('flight_added');
    };
  }, []);

  const syncOfflineData = () => {
    const offlineFlights = JSON.parse(localStorage.getItem('offline_flights') || '[]');
    if (offlineFlights.length > 0) {
      fetch(`${BACKEND_URL}/api/flights/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offlineFlights)
      }).then(() => {
        localStorage.removeItem('offline_flights');
        alert("Back online: Data synchronized with server!");
      });
    }
  };

  const startGenerator = () => fetch(`${BACKEND_URL}/api/generator/start`, { method: 'POST' });
  const stopGenerator = () => fetch(`${BACKEND_URL}/api/generator/stop`, { method: 'POST' });

  const eraseFlight = (id) => {
    setFlights(flights.filter(f => f.id !== id));
  };

  const addFlight = (newFlight) => {
    if (!isOnline) {
      const offlineFlights = JSON.parse(localStorage.getItem('offline_flights') || '[]');
      localStorage.setItem('offline_flights', JSON.stringify([...offlineFlights, newFlight]));
      alert("Offline: Saved locally. Will sync when connection returns.");
    }
    setFlights([...flights, newFlight]);
    document.cookie = `last_dest=${newFlight.destination}; max-age=86400; path=/`;
  };

  const updateFlightStatus = (id) => {
    setFlights(flights.map(f => f.id === id 
      ? { ...f, status: f.status === 'On Time' ? 'Delayed' : 'On Time' } 
      : f));
  };

  const handleSelect = (flight) => {
    setSelectedFlight(flight);
    if(flight) document.cookie = `last_viewed_id=${flight.id}; max-age=86400; path=/`;
  };

  if (!token) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f0f2f5' }}>
        <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '340px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#1a1a1a' }}>
            {isRegisterMode ? '✈️ Sign In to Calypso Air' : '✈️ Connect to Calypso Air'}
          </h2>
          
          {authError && (
            <div style={{ color: '#d93025', backgroundColor: '#fce8e6', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px', textAlign: 'center', border: '1px solid #fad2cf' }}>
              {authError}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold', color: '#5f6368' }}>User</label>
              <input type="text" placeholder="Enter the username" value={usernameInput} onChange={e => setUsernameInput(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #dadce0', boxSizing: 'border-box' }} />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold', color: '#5f6368' }}>Password</label>
              <input type="password" placeholder="At least 6 characters" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #dadce0', boxSizing: 'border-box' }} />
            </div>

            <button type="submit" style={{ width: '100%', padding: '12px', background: '#1a73e8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginTop: '10px' }}>
              {isRegisterMode ? 'Create new account' : 'Log in'}
            </button>
          </form>

          <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#5f6368' }}>
            {isRegisterMode ? 'Already have an account?' : "Don't have an account?"} {' '}
            <span onClick={() => { setIsRegisterMode(!isRegisterMode); setAuthError(''); }} style={{ color: '#1a73e8', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}>
              {isRegisterMode ? 'Connect' : 'Register'}
            </span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <div style={{ backgroundColor: isOnline ? '#e8f5e9' : '#ffebee', padding: '10px', textAlign: 'center', position: 'relative' }}>
        <strong>Status: {isOnline ? 'Online' : 'OFFLINE (Local Mode)'}</strong>
        
        {}
        <button onClick={handleLogout} style={{ position: 'absolute', right: '10px', top: '5px', padding: '5px 12px', backgroundColor: '#d93025', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
          Logout
        </button>
      </div>

      <div style={{ padding: '10px', background: '#f0f0f0', textAlign: 'center' }}>
        <button onClick={startGenerator} style={{ marginRight: '10px', backgroundColor: 'green', color: 'white' }}>
          Start Async Generator (Silver)
        </button>
        <button onClick={stopGenerator} style={{ backgroundColor: 'red', color: 'white' }}>
          Stop Generator
        </button>
      </div>

      <PresentationView />

      {!selectedFlight ? (
        <MasterTable 
          flights={flights}      
          onErase={eraseFlight}  
          onAdd={addFlight}
          onUpdate={updateFlightStatus}
          onSelectFlight={handleSelect} 
        />
      ) : (
        <DetailView flight={selectedFlight} onBack={() => handleSelect(null)} />
      )}
    </div>
  );
}

export default App;