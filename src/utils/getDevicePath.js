const fs = require("fs").promises;

/**
 * Gives you the mount point path of a device.
 * @param {string} deviceName - Directory of the device, ex.: /dev/sda1.
 * @returns {Promise<string>} - Mount point path of the device.
 */
async function getDevicePath (deviceName) {
    const buffer = await fs.readFile("/proc/mounts", { encoding: "utf8" });
    const lines = buffer.split("\n");

    const deviceNameRegex = new RegExp(deviceName);
    const mountLines = lines.filter(line => deviceNameRegex.test(line));

    // Check if the device is mounted
    if (mountLines.length < 1) throw Error(`Device "${deviceName}" is not mounted or connected.`);

    // Get the device mount path.
    const mountPath = mountLines[0].split(" ")[1];
    return mountPath;
}

module.exports = getDevicePath;