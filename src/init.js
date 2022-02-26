import "./db";
import "./models/Video";
import "./models/User";
import app from "./server";

const PORT = 5000;

const handleListening = () => console.log(`Server Listening on port http://localholst:${PORT}`);

app.listen(PORT, handleListening);

