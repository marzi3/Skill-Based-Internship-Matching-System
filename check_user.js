const mongoose = require('./backend/node_modules/mongoose');
const User = require('./backend/src/models/User');
const Student = require('./backend/src/models/Student');
const Application = require('./backend/src/models/Application');
const Internship = require('./backend/src/models/Internship');
const dotenv = require('./backend/node_modules/dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'backend/.env') });

async function checkApplication() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const allApps = await Application.find()
            .populate('student', 'email name')
            .populate('internship', 'positionTitle')
            .lean();

        const gowshikaId = '69c249bf93b95b8cdc9fe3f3';
        const internshipsWithGowshika = await Internship.find({ applicants: gowshikaId }).lean();
        console.log(`\nInternships with Gowshika in applicants array: ${internshipsWithGowshika.length}`);
        internshipsWithGowshika.forEach(i => console.log(`- Internship: ${i.positionTitle} (${i._id})`));

        const allInternships = await Internship.find({ 'applicants.0': { $exists: true } }).lean();
        console.log(`\nInternships with at least one applicant: ${allInternships.length}`);
        allInternships.forEach(i => console.log(`- ${i.positionTitle}: ${i.applicants.length} applicants`));

        const jaffnaUser = await User.findOne({ email: /JaffnaStudent1/i });
        console.log(`\nJaffna User: ${jaffnaUser?.email} ID: ${jaffnaUser?._id}`);



    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkApplication();
