import React, { useState, useEffect } from 'react';
import scriptures from '../scriptures.json';

function Chat({ userId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const detectEmotion = (text) => {
    if (text.toLowerCase().includes('anxious') || text.toLowerCase().includes('worried')) return 'anxiety';
    if (text.toLowerCase().includes('lonely') || text.toLowerCase().includes('alone')) return 'loneliness';
    if (text.toLowerCase().includes('happy') || text.toLowerCase().includes('joy')) return 'joy';
    return 'general';
  };

  const getAIResponse = async (text) => {
    const emotion = detectEmotion(text);
    const scripture = scriptures.find(s => s.emotion === emotion) || scriptures.find(s => s.emotion === 'general');
    const empatheticText = `I hear how deeply you're feeling ${emotion === 'general' ? 'this moment' : emotion}. It's okay to sit with these emotions.`;
    const question = scripture.question;
    return { empatheticText, scripture: scripture, question };
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    
    const response = await getAIResponse(input);
    const aiMessage = {
      role: 'ai',
      content: `${response.empatheticText}\n\n**${response.scripture.book} ${response.scripture.chapter}:${response.scripture.verse}**: "${response.scripture.text}"\n\n**${response.question}**`,
      scripture: response.scripture,
      emotion
    };
    setMessages([...messages, userMessage, aiMessage]);

    await fetch('http://localhost:5000/journal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, text: input, emotion, scriptureId: response.scripture.id })
    });

    setInput('');
  };

  const handleVoiceInput = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsRecording(false);
      handleSubmit();
    };
    recognition.onend = () => setIsRecording(false);
    setIsRecording(true);
    recognition.start();
  };

  const handleTextToSpeech = (text) => {
    const utterance = new SpeechSynthesisUtterance(text.replace(/\*\*/g, ''));
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleSaveScripture = async (scripture) => {
    await fetch('http://localhost:5000/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, scriptureId: scripture.id, emotion: detectEmotion(messages[messages.length - 2].content) })
    });
    alert('Scripture saved to Library!');
  };

  const handleBookmarkDay = async () => {
    await fetch('http://localhost:5000/bookmark', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, emotion: detectEmotion(messages[messages.length - 2].content), date: new Date().toISOString().split('T')[0] })
    });
    alert('Day bookmarked in Library!');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="h-96 overflow-y-auto mb-4 p-4 border rounded">
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>
              {msg.content}
              {msg.role === 'ai' && (
                <div className="mt-2">
                  <button onClick={() => handleSaveScripture(msg.scripture)} className="text-blue-600 mr-2">Save Scripture</button>
                  <button onClick={handleBookmarkDay} className="text-blue-600 mr-2">Bookmark Day</button>
                  <button onClick={() => handleTextToSpeech(msg.content)} className="text-blue-600">
                    {isSpeaking ? 'Stop Speech' : 'Read Aloud'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-2 border rounded-l"
          placeholder="Share how you're feeling..."
        />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded-r">Send</button>
        <button
          type="button"
          onClick={handleVoiceInput}
          className={`ml-2 p-2 ${isRecording ? 'bg-red-600' : 'bg-blue-600'} text-white rounded`}
        >
          {isRecording ? 'Stop' : 'Voice'}
        </button>
      </form>
    </div>
  );
}

export default Chat;