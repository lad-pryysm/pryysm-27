const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files from 'public' folder (if you have one)
app.use(express.static(path.join(__dirname, 'public')));

// Basic route
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>React App</title>
      </head>
      <body>
        <div id="root">
          <h1>React App is Running on Azure!</h1>
          <p>Your app is deployed successfully.</p>
        </div>
      </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
