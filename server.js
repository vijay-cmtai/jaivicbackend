require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const colors = require("colors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");
const authRoutes = require("./routes/authRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);

// --- START: CORS Configuration Update ---
// We use an array to allow multiple origins (your local machine and your deployed Vercel app)
const allowedOrigins = [
  "http://localhost:8080", // Your local frontend
  "https://jaivicbharat.vercel.app", // Your production frontend
];

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg =
        "The CORS policy for this site does not allow access from the specified Origin.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
};

app.use(cors(corsOptions));
// --- END: CORS Configuration Update ---

const io = new Server(server, {
  cors: corsOptions, // Use the same updated CORS options for Socket.IO
});

app.set("socketio", io);

// Body parser middleware
app.use(express.json());

// Morgan logging middleware for development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Simple API root route
app.get("/", (req, res) => {
  res.json({ message: "API server is running..." });
});

// API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/payment", paymentRoutes);

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log("A new user connected via WebSocket:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Custom Error Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  );
});
