const dns = require('dns');
// Set to the working local DNS server found via nslookup
dns.setServers(['10.46.116.126']);

const path = require('path');
const backendDir = path.join(__dirname, 'backend');
const mongoose = require(path.join(backendDir, 'node_modules', 'mongoose'));
const dotenv = require(path.join(backendDir, 'node_modules', 'dotenv'));

// Config dotenv
dotenv.config({ path: path.join(backendDir, '.env') });

async function checkUser() {
  try {
    console.log('Connecting with local DNS 10.46.116.126...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas successfully using SRV with local DNS override');
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Connection Failed:', err.message);
  }
}

checkUser();
