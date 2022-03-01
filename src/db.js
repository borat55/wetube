import mongoose from "mongoose";

console.log(process.env.COOKIE_SECRET, process.env.DB_URL)

mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true});

const handleOpen = () => console.log(
    "connected to the db"
)
const handleError =(error) =>console.log("DB Error", error)
const db = mongoose.connection;
db.on("error", handleError)
db.once("open", handleOpen)