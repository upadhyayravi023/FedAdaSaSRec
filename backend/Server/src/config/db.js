import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

const connectDB = async () => {
  try {
    let mongoURI = process.env.MONGO_URI;

    if (!mongoURI || mongoURI.includes('<your-actual-cluster-url>') || mongoURI.includes('cluster0.exqmpl')) {
      console.log('Using in-memory database server.');
      mongoServer = await MongoMemoryServer.create();
      mongoURI = mongoServer.getUri();
      process.env.MONGO_URI = mongoURI;
    }

    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    if (error.message.includes('ECONNREFUSED')) {
      console.log('Local MongoDB connection failed. Falling back to in-memory database server.');
      mongoServer = await MongoMemoryServer.create();
      const newUri = mongoServer.getUri();
      const conn = await mongoose.connect(newUri);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } else {
      console.error(`MongoDB Connection Error: ${error.message}`);
      process.exit(1);
    }
  }
};

export default connectDB;
