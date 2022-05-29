import parseFolderParam from "../utils/parseFolderParam.js";
import parseFileName from "../utils/parseFileName.js";
import createFolder from "../utils/createFolder.js";
import express from "express";
import fs from "fs/promises";
import path from "path";

/** Router */
const router = express.Router();

/**
 * Create the routes for Express.
 * @param root_folder_path - Device's mount point path.
 * @param token - Token generated stored in `token.json`.
 */
export default function createRoutes (root_folder_path: string, token: string) {
  /** Check if the hostname folder exists. */
  router.use(async (req, res, next) => {
    try {
      await createFolder(root_folder_path, req.hostname);
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

  /**
   * GET /raw/:fileName[?folder=/some/folder]
   * This route returns the raw file.
   */
  router.get("/raw/:fileName", (req, res) => {
    const {
      params: { fileName },
      hostname
    } = req;

    // Optional folder query.
    const folder = req.query.folder ? parseFolderParam(req.query.folder as string) : "";

    res.status(200).sendFile(parseFileName(fileName), {
      root: path.join(root_folder_path, hostname, folder)
    }, (error) => {
      if (error) {
        res.status(404).json({
          success: false,
          message: "File not found on the server."
        });
      }
    });
  });

  /** (POST | GET) /data/:fileName[?folder=/some/folder] */
  router.route("/data/:fileName")

  /**
   * GET /data/:fileName[?folder=/some/folder]
   * This route returns the data of a given file.
   */
    .get(async (req, res) => {
      try {
        const {
          params: { fileName },
          hostname
        } = req;

        const cleanedFileName = parseFileName(fileName);

        // Optional folder query.
        const folder = req.query.folder ? parseFolderParam(req.query.folder as string) : "";

        const filePath = path.join(root_folder_path, hostname, folder, cleanedFileName);
        const fileData = await fs.readFile(filePath, {
          encoding: "base64"
        });

        res.status(200).json({
          success: true,
          informations: {
            name: cleanedFileName,
            ...(folder ? { subFolder: folder } : {})
          },
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
   * POST /data/:fileName[?folder=/some/folder]
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
          if (token !== parsedToken) {
            return res.status(403).json({
              success: false,
              message: "Invalid token."
            });
          }
        }

        if (!content) {
          return res.status(400).json({
            success: false,
            message: "Parameter `content` didn't passed."
          });
        }

        /** Optional custom sub-folder. If it doesn't exist, we just set an empty variable. */
        let folder = req.query.folder as string || "";
        let folderPath = path.join(root_folder_path, hostname);
        if (folder) {
          // We parse the query.
          folder = parseFolderParam(folder);

          // We create the folder if it doesn't exist.
          await createFolder(folderPath, folder);

          // Know the full folder path and store it.
          folderPath = path.join(folderPath, folder);
        }

        // Get the full path for the final file.
        const cleanedFileName = parseFileName(fileName);
        const filePath = path.join(folderPath, cleanedFileName);

        /** Sended content should be in Base64. */
        await fs.writeFile(filePath, content, {
          encoding: "base64"
        });

        const sub_url = `${cleanedFileName}${folder ? `?folder=${folder}` : ""}`;

        res.status(200).json({
          success: true,
          filePath,
          url_raw: `/raw/${sub_url}`,
          url_data: `/data/${sub_url}`
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
}
