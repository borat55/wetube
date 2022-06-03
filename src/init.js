import "regenerator-runtime";
import "dotenv/config";
import "./db";
import "./models/Video";
import "./models/User";
import "./models/Comment";
import app from "./server";

const PORT = 5000;

const handleListening = () => console.log(`Server Listening on port http://localholst:${PORT}`);

app.listen(PORT, handleListening);

