require('dotenv').config();
const connectDB = require('./db/connection');

const main = async () => {
  await connectDB();
  console.log('Connected to MongoDB. Ready to go!');
  process.exit(0);
};

main();
