const startServer = require("./app/startServer");

// Check script compatibility.
if (process.platform !== "linux") throw Error(
  "This CDN only supports 'linux' platforms.\n"
  + "To make this project more supported, please consider contributing to the project."
)

// Structure: [nodeBin, scriptPath, deviceName, ...arguments].
const deviceName = process.argv[2];
const arguments = process.argv.slice(3);

// Check if device was specified.
if (!deviceName) throw Error(
  "Device to deploy not specified !"
);

// Parse the argments by spliting them (chunks of 2).
const parsedArgumentsArray = arguments.reduce((resultArray, item, index) => { 
  const chunkIndex = Math.floor(index / 2);

  // Create a new chunk.
  if (!resultArray[chunkIndex]) {
    resultArray[chunkIndex] = [];
  }

  // We convert strings to number if possible.
  const value = isNaN(item) ? item : parseInt(item);

  // Add the value to the current chunk.
  resultArray[chunkIndex].push(value);
  return resultArray;
}, []);

// Convert the parsed arguments to an object.
const parsedArguments = parsedArgumentsArray.reduce((obj, item) => (obj[item[0].replace(/-/g, "")] = item[1], obj), {});

// Start the server with the given device to deploy
// and with the optional parameters.
startServer(deviceName, parsedArguments);
