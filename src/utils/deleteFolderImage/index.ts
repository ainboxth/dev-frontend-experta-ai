"use server";

import { rm } from "fs/promises";

const deleteFolderImage = async (path: string) => {
  try {
    await rm(path, { recursive: true, force: true });
    console.log(`complete delete path: ${path}`);
    return { success: true, message: `Folder ${path} has been deleted successfully.` };
  } catch (error) {
    console.error("Error deleting folder:", error);
    return { success: false, message: `Failed to delete folder ${path}.` };
  }
};

export default deleteFolderImage;