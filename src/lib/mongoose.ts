import mongoose from 'mongoose';

// Temporarily disabled MongoDB connection to resolve PostgreSQL authentication issues
// const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mydb';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache;
}

if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  // Temporarily disabled - using PostgreSQL via Prisma instead
  console.warn('MongoDB connection disabled - using PostgreSQL via Prisma');
  return null;
  
  // Original MongoDB connection code (commented out)
  // if (global.mongoose.conn) return global.mongoose.conn;
  // if (!global.mongoose.promise) {
  //   global.mongoose.promise = mongoose.connect(MONGODB_URI);
  // }
  // global.mongoose.conn = await global.mongoose.promise;
  // return global.mongoose.conn;
}

export default dbConnect; 