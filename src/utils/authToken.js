const crypto = require("crypto");
const path = require("path");
const fs = require("fs").promises;

const generateToken = () => crypto.randomBytes(48).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/\=/g, "");

async function authToken () {
  const tokenFilePath = path.join(__filename, "../../../token.json");

  try {
    const storedTokenData = await fs.readFile(tokenFilePath, { encoding: "utf-8" });

    const parsed = JSON.parse(storedTokenData);
    return parsed.token;
  }
  catch (error) {
    // Check if the file don't exist.
    if (error.code === "ENOENT") {
      const token = generateToken();
      const creationDate = new Date().toISOString()

      await fs.writeFile(tokenFilePath, JSON.stringify({
        token,
        creationDate
      }), { encoding: "utf-8" });

      return token;
    }

    throw error;
  }
}

module.exports = authToken;
