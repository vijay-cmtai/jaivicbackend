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

connectDB();

const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: "http://localhost:8080",
  credentials: true,
};
app.use(cors(corsOptions));

const io = new Server(server, {
  cors: corsOptions,
});

app.set("socketio", io);

app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.get("/", (req, res) => {
  res.json({ message: "API server is running..." });
});
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/payment", paymentRoutes);

io.on("connection", (socket) => {
  console.log("A new user connected via WebSocket:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  );
});
