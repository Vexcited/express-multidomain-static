export default function parseFolderParam (folder: string) {
  // Replace every not(letters and "/") by "-".
  folder = folder.replace(/[^\w/]/g, "-");

  // Replace every consecutive "/" to only one.
  folder = folder.replace(/(\/){2,}/g, "/");

  // Check the first trailling slash (should be removed).
  if (folder[0] === "/") folder.slice(1);

  // Should leave a trailling slash at the end.
  if (folder[folder.length - 1] !== "/") folder.concat("/");

  return folder;
}
