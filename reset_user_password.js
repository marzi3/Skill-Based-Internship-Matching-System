const dns = require('dns');
dns.setServers(['8.8.8.8']);

const path = require('path');
const backendDir = path.join(__dirname, 'backend');
const mongoose = require(path.join(backendDir, 'node_modules', 'mongoose'));
const dotenv = require(path.join(backendDir, 'node_modules', 'dotenv'));
const bcrypt = require(path.join(backendDir, 'node_modules', 'bcryptjs'));

dotenv.config({ path: path.join(backendDir, '.env') });

const User = require(path.join(backendDir, 'src', 'models', 'User'));

async function resetPassword() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    const email = 'maryamnagan01@gmail.com';
    const newPassword = 'password123';
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    const user = await User.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );

    if (user) {
      console.log(`✅ Password reset successfully for ${email}. New password is: ${newPassword}`);
    } else {
      console.log(`❌ User ${email} not found.`);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

resetPassword();
