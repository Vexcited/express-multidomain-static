import fs from "fs/promises";
import path from "path";

export default async function createFolder (
  base: string,
  folder_name: string
) {
  try {
    await fs.mkdir(
      path.join(base, folder_name),
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
