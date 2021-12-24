import fs from "fs/promises";
import path from "path";

export default async function createHostnameFolder (
  mountPoint: string,
  hostname: string
) {
  try {
    await fs.mkdir(
      path.join(mountPoint, hostname),
      { recursive: true }
    );

    return {
      result: true
    };
  }
  catch (error) {
    return {
      result: false,
      error
    };
  }
}
