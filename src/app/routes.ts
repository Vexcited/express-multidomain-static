import createHostnameFolder from "../utils/createHostnameFolder.js";
import express from "express";
import fs from "fs/promises";
import path from "path";

/** Router */
const router = express.Router();

/** Helper */
const __dirname = path.dirname(new URL(import.meta.url).pathname);

/**
 * Creates the routes for Express.
 * @param {string} mountPoint - Device's mount point path.
 * @param {string} token - Token generated stored in `token.json`. 
 */
export default function createRoutes (mountPoint: string, token: string) {
  // Create or check the hostname subfolder.
  router.use(async (req, res, next) => {
    try {
      await createHostnameFolder(mountPoint, req.hostname);
      next();
    }
    catch (error) {
      res.status(500).json({
        success: false,
        message: "An error occurred.",
        error
      });
    }
  });

  router.get("/raw/:fileName", (req, res) => {
    const {
      params: { fileName },
      hostname
    } = req;

    res.status(200).sendFile(fileName, {
      root: path.join(mountPoint, hostname)
    }, (error) => {
      if (error) {
        res.status(404).json({
          success: false,
          message: "File not found on the server."
        });
      }
    });
  });

  router.route("/data/:fileName")

  /**
   * GET /data/:fileName
   * This route returns the data of a given file.
   */
  .get(async (req, res) => {
    try {
      const {
        params: { fileName },
        hostname
      } = req;

      const folder = req.query.folder as string;
      console.log(folder);

      const filePath = path.join(mountPoint, hostname, fileName);
      const fileData = await fs.readFile(filePath, {
        encoding: "base64"
      });

      res.status(200).json({
        success: true,
        data: fileData
      });
    }
    catch (error) {
      res.status(404).json({
        success: false,
        message: "File not found on the server."
      });
    }
  })

  /**
   * POST /data/:fileName
   * This route can update or create a new file.
   */
  .post(async (req, res) => {
    try {
      const {
        params: { fileName },
        body: { content },
        hostname
      } = req;

      // Check the user token.
      const userToken = req.headers.authorization;
      if (!userToken) {
        return res.status(403).json({
          success: false,
          message: "Token not specied in `Authorization` header."
        });
      }
      else {
        const parsedToken = userToken.replace("Bearer", "").trim();
        if (token !== userToken) {
          return res.status(403).json({
            success: false,
            message: "Invalid token."
          });
        } 
      }

      const folder = req.query.folder as string;
      console.log(folder);

      if (!content) {
        return res.status(400).json({
          success: false,
          message: "Parameter `content` didn't passed."
        });
      }

      if (folder) {
        await fs.mkdir(
          path.join(__dirname, folder),
          { recursive: true }
        );
      }

      /** Sendend contenr should be in base64. */
      const filePath = path.join(mountPoint, hostname, folder, fileName);
      await fs.writeFile(filePath, content, {
        encoding: "base64"
      });

      res.status(200).json({
        success: true,
        filePath: path.join(mountPoint, hostname, folder, fileName),
        url: `/raw${folder}/${fileName}`
      });
    }
    catch (error) {
      res.status(500).json({
        success: false,
        message: "An error occurred.",
        error
      });
    }
  });

  /** 404 */
  router.use((_, res) => {
    return res.status(404).json({
      success: false,
      message: "Page or method not found."
    });
  });

  return router;
};
