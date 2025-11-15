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

  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});
