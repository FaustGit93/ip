import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public'))); // se usi cartella "public" o "frontend"

const logFilePath = path.join(__dirname, 'log.csv');

// Crea intestazione CSV se il file non esiste
if (!fs.existsSync(logFilePath)) {
  fs.writeFileSync(logFilePath, 'timestamp,ip,userAgent,event\n');
}

app.post('/log', async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];
  const timestamp = new Date().toISOString();
  const event = req.body.event || 'unknown';

  const row = `"${timestamp}","${ip}","${userAgent}","${event}"\n`;
  fs.appendFileSync(logFilePath, row);

  console.log(`Logged: ${row.trim()}`);
  res.status(200).json({ success: true });
});

// Serve il file CSV
app.get('/log', (req, res) => {
  if (fs.existsSync(logFilePath)) {
    res.download(logFilePath);
  } else {
    res.status(404).send('Log non trovato');
  }
});

app.listen(port, () => {
  console.log(`Server attivo su http://localhost:${port}`);
});
