const getDevicePath = require("./utils/getDevicePath");
const express = require("express");
const fs = require("fs").promises;

if (process.platform !== "linux") throw Error(
  "This CDN only supports 'linux' platforms.\n"
  + "To make this project more supported, please consider contributing to the project."
)

// Structure: [nodeBin, scriptPath, deviceName, ...arguments].
const deviceName = process.argv[2];
const arguments = process.argv.slice(3);

// Start the Express CDN server.
async function startServer (deviceName, arguments) {
  const cdn = express();
  
  // Middlewares.
  cdn.use(express.json());
  cdn.use(express.urlencoded({ extended: false }));

  const mountPoint = await getDevicePath(deviceName);
  
  cdn.get("/:fileName", async (req, res) => {
    const { params: { fileName } } = req;
    const { query: { folder } } = req;

    const path = `${mountPoint}/${folder}/${fileName}`;
    const file = await fs.readFile(path, { encoding: "base64" });

    res.json({
      success: true,
      location: {
        deviceName,
        path
      },
      result: file
    })
  });
  
  cdn.listen(8090);
}

startServer(deviceName, arguments);