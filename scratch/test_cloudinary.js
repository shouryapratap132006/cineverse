const { v2: cloudinary } = require("cloudinary");
const dotenv = require("dotenv");
const path = require("path");

// Load the .env file explicitly
dotenv.config({ path: path.join(__dirname, "../.env") });

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

console.log("--- Cloudinary Diagnostics ---");
console.log("Cloud Name:", cloudName);
console.log("API Key:", apiKey);
console.log("API Secret Length:", apiSecret ? apiSecret.length : 0);

if (apiSecret) {
  const hasAsterisks = apiSecret.includes("*");
  console.log("Secret contains asterisks (*):", hasAsterisks);
  console.log("Secret value starts with:", apiSecret.substring(0, 3) + "...");
} else {
  console.log("Secret is not loaded!");
}

// Test credentials validation by signing a request
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret
});

console.log("\nAttempting to check configuration...");
try {
  // Let's run a test ping to Cloudinary API
  cloudinary.api.ping()
    .then(result => {
      console.log("Ping Success:", result);
    })
    .catch(err => {
      console.error("Ping Failed:", err.message);
    });
} catch (e) {
  console.error("Exception:", e.message);
}
