// const express = require("express");
// const dotenv = require("dotenv");
// const cors = require("cors");
// const connectDB = require("./config/db");

// dotenv.config();
// connectDB();

// const app = express();

// app.use(cors());
// app.use(express.json());

// /* ROUTES */
// const authRoutes = require("./routes/auth.routes");
// const userRoutes = require("./routes/user.routes");
// const notificationRoutes = require("./routes/notification.routes");
// const chatRoutes = require("./routes/chat.routes");
// const messageRoutes = require("./routes/message.routes");

// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/notifications", notificationRoutes);
// app.use("/api/chat", chatRoutes);
// app.use("/api/message", messageRoutes);


// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });