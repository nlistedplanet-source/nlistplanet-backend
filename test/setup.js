const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const fs = require('fs');
const path = require('path');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.MONGODB_URI = uri;
  process.env.JWT_SECRET = 'testsecret';

  // Make uploads dir
  const uploadDir = path.resolve(__dirname, '..', 'uploads', 'proofs');
  fs.mkdirSync(uploadDir, { recursive: true });
  const sampleFilePath = path.resolve(uploadDir, 'sample-proof.png');
  fs.writeFileSync(sampleFilePath, 'SAMPLE PROOF DATA');

  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const fs = require('fs');
const path = require('path');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.MONGODB_URI = uri;
  process.env.JWT_SECRET = 'testsecret';

  // Make uploads dir
  const uploadDir = path.resolve(__dirname, '..', 'uploads', 'proofs');
  fs.mkdirSync(uploadDir, { recursive: true });
  const sampleFilePath = path.resolve(uploadDir, 'sample-proof.png');
  fs.writeFileSync(sampleFilePath, 'SAMPLE PROOF DATA');

  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const fs = require('fs');
const path = require('path');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.MONGODB_URI = uri;
  process.env.JWT_SECRET = 'testsecret';

  // Make uploads dir
  const uploadDir = path.resolve(__dirname, '..', 'uploads', 'proofs');
  fs.mkdirSync(uploadDir, { recursive: true });
  const sampleFilePath = path.resolve(uploadDir, 'sample-proof.png');
  fs.writeFileSync(sampleFilePath, 'SAMPLE PROOF DATA');

  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const fs = require('fs');
const path = require('path');

let mongoServer;

module.exports = async () => {
  // Start in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.MONGODB_URI = uri;
  process.env.JWT_SECRET = 'testsecret';

  // Ensure uploads/proofs for tests exist
  const uploadDir = path.resolve(__dirname, '..', 'uploads', 'proofs');
  fs.mkdirSync(uploadDir, { recursive: true });

  // Connect mongoose
  await mongoose.connect(uri);

  // Create a small sample file for attachments used by tests
  const sampleFilePath = path.resolve(uploadDir, 'sample.txt');
  fs.writeFileSync(sampleFilePath, 'sample-proof-data');

  // Export shutdown function
  module.exports = {
    async teardown() {
      await mongoose.disconnect();
      await mongoServer.stop();
    }
  };
};
