"use strict";

console.log("Entrypoint started");

// Import the app.js file
const app = require("./app/app");

// Define the port
const PORT = process.env.PORT || 3000;

// Start the Express server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
