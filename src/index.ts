import startServer from "./app/startServer.js";
import parseArgs from "minimist";

const root_folder_path = process.argv[2];
const args = parseArgs(process.argv.slice(3))

// Check if device was specified.
if (!root_folder_path) throw Error(
  "Path of the root folder not specified !"
  + "\nUsage: pnpm start /path/to/root_folder [--port 8090]"
);

// Start the server with the given device to deploy
// and with the optional parameters.
startServer(root_folder_path, args);
