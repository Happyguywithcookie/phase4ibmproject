const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const API_KEY = "YOUR_IBM_CLOUD_API_KEY"; // Replace with your API key

async function getAuthToken() {
  try {
    const response = await axios.post('https://iam.cloud.ibm.com/identity/token', null, {
      params: { apiKey: API_KEY, grant_type: 'urn:ibm:params:oauth:grant-type:apikey' }
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    throw new Error('Failed to retrieve token');
  }
}

app.post('/predict', async (req, res) => {
  try {
    const token = await getAuthToken();
    const response = await axios.post(
      'https://eu-de.ml.cloud.ibm.com/ml/v4/deployments/text-analysis/predictions?version=2021-05-01',
      req.body,
      { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );
    res.json({ predictions: response.data.predictions });
  } catch (error) {
    res.status(500).json({ error: 'Error processing prediction' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});