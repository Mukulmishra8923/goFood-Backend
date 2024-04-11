import mongoose from "mongoose";

const connectDb = async (DATABASE_URL) => {
  try {
    await mongoose.connect(DATABASE_URL, {
      dbName: "goFood",
    });
    // console.log("Database Connected successfully...");

    //   --------------------CALL static data-------------------

    const fetchData = await mongoose.connection.db
      .collection("food_items")
      .find({})
      .toArray();
    const foodCategory = await mongoose.connection.db
      .collection("foodCategory")
      .find({})
      .toArray();

    global.food_items = fetchData;
    global.foodCategory = foodCategory;
  } catch (error) {
    // console.log("database connection error is ", error);
    return error;
  }
};

export default connectDb;
