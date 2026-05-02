console.log("App started...");
const PORT = process.env.PORT || 3000;

const express = require("express");
require("dotenv").config({ path: "./.env"});
const cors = require("cors");

const pool = require("./config/db");

const app = express();
app.use(express.json());

app.use(cors({origin: "*"}));

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth",authRoutes);

const taskRoutes = require("./routes/taskRoutes");
app.use("/api/tasks/",taskRoutes);

const aiRoutes = require("./routes/aiRoutes");
app.use("/api/ai",aiRoutes);

app.get("/", (req, res) => {
  res.send("LifeOS API Running HEY ");
});

app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/users", async (req, res) => {
  try {
    const result = await pool.query({
      text: "SELECT * FROM users"});
    console.log("Query success");
    res.json(result.rows);
  } catch (err) {
    console.error("DB ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});


app.use((req,res,next) =>{
  next(new AppError(`Route ${req.originalUrl} not found`,404))
});

const errorHandler = require("./middleware/errorMiddleware");
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});