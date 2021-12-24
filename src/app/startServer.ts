import type { CliArguments } from "../types";

import getDevicePath from "../utils/getDevicePath.js";
import authToken from "../utils/authToken.js";
import createRoutes from "./routes.js";
import express from "express";

/**
 * Start the CDN server.
 * @param {string} deviceName - Device to find, example: `/dev/sda1`.
 * @param {CliArguments} args - Arguments of the CLI.
 */
export default async function startServer (deviceName: string, args: CliArguments) {
  const cdn = express();
  const token = await authToken();
  
  // Middlewares.
  cdn.use(express.json());
  cdn.use(express.urlencoded({ extended: false }));

  // Create API routes.
  const mountPoint = await getDevicePath(deviceName);
  const routes = createRoutes(mountPoint, token);
  cdn.use(routes);

  const PORT = args.port || 8090;
  cdn.listen(PORT, () => console.info(
    `Your CDN is currently listening on port ${PORT}.\n`
    + "* Documentation: https://github.com/Vexcited/express-disk-cdn"
  ));
}