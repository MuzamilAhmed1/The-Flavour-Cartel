require("dotenv").config();
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const axios = require("axios");
const db = require("./services/db"); // Your DB helper
const path = require("path");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// View engine setup
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Serve static files
app.use(express.static("public"));

// Session configuration
app.use(session({
  secret: "super-secret-key", // Replace with env var in prod
  resave: false,
  saveUninitialized: true,
}));

// ================== ROUTES ==================

// Homepage
app.get("/", async (req, res) => {
  try {
    const recipes = await db.query("SELECT * FROM recipes LIMIT 4");
    res.render("home", { recipes });
  } catch (err) {
    console.error("Error loading home:", err);
    res.status(500).send("Server error");
  }
});

// Recipes by category
app.get("/recipes", async (req, res) => {
  try {
    const categories = await db.query("SELECT * FROM categories");

    let query = `
      SELECT recipes.*, categories.name AS category_name 
      FROM recipes 
      JOIN categories ON recipes.category_id = categories.id
    `;
    const category = req.query.category;
    let params = [];
    let selectedCategory = "All Recipes";
    if (category) {
      query += " WHERE categories.name = ?";
      params.push(category);
      selectedCategory = category;
    }
    const recipes = await db.query(query, params);
    res.render("categories", { recipes, categories, selectedCategory });
  } catch (error) {
    console.error("Error loading recipes:", error);
    res.status(500).send("Error loading recipes");
  }
});

// GET /generate - Render the Generate Recipe page
app.get("/generate", (req, res) => {
  res.render("generate");
});

// POST /generate - Use ChatGPT API to generate a recipe
app.post("/generate", async (req, res) => {
  const prompt = req.body.ingredients;
  try {
    const payload = {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a creative chef that generates delicious and innovative recipes." },
        { role: "user", content: `Generate a recipe using these ingredients: ${prompt}` }
      ],
      max_tokens: 200,
      temperature: 0.7,
    };

    const response = await axios.post("https://api.openai.com/v1/chat/completions", payload, {
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    const generatedRecipe = response.data.choices[0].message.content.trim();
    res.render("generate", { generatedRecipe, prompt });
  } catch (error) {
    console.error("Error generating recipe:", error.response ? error.response.data : error.message);
    res.status(500).send("Error generating recipe");
  }
});

// User Profile Page
app.get("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await db.query("SELECT * FROM users WHERE id = ?", [userId]);
    if (user.length === 0) {
      return res.status(404).send("User not found");
    }
    const recipes = await db.query("SELECT * FROM recipes WHERE user_id = ?", [userId]);
    res.render("profile", { user: user[0], recipes });
  } catch (error) {
    console.error("Error loading profile:", error);
    res.status(500).send("Error loading profile");
  }
});

// Recipe Detail Page
app.get("/recipe/:id", async (req, res) => {
  try {
    const recipeId = req.params.id;
    const queryText = `
      SELECT recipes.*, 
             categories.name AS category_name,
             users.id AS user_id,
             users.name AS user_name,
             users.profile_picture AS user_image
      FROM recipes 
      JOIN categories ON recipes.category_id = categories.id 
      JOIN users ON recipes.user_id = users.id
      WHERE recipes.id = ?
    `;
    const result = await db.query(queryText, [recipeId]);
    if (result.length === 0) {
      return res.status(404).send("Recipe not found");
    }
    const recipe = result[0];
    recipe.ingredients = recipe.ingredients ? recipe.ingredients.split("\n") : [];
    recipe.instructions = recipe.instructions ? recipe.instructions.split("\n") : [];
    res.render("detail", { recipe });
  } catch (error) {
    console.error("Error loading recipe details:", error);
    res.status(500).send("Error loading recipe details");
  }
});

// Users Listing Page
app.get("/users", async (req, res) => {
  try {
    const users = await db.query("SELECT id, name, email, profile_picture, created_at FROM users");
    if (!users || users.length === 0) {
      return res.status(404).send("No users found.");
    }
    res.render("users", { users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Error loading users list.");
  }
});

// Login Page
app.get("/login", (req, res) => {
  res.render("login");
});

// Signup Page
app.get("/signup", (req, res) => {
  res.render("signup");
});

// Handle Signup
app.post("/signup", async (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  if (!first_name || !last_name || !email || !password) {
    return res.status(400).send("All fields are required.");
  }
  try {
    const existing = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).send("Email already registered.");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const fullName = `${first_name} ${last_name}`;
    await db.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [fullName, email, hashedPassword]);
    res.redirect("/login");
  } catch (err) {
    console.error("Error registering:", err);
    res.status(500).send("Registration failed.");
  }
});

// Handle Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (result.length === 0) {
      return res.status(401).send("Invalid email or password.");
    }
    const user = result[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send("Invalid email or password.");
    }
    req.session.user = { id: user.id, name: user.name, email: user.email };
    res.redirect(`/users/${user.id}`);
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).send("Login failed.");
  }
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

// Submit Recipe Page
app.get("/submit-recipe", async (req, res) => {
  try {
    const categories = await db.query("SELECT * FROM categories");
    res.render("submit", { categories });
  } catch (err) {
    console.error("Error loading form:", err);
    res.status(500).send("Error.");
  }
});

// Handle Recipe Submission
app.post("/submit-recipe", async (req, res) => {
  console.log("POST /submit-recipe - req.body:", req.body);
  if (!req.body) {
    return res.status(400).send("No data submitted.");
  }
  try {
    const { title, description, image, category, ingredients, instructions, user_id } = req.body;
    const finalUserId = user_id ? user_id : 1;
    let catResult = await db.query("SELECT id FROM categories WHERE name = ?", [category]);
    let category_id;
    if (catResult.length > 0) {
      category_id = catResult[0].id;
    } else {
      const insertResult = await db.query("INSERT INTO categories (name) VALUES (?)", [category]);
      category_id = insertResult.insertId;
    }
    await db.query(
      `INSERT INTO recipes 
         (title, description, image, category_id, user_id, ingredients, instructions) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, description, image, category_id, finalUserId, ingredients, instructions]
    );
    console.log("Recipe submitted successfully.");
    res.redirect("/recipes");
  } catch (error) {
    console.error("Error submitting recipe:", error.message);
    res.status(500).send("Error submitting recipe: " + error.message);
  }
});

// Handle Comment Submission
app.post("/recipe/:id/comments", express.urlencoded({ extended: true }), async (req, res) => {
  try {
    const recipeId = req.params.id;
    const { comment } = req.body;
    const userId = 1; // Replace with logged-in user ID later
    if (!comment) {
      return res.status(400).send("Comment cannot be empty.");
    }
    await db.query("INSERT INTO comments (user_id, recipe_id, comment) VALUES (?, ?, ?)", [userId, recipeId, comment]);
    res.redirect(`/recipe/${recipeId}`);
  } catch (error) {
    console.error("Error posting comment:", error);
    res.status(500).send("Error posting comment");
  }
});

// Code of Conduct Page
app.get("/conduct", (req, res) => {
  res.render("conduct");
});

// Export the app (all routes have been registered above)
module.exports = app;
