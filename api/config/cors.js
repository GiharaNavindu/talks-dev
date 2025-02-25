import cors from "cors";

const corsOptions = {
  credentials: true,
  origin: function (origin, callback) {
    const allowedOrigins = [process.env.CLIENT_URL, "http://localhost:5173"];
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

export default cors(corsOptions); 