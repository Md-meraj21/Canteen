const mongoose = require('mongoose');

let connectionPromise = null;

const numberFromEnv = (name, fallback) => {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
};

const mongoOptions = () => {
  const options = {
    maxPoolSize: numberFromEnv('MONGODB_MAX_POOL_SIZE', 10),
    minPoolSize: numberFromEnv('MONGODB_MIN_POOL_SIZE', 0),
    serverSelectionTimeoutMS: numberFromEnv('MONGODB_SERVER_SELECTION_TIMEOUT_MS', 10000),
    connectTimeoutMS: numberFromEnv('MONGODB_CONNECT_TIMEOUT_MS', 10000),
    socketTimeoutMS: numberFromEnv('MONGODB_SOCKET_TIMEOUT_MS', 45000),
  };

  if (process.env.MONGODB_DB_NAME) {
    options.dbName = process.env.MONGODB_DB_NAME;
  }

  return options;
};

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured');
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = mongoose.connect(process.env.MONGODB_URI, mongoOptions())
    .then((conn) => {
      connectionPromise = null;
      return conn.connection;
    })
    .catch((error) => {
      connectionPromise = null;
      throw error;
    });

  try {
    return await connectionPromise;
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
