const fs = require('fs');
const path = require('path');

// Function to recursively find markdown files
function findMarkdownFiles(dir) {
  let results = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      results = results.concat(findMarkdownFiles(fullPath));
    } else if (item.endsWith('.md')) {
      results.push(fullPath);
    }
  }
  
  return results;
}

// Function to add front matter to a markdown file
function addFrontMatter(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if the file already has front matter
  if (content.startsWith('---')) {
    console.log(`File already has front matter: ${filePath}`);
    return;
  }
  
  // Get title from filename
  const fileName = path.basename(filePath, '.md');
  const title = fileName.replace(/[-_]/g, ' ');
  
  // Get parent directory as category
  const parentDir = path.basename(path.dirname(filePath));
  
  // Create front matter with a valid date (current date)
  const now = new Date();
  const validDate = now.toISOString();
  
  const frontMatter = `---
title: "${title}"
categories: ["${parentDir}"]
tags: ["lab-notes"]
status: "publish"
date: "${validDate}"
---

`;

  // Add front matter to content
  const newContent = frontMatter + content;
  
  // Write the new content back to the file
  fs.writeFileSync(filePath, newContent);
  console.log(`Added front matter to: ${filePath}`);
}

// Main function
function main() {
  const postsDir = 'posts';
  if (!fs.existsSync(postsDir)) {
    console.error(`Posts directory not found: ${postsDir}`);
    process.exit(1);
  }
  
  const markdownFiles = findMarkdownFiles(postsDir);
  console.log(`Found ${markdownFiles.length} markdown files.`);
  
  for (const file of markdownFiles) {
    addFrontMatter(file);
  }
}

// Run the main function
main();
