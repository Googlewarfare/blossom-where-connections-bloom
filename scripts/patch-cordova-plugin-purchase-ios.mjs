#!/usr/bin/env node
/**
 * Patch for Xcode build failure with cordova-plugin-purchase on iOS.
 *
 * Symptom:
 *  - "Cannot find interface declaration for 'NSObject', superclass of ..."
 *  - Many "Expected a type" errors from FileUtility.h
 *
 * Cause:
 *  FileUtility.h in cordova-plugin-purchase assumes Foundation is imported via a prefix header.
 *  In Capacitor iOS builds (especially SPM-based), that prefix header isn't guaranteed.
 *
 * Fix:
 *  Ensure FileUtility.h starts with `#import <Foundation/Foundation.h>`.
 *
 * Usage (run from repo root after npm install, before cap sync):
 *  node scripts/patch-cordova-plugin-purchase-ios.mjs
 */

import fs from "node:fs";
import path from "node:path";

const filePath = path.resolve(
  process.cwd(),
  "node_modules/cordova-plugin-purchase/src/ios/FileUtility.h",
);

if (!fs.existsSync(filePath)) {
  console.error(
    `[patch-cordova-plugin-purchase-ios] Not found: ${filePath}\n` +
      "Did you run `npm install`?",
  );
  process.exit(1);
}

const content = fs.readFileSync(filePath, "utf8");

// Already patched
if (content.includes("#import <Foundation/Foundation.h>")) {
  console.log(
    "[patch-cordova-plugin-purchase-ios] Already patched (Foundation import present).",
  );
  process.exit(0);
}

// Insert import at the top (before any @interface)
const patched = `#import <Foundation/Foundation.h>\n\n${content}`;
fs.writeFileSync(filePath, patched, "utf8");

console.log(
  "[patch-cordova-plugin-purchase-ios] Patched FileUtility.h (added Foundation import).",
);
