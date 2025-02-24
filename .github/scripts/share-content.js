const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const axios = require('axios');

// File to process - passed as argument
const filePath = process.argv[2];

// Check if file exists
if (!fs.existsSync(filePath)) {
  console.error(`File does not exist: ${filePath}`);
  process.exit(1);
}

// Read the file
const fileContent = fs.readFileSync(filePath, 'utf8');

// Parse front matter
const { data, content } = matter(fileContent);

// Extract title, either from front matter or filename
const title = data.title || path.basename(filePath, '.md');

// Check if this post should be shared (optional)
const shouldShare = data.share !== false; // Default to sharing unless explicitly set to false

if (!shouldShare) {
  console.log(`Skipping ${filePath} - marked as not to be shared`);
  process.exit(0);
}

// Function to post to IndieHackers
async function postToIndieHackers() {
  try {
    const apiKey = process.env.INDIEHACKERS_API_KEY;
    
    if (!apiKey) {
      console.error('IndieHackers API key not found');
      return;
    }
    
    console.log(`Posting "${title}" to IndieHackers...`);
    
    // This is a simplified example - you'll need to customize for the actual IndieHackers API
    const response = await axios.post('https://api.indiehackers.com/posts', {
      title: title,
      content: content,
      tags: data.tags || ['lab-notes', 'research', 'decentralized-computing']
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Posted to IndieHackers: ${response.data.url}`);
    return response.data.url;
  } catch (error) {
    console.error('Error posting to IndieHackers:', error.message);
    return null;
  }
}

// Main function to share content
async function shareContent() {
  // Share to IndieHackers
  const indieHackersUrl = await postToIndieHackers();
  
  // Update original file with sharing metadata if needed
  if (indieHackersUrl && !data.shared_urls) {
    const updatedFrontMatter = {
      ...data,
      shared_urls: {
        ...(data.shared_urls || {}),
        indiehackers: indieHackersUrl
      }
    };
    
    const updatedFileContent = matter.stringify(content, updatedFrontMatter);
    fs.writeFileSync(filePath, updatedFileContent);
    console.log(`Updated ${filePath} with sharing metadata`);
  }
}

// Execute the sharing
shareContent().catch(error => {
  console.error('Error in sharing process:', error);
  process.exit(1);
});
