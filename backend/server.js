import express from 'express';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const logPath = path.join(__dirname, 'log.csv');

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.post('/log', async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];

  let location = {};
  try {
    const response = await fetch(`http://ip-api.com/json/${ip}`);
    location = await response.json();
  } catch (err) {
    location = { status: 'fail', message: 'Could not fetch location' };
  }

  const now = new Date().toISOString();
  const data = `"${now}","${ip}","${userAgent}","${location.city || ''}","${location.country || ''}"\n`;

  fs.appendFile(logPath, data, (err) => {
    if (err) {
      console.error('Errore nel salvataggio del log:', err);
      return res.status(500).send('Errore nel salvataggio');
    }
    res.send('Log salvato');
  });
});

app.get('/log', (req, res) => {
  if (fs.existsSync(logPath)) {
    res.sendFile(logPath);
  } else {
    res.status(404).send('Nessun log trovato');
  }
});

app.listen(PORT, () => {
  console.log(`Server avviato sulla porta ${PORT}`);
});
