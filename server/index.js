const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run(`CREATE TABLE journals (id TEXT, user_id TEXT, text TEXT, emotion TEXT, scripture_id TEXT, created_at TEXT)`);
  db.run(`CREATE TABLE library (id TEXT, user_id TEXT, scripture_id TEXT, emotion TEXT, is_bookmark INTEGER, saved_at TEXT)`);
  db.run(`CREATE TABLE insights (id TEXT, church_id TEXT, emotion TEXT, scripture_id TEXT, count INTEGER, timestamp TEXT)`);
});

const encrypt = (text) => {
  const cipher = crypto.createCipher('aes-256-cbc', 'secret-key');
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

app.post('/journal', (req, res) => {
  const { userId, text, emotion, scriptureId } = req.body;
  const id = crypto.randomUUID();
  const encryptedText = encrypt(text);
  db.run(
    `INSERT INTO journals (id, user_id, text, emotion, scripture_id, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
    [id, userId, encryptedText, emotion, scriptureId, new Date().toISOString()],
    () => {
      db.run(
        `INSERT OR REPLACE INTO insights (id, church_id, emotion, scripture_id, count, timestamp)
         VALUES (?, ?, ?, ?, COALESCE((SELECT count + 1 FROM insights WHERE emotion = ? AND scripture_id = ?), 1), ?)`,
        [crypto.randomUUID(), 'church1', emotion, scriptureId, emotion, scriptureId, new Date().toISOString().split('T')[0]],
        () => res.json({ success: true })
      );
    }
  );
});

app.post('/save', (req, res) => {
  const { userId, scriptureId, emotion } = req.body;
  const id = crypto.randomUUID();
  db.run(
    `INSERT INTO library (id, user_id, scripture_id, emotion, is_bookmark, saved_at) VALUES (?, ?, ?, ?, 0, ?)`,
    [id, userId, scriptureId, emotion, new Date().toISOString()],
    () => res.json({ success: true })
  );
});

app.post('/bookmark', (req, res) => {
  const { userId, emotion, date } = req.body;
  const id = crypto.randomUUID();
  db.run(
    `INSERT INTO library (id, user_id, scripture_id, emotion, is_bookmark, saved_at) VALUES (?, ?, ?, ?, 1, ?)`,
    [id, userId, null, emotion, date],
    () => res.json({ success: true })
  );
});

app.get('/library', (req, res) => {
  const { userId } = req.query;
  db.all(
    `SELECT l.*, s.book, s.chapter, s.verse, s.text FROM library l
     LEFT JOIN scriptures s ON l.scripture_id = s.id
     WHERE l.user_id = ?`,
    [userId],
    (err, rows) => {
      res.json(rows.map(row => ({
        id: row.id,
        scripture: row.book ? { book: row.book, chapter: row.chapter, verse: row.verse, text: row.text } : null,
        emotion: row.emotion,
        is_bookmark: row.is_bookmark,
        saved_at