import express from 'express';
import fs from 'fs';
import fetch from 'node-fetch';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;
const fetch = require('node-fetch');


app.use(express.json());

app.post('/log', async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  const userAgent = req.headers['user-agent'] || '';
  const timestamp = new Date().toISOString();

  let locationStr = 'N/A';
  try {
    const response = await fetch(`http://ip-api.com/json/${ip}`);
    const data = await response.json();
    if (data.status === 'success') {
      locationStr = `${data.city}, ${data.country}`;
    }
  } catch (e) {
    locationStr = 'Geo lookup error';
  }

  const safeUserAgent = userAgent.replace(/"/g, "'");

  const logLine = `"${timestamp}","${ip}","${locationStr}","${safeUserAgent}","button-click"\n`;

  fs.appendFile('log.csv', logLine, (err) => {
    if (err) {
      console.error('Errore scrittura CSV:', err);
      return res.status(500).json({ error: 'Log failed' });
    }
    res.json({ success: true });
  });
});

app.listen(PORT, () => {
  console.log(`Server attivo su http://localhost:${PORT}`);
});
