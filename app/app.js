const express = require("express");
const db = require("./services/db"); // Database connection
const path = require("path");

const app = express();

// Set view engine to PUG
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Serve static files (CSS, images)
app.use(express.static("public"));

// Homepage Route
app.get("/", async (req, res) => {
  try {
    // Fetch 4 recipes from the database
    const recipes = await db.query("SELECT * FROM recipes LIMIT 4");
    res.render("home", { recipes });
  } catch (error) {
    console.error("Error loading homepage:", error);
    res.status(500).send("Error loading homepage");
  }
});

module.exports = app; // Export the Express app
