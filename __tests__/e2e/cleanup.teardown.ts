import { test as teardown } from "@playwright/test";
import fs from "fs";

const authFile = "playwright/.auth/user.json";

teardown("cleanup", async () => {
  // Clean up authentication storage state file
  if (fs.existsSync(authFile)) {
    fs.unlinkSync(authFile);
  }
});
