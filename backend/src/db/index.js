import mongoose from 'mongoose';


const connectDB = async () => {
    try {
        MONGODB_URL = process.env.MONGODB_URL
        DB_NAME = process.env.DB_NAME
        const connectionInstance = await mongoose.connect(`${MONGODB_URL}/${DB_NAME}`)

        console.log(`\n <---- MongoDB connected: ${connectionInstance.connection.host} ---->\n`);
    } catch (error) {
        console.error(`MongoDB connection Error: ${error.message}`);
        process.exit(1);
    }
}

export default connectDB;