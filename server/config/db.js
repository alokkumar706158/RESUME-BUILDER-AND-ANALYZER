import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/resumeroast';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`Local MongoDB connection failed (${error.message}). Starting in-memory database fallback...`);
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`MongoDB In-Memory Connected: ${conn.connection.host}`);
    } catch (memError) {
      console.error(`Error connecting to MongoDB: ${error.message}`);
      process.exit(1);
    }
  }
};

export default connectDB;
