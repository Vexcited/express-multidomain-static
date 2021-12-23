const getDevicePath = require("../utils/getDevicePath");
const authToken = require("../utils/authToken");
const express = require("express");
const routes = require("./routes");

/**
 * Start the CDN server.
 * @param {string} deviceName - Device to find, example: `/dev/sda1`.
 * @param {import("../types/CliArguments").CliArguments - Arguments of the CLI.
 */
async function startServer (deviceName, arguments) {
  const cdn = express();
  
  // Middlewares.
  cdn.use(express.json());
  cdn.use(express.urlencoded({ extended: false }));

  const mountPoint = await getDevicePath(deviceName);
  cdn.use(routes(mountPoint));

  // Custom 404 for the API.
  cdn.use((_, res) => res.status(404).json({
    success: false,
    message: "Page or method not found."
  }));

  const PORT = arguments.port || 8090;
  cdn.listen(PORT, () => console.info(
    `Your CDN is currently listening on port ${PORT}.\n`
    + "* Documentation: https://github.com/Vexcited/express-disk-cdn"
  ));
}

module.exports = startServer;
