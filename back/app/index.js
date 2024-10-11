const express = require('express');
const app = express();
const port = process.env.BACK_PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello from Men dehqon!');
});

app.listen(port, () => {
  console.log(`PORT: ${port}`);
});