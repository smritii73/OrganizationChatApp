import mongoose from "mongoose";

const connectToMongoDB = async () => {
  await mongoose.connect(process.env.MONGO_URI_URI);
  console.log("Mongo readyState:", mongoose.connection.readyState);
};

export default connectToMongoDB;