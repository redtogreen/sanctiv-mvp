import React, { useState, useEffect } from 'react';

function Library({ userId }) {
  const [library, setLibrary] = useState([]);
  const [patterns, setPatterns] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5000/library?userId=${userId}`)
      .then(res => res.json())
      .then(data => setLibrary(data));

    fetch(`http://localhost:5000/patterns?userId=${userId}`)
      .then(res => res.json())
      .then(data => setPatterns(data));
  }, [userId]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Your Library</h2>
      <h3 className="text-xl font-semibold">Saved Scriptures</h3>
      {library.map(item => (
        <div key={item.id} className="mb-4 p-4 border rounded">
          <p><strong>{item.scripture.book} {item.scripture.chapter}:{item.scripture.verse}</strong>: "{item.scripture.text}"</p>
          <p>Emotion: {item.emotion}</p>
          <p>Saved: {new Date(item.saved_at).toLocaleDateString()}</p>
        </div>
      ))}
      <h3 className="text-xl font-semibold mt-4">Bookmarked Days</h3>
      {library.filter(item => item.is_bookmark).map(item => (
        <div key={item.id} className="mb-4 p-4 border rounded bg-yellow-100">
          <p>Emotion: {item.emotion}</p>
          <p>Date: {new Date(item.saved_at).toLocaleDateString()}</p>
        </div>
      ))}
      <h3 className="text-xl font-semibold mt-4">Your Journey</h3>
      {patterns.length > 0 ? (
        patterns.map((pattern, idx) => (
          <div key={idx} className="mb-4 p-4 border rounded">
            <p>You've journaled about <strong>{pattern.emotion}</strong> {pattern.count} times.</p>
            <p>Revisit: <strong>{pattern.scripture.book} {pattern.scripture.chapter}:{pattern.scripture.verse}</strong></p>
          </div>
        ))
      ) : (
        <p>Journal more to see patterns in your journey!</p>
      )}
    </div>
  );
}

export default Library;