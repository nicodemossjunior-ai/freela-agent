#!/usr/bin/env node
import { DEFAULT_DATABASE_PATH, resetDatabase } from "./db.js";

const databasePath = process.argv[2] ?? DEFAULT_DATABASE_PATH;

resetDatabase(databasePath);
console.log(`Reset local database: ${databasePath}`);
