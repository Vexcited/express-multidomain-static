import fs from "fs/promises";

/**
 * Gives you the mount point path of a device.
 * @param {string} deviceName - Directory of the device, ex.: /dev/sda1.
 * @returns {Promise<string>} - Mount point path of the device.
 */
export default async function getDevicePath (deviceName: string) {
    const buffer = await fs.readFile("/proc/mounts", { encoding: "utf8" });
    const lines = buffer.split("\n");

    const deviceNameRegex = new RegExp(deviceName);
    const mountLines = lines.filter(line => deviceNameRegex.test(line));

    // Check if the device is mounted
    if (mountLines.length < 1) throw Error(`Device "${deviceName}" is not mounted or connected.`);

    // Return the device mount path.
    return mountLines[0].split(" ")[1];
}