const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const db = require("./services/db"); // Your DB helper
const path = require("path");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// View engine setup
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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

    res.render("categories", { 
      recipes, 
      categories, 
      selectedCategory 
    });
  } catch (error) {
    console.error("Error loading recipes:", error);
    res.status(500).send("Error loading recipes");
  }
});

module.exports = app; // Export the Express app

// User Profile Page
app.get("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    // Fetch user info from the database
    const user = await db.query("SELECT * FROM users WHERE id = ?", [userId]);

    if (user.length === 0) {
      return res.status(404).send("User not found");
    }

    // Fetch recipes posted by this user
    const recipes = await db.query("SELECT * FROM recipes WHERE user_id = ?", [userId]);

    res.render("profile", { user: user[0], recipes });
  } catch (error) {
    console.error("Error loading profile:", error);
    res.status(500).send("Error loading profile");
  }
});


// Detail Page
app.get("/recipe/:id", async (req, res) => {
  try {
    const recipeId = req.params.id;
    const queryText = `
      SELECT 
        recipes.*, 
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

    // Split ingredients and instructions into arrays if they exist.
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

      // Check if there are users
      if (!users || users.length === 0) {
          return res.status(404).send("No users found.");
      }

      res.render("users", { users });
  } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).send("Error loading users list.");
  }
});

// Login Page Route - Show Login Form
app.get("/login", (req, res) => {
  res.render("login"); // This will render login.pug
});

// Show Signup Page
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

    await db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [fullName, email, hashedPassword]
    );

    res.redirect("/login");
  } catch (err) {
    console.error("Error registering:", err);
    res.status(500).send("Registration failed.");
  }
});

// Show Login Page
app.get("/login", (req, res) => {
  res.render("login");
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

    // Store session info
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    res.redirect(`/users/${user.id}`);
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).send("Login failed.");
  }
});

// Logout route
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

// Show user profile
app.get("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await db.query("SELECT * FROM users WHERE id = ?", [userId]);

    if (user.length === 0) {
      return res.status(404).send("User not found.");
    }

    const recipes = await db.query("SELECT * FROM recipes WHERE user_id = ?", [userId]);
    res.render("profile", { user: user[0], recipes });
  } catch (err) {
    console.error("Error loading profile:", err);
    res.status(500).send("Profile error.");
  }
});

// Submit Recipe Page (optional: protect with session)
app.get("/submit-recipe", async (req, res) => {
  try {
    const categories = await db.query("SELECT * FROM categories");
    res.render("submit", { categories });
  } catch (err) {
    console.error("Error loading form:", err);
    res.status(500).send("Error.");
  }
});

// Search
app.get("/search", async (req, res) => {
  const searchQuery = req.query.query;

  try {
    if (!searchQuery) return res.redirect("/");

    const recipes = await db.query(
      "SELECT * FROM recipes WHERE title LIKE ? OR description LIKE ?",
      [`%${searchQuery}%`, `%${searchQuery}%`]
    );

    res.render("search", { searchQuery, recipes });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).send("Search failed.");
  }
});

// Recipe Detail
app.get("/recipe/:id", async (req, res) => {
  try {
    const recipeId = req.params.id;

    const query = `
      SELECT 
        recipes.*, 
        categories.name AS category_name,
        users.name AS user_name,
        users.profile_picture AS user_image
      FROM recipes
      JOIN categories ON recipes.category_id = categories.id
      JOIN users ON recipes.user_id = users.id
      WHERE recipes.id = ?
    `;

    const result = await db.query(query, [recipeId]);

    if (result.length === 0) {
      return res.status(404).send("Recipe not found.");
    }

    const recipe = result[0];
    recipe.ingredients = recipe.ingredients ? recipe.ingredients.split("\n") : [];
    recipe.instructions = recipe.instructions ? recipe.instructions.split("\n") : [];

    res.render("detail", { recipe });
  } catch (err) {
    console.error("Error loading recipe:", err);
    res.status(500).send("Recipe error.");
  }
});

app.post("/submit-recipe", async (req, res) => {
  // Log the incoming request body for debugging
  console.log("POST /submit-recipe - req.body:", req.body);
  
  // Ensure there is a body
  if (!req.body) {
    return res.status(400).send("No data submitted.");
  }

  try {
    // Destructure fields from the request body; if user_id is not provided, default to 1
    const {
      title,
      description,
      image,
      category,      // now a free-text input
      ingredients,   // newline-separated string from JS
      instructions,  // newline-separated string from JS
      user_id        // might not be provided
    } = req.body;
    const finalUserId = user_id ? user_id : 1;

    // Check if the category already exists
    let catResult = await db.query("SELECT id FROM categories WHERE name = ?", [category]);
    let category_id;
    if (catResult.length > 0) {
      // Use the existing category id
      category_id = catResult[0].id;
    } else {
      // Insert the new category and retrieve its new id
      const insertResult = await db.query("INSERT INTO categories (name) VALUES (?)", [category]);
      category_id = insertResult.insertId; // Assumes your db.query returns an insertId
    }

    // Insert the new recipe into the recipes table
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


// Code of Conduct Page
app.get("/conduct", (req, res) => {
  res.render("conduct"); // Renders the conduct.pug template
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

    await db.query(
      "INSERT INTO comments (user_id, recipe_id, comment) VALUES (?, ?, ?)",
      [userId, recipeId, comment]
    );

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

// Show the Generate Recipe page
app.get("/generate", (req, res) => {
  res.render("generate");
});

module.exports = app;