import mongoose from 'mongoose';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let connected = false;

export const connectDB = async (retries = 6, delayMs = 2500): Promise<void> => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is required');
  }

  mongoose.set('strictQuery', true);

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await mongoose.connect(uri, {
        maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE || 20),
        minPoolSize: Number(process.env.MONGO_MIN_POOL_SIZE || 5),
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        retryWrites: true,
        autoIndex: false
      });
      connected = true;
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown connection error';
      console.error(`[db_config] Attempt ${attempt}/${retries} failed: ${message}`);

      if (attempt === retries) {
        throw new Error(`MongoDB connection failed after ${retries} attempts`);
      }

      await sleep(delayMs * attempt);
    }
  }
};

mongoose.connection.on('connected', () => {
  connected = true;
  console.log('[db_config] MongoDB connected');
});

mongoose.connection.on('error', (error) => {
  connected = false;
  console.error('[db_config] MongoDB error:', error);
});

mongoose.connection.on('disconnected', () => {
  connected = false;
  console.warn('[db_config] MongoDB disconnected');
});

export const closeDB = async (): Promise<void> => {
  if (connected) {
    await mongoose.connection.close();
    connected = false;
  }
};
