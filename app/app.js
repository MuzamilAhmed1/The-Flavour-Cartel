// Import express.js
const express = require("express");

// Create express app
var app = express();

// Add static files location
app.use(express.static("static"));

// Get the functions in the db.js file to use
const db = require('./services/db');

// Create a route for root - /
app.get("/", async function(req, res) {
    try {
      // Query the database for all rows in the "recipes" table
      const results = await db.query("SELECT * FROM recipes");
      
      // Start building the HTML output
      let html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Recipes Database</title>
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; }
            th { background-color: #f2f2f2; text-align: left; }
          </style>
        </head>
        <body>
          <h1>Recipes List</h1>
      `;
      
      if (results.length === 0) {
        html += `<p>No recipes found.</p>`;
      } else {
        // Use the keys from the first record as table headersss
        const headers = Object.keys(results[0]);
        html += `<table>
                  <thead>
                    <tr>`;
        headers.forEach(header => {
          html += `<th>${header}</th>`;
        });
        html += `   </tr>
                  </thead>
                  <tbody>`;
        results.forEach(row => {
          html += `<tr>`;
          headers.forEach(header => {
            html += `<td>${row[header]}</td>`;
          });
          html += `</tr>`;
        });
        html += `</tbody>
                </table>`;
      }
      
      html += `
        </body>
        </html>
      `;
      
      // Send the constructed HTML as the response
      res.send(html);
    } catch (error) {
      console.error("Error querying database:", error);
      res.status(500).send("Internal Server Error: " + error.message);
    }
  });
  


// Start server on port 3000
app.listen(3000,function(){
    console.log(`Server running at http://127.0.0.1:3000/`);
});