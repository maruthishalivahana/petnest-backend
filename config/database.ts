const mongoose = require('mongoose');
// const dotenv = require('dotenv')
const connectDB = () => {
    mongoose.connect(process.env.MONGO_URI).then(() => {
        console.log("Database connected sucessfully")


    }).catch((err: any) => {
        console.error("connection failed :", err)
    })
}

module.exports = connectDB