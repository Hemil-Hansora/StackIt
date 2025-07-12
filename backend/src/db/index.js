import mongoose from 'mongoose';


const connectDB = async () => {
    try {
        console.log(process.env.MONGODB_URL)
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${process.env.DB_NAME}`)

        console.log(`\n <---- MongoDB connected: ${connectionInstance.connection.host} ---->\n`);
    } catch (error) {
        console.error(`MongoDB connection Error: ${error.message}`);
        process.exit(1);
    }
}

export default connectDB;