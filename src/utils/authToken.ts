import fs from "fs/promises";
import crypto from "crypto";
import path from "path";

/** Helpers */
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const generateToken = () => crypto
  .randomBytes(48)
  .toString("base64")
  .replace(/\+/g, "-")
  .replace(/\//g, "_")
  .replace(/\=/g, "");

export default async function authToken () {
  const tokenFilePath = path.join(__dirname, "../../token.json");

  try {
    const storedTokenData = await fs.readFile(
      tokenFilePath,
      { encoding: "utf-8" }
    );

    const parsed = JSON.parse(storedTokenData);
    return parsed.token;
  }
  catch (error) {
    const token = generateToken();
    const creationDate = new Date().toISOString();

    await fs.writeFile(tokenFilePath, JSON.stringify({
      token,
      creationDate
    }), { encoding: "utf-8" });

    return token;
  }
}