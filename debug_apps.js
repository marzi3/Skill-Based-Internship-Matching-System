const mongoose = require('mongoose');
const User = require('./backend/src/models/User');
const Application = require('./backend/src/models/Application');
require('dotenv').config({ path: './backend/.env' });

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected');

    const apps = await Application.find().lean();
    console.log(`Total Applications: ${apps.length}`);
    for (const app of apps) {
        const studentUser = await User.findById(app.student);
        console.log(`App ${app._id}: Student=${studentUser?.email || app.student}, Status=${app.status}`);
    }

    const gowshika = await User.findOne({ email: /gowshika/i });
    console.log(`\nGowshika User: ${gowshika?.email} ID: ${gowshika?._id}`);
    
    process.exit(0);
}

run();
