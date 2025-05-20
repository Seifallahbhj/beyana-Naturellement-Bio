import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI as string);
    console.log(`MongoDB connecté: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`Erreur: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
