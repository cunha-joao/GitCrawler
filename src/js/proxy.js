const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;

// Middleware to handle requests and forward them to the target URL
app.use('/proxy', async (req, res) => {
  try {
    const targetUrl = req.query.url; // Get the target URL from the query parameter
    if (!targetUrl) {
      return res.status(400).send('Target URL is required');
    }
    
    // Fetch content from the target URL
    const response = await axios.get(targetUrl);
    
    // Send the response back to the client
    res.send(response.data);
  } catch (error) {
    res.status(500).send('Error fetching the target URL');
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
