const dns = require('dns');
// Set to the working local DNS server found via nslookup
dns.setServers(['8.8.8.8']); // Using public DNS as fallback

const path = require('path');
const backendDir = path.join(__dirname, 'backend');
const mongoose = require(path.join(backendDir, 'node_modules', 'mongoose'));
const dotenv = require(path.join(backendDir, 'node_modules', 'dotenv'));

// Config dotenv
dotenv.config({ path: path.join(backendDir, '.env') });

const User = require(path.join(backendDir, 'src', 'models', 'User'));

async function checkUserDetails() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected');

    const email = 'maryamnagan01@gmail.com';
    const user = await User.findOne({ email });

    if (user) {
      console.log('User found:', {
        id: user._id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        status: user.status,
        createdAt: user.createdAt
      });
    } else {
      console.log(`User ${email} NOT found in database.`);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

checkUserDetails();
