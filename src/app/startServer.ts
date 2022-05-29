import type { ParsedArgs } from "minimist";

import authToken from "../utils/authToken.js";
import createRoutes from "./routes.js";
import express from "express";

/**
 * Start the express server.
 * @param root_folder_path - Device to find, example: `/dev/sda1`.
 * @param args - Arguments of the CLI.
 */
export default async function startServer (root_folder_path: string, args: ParsedArgs) {
  const server = express();
  const token = await authToken();

  // Middlewares.
  server.use(express.json());
  server.use(express.urlencoded({ extended: false }));

  // Create API routes.
  const routes = createRoutes(root_folder_path, token);
  server.use(routes);

  const PORT = args.port || 8090;
  server.listen(PORT, () => console.info(
    `Currently listening on port ${PORT}.\n`
    + "* Documentation: https://github.com/Vexcited/express-multidomain-static"
  ));
}
