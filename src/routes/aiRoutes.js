const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const {createTaskWithAi} = require("../controllers/aiController");

router.post("/create",auth,createTaskWithAi);

module.exports = router;
