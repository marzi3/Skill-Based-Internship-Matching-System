const axios = require('axios');

async function testApi() {
    try {
        console.log('Testing /api/internships/skill-demands...');
        // We can't easily test protected routes without a token, 
        // but we can check if the server is up and reachable.
        const res = await axios.get('http://localhost:5000/health');
        console.log('Health Check State:', res.status, res.data);
    } catch (err) {
        console.error('Error during health check:', err.message);
        if (err.response) {
            console.error('Response data:', err.response.data);
        }
    }
}

testApi();
