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
    // Fetch 4 featured recipes from the database
    const recipes = await db.query("SELECT * FROM recipes LIMIT 4");
    res.render("home", { recipes });
  } catch (error) {
    console.error("Error loading homepage:", error);
    res.status(500).send("Error loading homepage");
  }
});

// Recipes Route with Category Filtering
app.get("/recipes", async (req, res) => {
  try {
    // Fetch all categories for dynamic category tabs
    const categories = await db.query("SELECT * FROM categories");

    let query = `
      SELECT recipes.*, categories.name AS category_name 
      FROM recipes 
      JOIN categories ON recipes.category_id = categories.id
    `;

    const category = req.query.category;
    let params = [];
    let selectedCategory = "All Recipes"; // Default category title

    // Apply category filter if a valid category is provided
    if (category) {
      query += " WHERE categories.name = ?";
      params.push(category);
      selectedCategory = category; // Set category name dynamically
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


// Detail Page with Comments
app.get("/recipe/:id", async (req, res) => {
  try {
    const recipeId = req.params.id;

    // Fetch the recipe with category and user info
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

    // Split ingredients and instructions into arrays
    recipe.ingredients = recipe.ingredients ? recipe.ingredients.split("\n") : [];
    recipe.instructions = recipe.instructions ? recipe.instructions.split("\n") : [];

    // 🔽 New: Fetch comments for this recipe
    const commentsQuery = ` 
      SELECT comments.*, users.name 
      FROM comments 
      JOIN users ON comments.user_id = users.id 
      WHERE recipe_id = ? 
      ORDER BY comments.created_at DESC
    `;
    const comments = await db.query(commentsQuery, [recipeId]);

    res.render("detail", { recipe, comments }); // 🔄 Pass comments to the view
    
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

// Handle User Registration (NO PASSWORD HASHING)
app.post("/signup", async (req, res) => {
  try {
    console.log("Received Sign Up Request:", req.body);

    const { first_name, last_name, email, password } = req.body;

    if (!first_name || !last_name || !email || !password) {
      console.log("Missing fields");
      return res.status(400).send("All fields are required.");
    }

    const existingUser = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      console.log("Email already registered");
      return res.status(400).send("Email already registered.");
    }

    // Store password as plain text (TEMPORARY)
    await db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [`${first_name} ${last_name}`, email, password]
    );

    console.log("User registered successfully");

    res.redirect("/login");
  } catch (error) {
    console.error("Error signing up:", error);
    res.status(500).send("Error signing up");
  }
});

// Submit Recipe Page - Show the form
app.get("/submit-recipe", async (req, res) => {
  try {
    const categories = await db.query("SELECT * FROM categories");
    res.render("submit", { categories });
  } catch (error) {
    console.error("Error loading submit form:", error);
    res.status(500).send("Error loading submit form");
  }
});


app.get("/search", async (req, res) => {
  try {
    const searchQuery = req.query.query; // Get search input from user

    if (!searchQuery) {
      return res.redirect("/"); // Redirect if search is empty
    }

    // Search for recipes that match the title or description
    const recipes = await db.query(
      "SELECT * FROM recipes WHERE title LIKE ? OR description LIKE ?",
      [`%${searchQuery}%`, `%${searchQuery}%`]
    );

    res.render("search", { searchQuery, recipes });
  } catch (error) {
    console.error("Error searching recipes:", error);
    res.status(500).send("Error performing search");
  }
});


// Submit Recipe Page - Show the form
app.get("/submit-recipe", async (req, res) => {
  try {
    const categories = await db.query("SELECT * FROM categories");
    res.render("submit", { categories });
  } catch (error) {
    console.error("Error loading submit form:", error);
    res.status(500).send("Error loading submit form");
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