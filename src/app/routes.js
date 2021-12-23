const router = require("express").Router();
const fs = require("fs").promises;
const path = require("path");

module.exports = (mountPoint) => {
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

  router.get("/data/:fileName", async (req, res) => {
    try {
      const {
        params: { fileName },
        hostname
      } = req;

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
      console.error(error);
      if (error.code === "ENOENT") {
        res.status(404).json({
          success: false,
          message: "File not found on the server."
        });
      }

      throw error;
    }
  });

  return router;
};
