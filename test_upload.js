const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const mongoose = require('mongoose');
const User = require('./backend/src/models/User');
require('dotenv').config({path: './backend/.env'});

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  const user = await User.findOne({email: 'maryamnagan01@gmail.com'});
  const token = require('jsonwebtoken').sign({id: user._id, role: user.role}, process.env.JWT_SECRET, {expiresIn:'1h'});

  // creating a valid 1KB valid pdf
  const pdfString = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n';
  fs.writeFileSync('/tmp/test.pdf', pdfString);

  const form = new FormData();
  form.append('resume', fs.createReadStream('/tmp/test.pdf'));
  
  try {
    const res = await axios.post('http://localhost:5005/api/v1/students/profile/resume', form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('SUCCESS:', res.data);
  } catch (err) {
    console.log('ERROR:', err.response?.data || err.message);
  }
  process.exit();
}
test();
