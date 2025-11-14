#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create puppeteer config if it doesn't exist
const puppeteerConfigPath = path.join(__dirname, '../puppeteer-config.json');
if (!fs.existsSync(puppeteerConfigPath)) {
  const config = {
    "args": ["--no-sandbox", "--disable-setuid-sandbox"]
  };
  fs.writeFileSync(puppeteerConfigPath, JSON.stringify(config, null, 2));
}

// Find all .mmd files in docs/mermaid directory
const mermaidDir = path.join(__dirname, '../docs/mermaid');
const files = fs.readdirSync(mermaidDir).filter(file => file.endsWith('.mmd'));

console.log(`Found ${files.length} mermaid files to process...`);

files.forEach(file => {
  const inputFile = path.join(mermaidDir, file);
  const outputFile = path.join(mermaidDir, file.replace('.mmd', '.png'));

  console.log(`Generating PNG for ${file}...`);

  try {
    execSync(`npx mmdc -q -i "${inputFile}" -o "${outputFile}" -p "${puppeteerConfigPath}"`, {
      stdio: 'inherit'
    });
    console.log(`✓ Generated ${outputFile}`);
  } catch (error) {
    console.error(`✗ Failed to generate PNG for ${file}:`, error.message);
    process.exit(1);
  }
});

console.log('All mermaid diagrams generated as PNG successfully!');