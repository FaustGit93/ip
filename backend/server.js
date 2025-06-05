import express from 'express';
import fs from 'fs';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/log', async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];
  const event = req.body.event || 'unknown';
  const timestamp = new Date().toISOString();

  let locationData = {};
  try {
    const geo = await fetch(`http://ip-api.com/json/${ip}`);
    locationData = await geo.json();
  } catch (err) {
    locationData = { status: 'fail', message: 'geo lookup failed' };
  }

  const logEntry = `"${timestamp}","${ip}","${userAgent}","${locationData.country || ''}","${locationData.city || ''}","${event}"\n`;
  fs.appendFile('iplog.csv', logEntry, (err) => {
    if (err) {
      console.error('Errore nel salvataggio:', err);
      return res.status(500).send('Errore nel salvataggio');
    }
    res.send('Dati salvati');
  });
});

app.listen(port, () => {
  console.log(`Server online sulla porta ${port}`);
});
