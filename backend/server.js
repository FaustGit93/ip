const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

app.post('/log', async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];

  const locationRes = await fetch(`http://ip-api.com/json/${ip}`);
  const location = await locationRes.json();

  const logEntry = {
    timestamp: new Date().toISOString(),
    ip,
    userAgent,
    city: location.city || '',
    country: location.country || '',
    event: req.body.event || 'unknown'
  };

  const logLine = `${logEntry.timestamp},"${logEntry.ip}","${logEntry.userAgent}","${logEntry.city}","${logEntry.country}",${logEntry.event}\n`;
  fs.appendFileSync('log.csv', logLine);

  res.status(200).json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
