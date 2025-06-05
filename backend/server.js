import express from 'express';
import cors from 'cors';
import fs from 'fs';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const CSV_PATH = './log.csv';

if (!fs.existsSync(CSV_PATH)) {
  fs.writeFileSync(CSV_PATH, `"IP","OS","Location"\n`);
}

app.post('/log', async (req, res) => {
  const ipRaw = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const ip = ipRaw.split(',')[0].trim();

  const userAgent = req.get('User-Agent') || '';
  const osMatch = userAgent.match(/\(([^)]+)\)/);
  const os = osMatch ? osMatch[1] : 'Unknown';

  let location = '';
  try {
    const geoRes = await fetch(`https://ipapi.co/${ip}/country_name/`);
    location = await geoRes.text();
    if (location.length > 100 || location.includes('<')) location = '';
  } catch {
    location = '';
  }

  const csvLine = `"${ip}","${os}","${location}"\n`;
  fs.appendFileSync(CSV_PATH, csvLine);

  res.json({ success: true, ip, os, location });
});

app.get('/log', (req, res) => {
  res.type('text/csv');
  res.send(fs.readFileSync(CSV_PATH, 'utf-8'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
