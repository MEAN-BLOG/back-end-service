#!/usr/bin/env node

/**
 * Simple script to help update CHANGELOG.md
 * Usage: node update-changelog.js [patch|minor|major]
 */

const fs = require('fs');
const path = require('path');

// Get version type from command line argument
const versionType = process.argv[2] || 'patch';
const validTypes = ['patch', 'minor', 'major'];

if (!validTypes.includes(versionType)) {
  console.error(`Invalid version type. Use: ${validTypes.join(', ')}`);
  process.exit(1);
}

// Read current CHANGELOG.md
const changelogPath = path.join(__dirname, 'CHANGELOG.md');
let changelog = fs.readFileSync(changelogPath, 'utf8');

// Get current date
const today = new Date();
const dateString = today.toISOString().split('T')[0];

// Generate new version based on current version in package.json
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const currentVersion = packageJson.version;
const versionParts = currentVersion.split('.').map(Number);

let newVersion;
switch (versionType) {
  case 'major':
    newVersion = `${versionParts[0] + 1}.0.0`;
    break;
  case 'minor':
    newVersion = `${versionParts[0]}.${versionParts[1] + 1}.0`;
    break;
  case 'patch':
    newVersion = `${versionParts[0]}.${versionParts[1]}.${versionParts[2] + 1}`;
    break;
}

// Update the unreleased section to new version
const newVersionHeader = `## [${newVersion}] - ${dateString}`;
const unreleasedRegex = /## \[Unreleased\]/;
const newChangelog = changelog.replace(unreleasedRegex, `${newVersionHeader}\n\n## [Unreleased]`);

// Write back to file
fs.writeFileSync(changelogPath, newChangelog);
