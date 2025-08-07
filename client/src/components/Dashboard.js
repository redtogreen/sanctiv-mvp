import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title);

function Dashboard() {
  const [insights, setInsights] = useState({ emotions: [], scriptures: [] });
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'church123') {
      setIsAuthenticated(true);
      fetch('http://localhost:5000/insights')
        .then(res => res.json())
        .then(data => setInsights(data));
    } else {
      alert('Incorrect password');
    }
  };

  const emotionData = {
    labels: insights.emotions.map(e => e.emotion),
    datasets: [{
      label: 'Emotion Distribution',
      data: insights.emotions.map(e => e.count),
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
    }]
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Church Insights Dashboard</h2>
      {!isAuthenticated ? (
        <form onSubmit={handleLogin} className="mb-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-2 border rounded"
            placeholder="Enter password"
          />
          <button type="submit" className="ml-2 bg-blue-600 text-white p-2 rounded">Login</button>
        </form>
      ) : (
        <div>
          <h3 className="text-xl font-semibold">Emotional Trends</h3>
          <Bar data={emotionData} options={{ responsive: true, plugins: { title: { display: true, text: 'User Emotions