// src/scripts/git.js
const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');

const git = simpleGit();

async function cloneRepo(repoUrl, localPath) {
  await git.clone(repoUrl, localPath);
}

async function readCssFiles(dir) {
  const files = fs.readdirSync(dir);
  const cssFiles = files.filter(file => file.endsWith('.css'));
  return cssFiles.map(file => fs.readFileSync(path.join(dir, file), 'utf8'));
}

module.exports = { cloneRepo, readCssFiles };
