const mongoose = require('mongoose');
const User = require('./src/models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function runTest() {
  await mongoose.connect(process.env.MONGODB_URI);
  const user = await User.findOne({ role: 'employer' });
  if (!user) { console.log('No employer found'); process.exit(1); }

  const token = jwt.sign({ id: user._id, role: user.role, isVerified: user.isVerified, verificationStatus: user.verificationStatus }, process.env.JWT_SECRET, { expiresIn: '30d' });

  const dummyFile = path.join(__dirname, 'dummy.jpg');
  fs.writeFileSync(dummyFile, 'dummy content');

  // We can't use native FormData easily with file streams in older Node, so let's just make a manual multipart request.
  const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
  const body = Buffer.concat([
    Buffer.from('--' + boundary + '\r\n'),
    Buffer.from('Content-Disposition: form-data; name="profilePicture"; filename="dummy.jpg"\r\n'),
    Buffer.from('Content-Type: image/jpeg\r\n\r\n'),
    fs.readFileSync(dummyFile),
    Buffer.from('\r\n--' + boundary + '--\r\n')
  ]);

  try {
    const res = await fetch('http://localhost:5005/api/v1/auth/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: body
    });
    
    const text = await res.text();
    console.log('STATUS:', res.status, 'BODY:', text);
  } catch (err) {
    console.error('ERROR:', err);
  }

  if (fs.existsSync(dummyFile)) fs.unlinkSync(dummyFile);
  mongoose.disconnect();
}

runTest();
