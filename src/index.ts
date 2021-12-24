import startServer from "./app/startServer.js";

// Check script compatibility.
if (process.platform !== "linux") throw Error(
  "This CDN only supports 'linux' platforms.\n"
  + "To make this project more supported, please consider contributing to the project."
)

// Structure: [nodeBin, scriptPath, deviceName, ...args].
const deviceName = process.argv[2];
const args = process.argv.slice(3);

// Check if device was specified.
if (!deviceName) throw Error(
  "Device to deploy not specified !"
);

// Parse the argments by spliting them (chunks of 2).
const parsedArgumentsArray = args.reduce((
  resultArray: [string, (string | number)][],
  item,
  index
) => { 
  const chunkIndex = Math.floor(index / 2);
  
  // Create a new chunk.
  if (!resultArray[chunkIndex]) {
    // We set a temporary empty value to not mess it up in the object.
    resultArray[chunkIndex] = [item, ""];
  }
  else {
    // We convert strings to number, if possible.
    const value = isNaN(+item) ? item : parseInt(item);

    // Replace the empty string with the actual value.
    resultArray[chunkIndex][1] = value;
  }

  // Return the array.
  return resultArray;
}, []);

// Convert the parsed arguments to an object.
const convertArrayToObject = (
  finalObject: { [key: string]: string | number },
  item: [string, (string | number)]
) => {
  // Parse the name value if it's a string.
  const key = item[0].replace(/-/g, "");
  const value = item[1];

  // Define the argument in the object.
  finalObject[key] = value;
  return finalObject;
}
const parsedArguments = parsedArgumentsArray.reduce(convertArrayToObject, {});

// Start the server with the given device to deploy
// and with the optional parameters.
startServer(deviceName, parsedArguments);
