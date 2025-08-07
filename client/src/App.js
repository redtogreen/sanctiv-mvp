 import React, { useState, useEffect } from 'react'; 
import Chat from './components/Chat';
import Library from './components/Library';
import Dashboard from './components/Dashboard'; 
import './index.css';

function App() {
  const [tab, setTab] = useState('chat');
  const [userId, setUserId] = useState(localStorage.getItem('userId') || crypto.randomUUID());
  
  useEffect(() => {
    localStorage.setItem('userId', userId);
  }, [userId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-white">
      <nav className="p-4 bg-blue-600 text-white flex justify-around">
        <button onClick={() => setTab('chat')} className={tab === 'chat' ? 'font-bold' : ''}>Chat</button>
        <button onClick={() => setTab('library')} className={tab === 'library' ? 'font-bold' : ''}>Library</button>
        <button onClick={() => setTab('dashboard')} className={tab === 'dashboard' ? 'font-bold' : ''}>Church Dashboard</button>
      </nav>
      <div className="container mx-auto p-4">
        {tab === 'chat' && <Chat userId={userId} />}
        {tab === 'library' && <Library userId={userId} />}
        {tab === 'dashboard' && <Dashboard />}
      </div>
    </div>
  );
}

export default App; 
