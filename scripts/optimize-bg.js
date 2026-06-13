const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const inputFile = path.resolve(__dirname, '../public/distribution/2026/kemutai-hanashi/Illustration125c.jpg');
const outputFile = path.resolve(__dirname, '../public/distribution/2026/kemutai-hanashi/Illustration125c.webp');

async function main() {
  console.log(`Checking input file: ${inputFile}`);
  if (!fs.existsSync(inputFile)) {
    console.error(`Input file does not exist: ${inputFile}`);
    process.exit(1);
  }

  const statsBefore = fs.statSync(inputFile);
  const sizeBeforeMB = (statsBefore.size / 1024 / 1024).toFixed(2);
  console.log(`Original file size: ${sizeBeforeMB} MB`);

  console.log('Optimizing background image...');
  try {
    const fileBuffer = fs.readFileSync(inputFile);
    const image = sharp(fileBuffer);
    const metadata = await image.metadata();
    
    console.log(`Original dimensions: ${metadata.width}x${metadata.height}`);
    
    const MAX_DIMENSION = 2048;
    let width = metadata.width;
    let height = metadata.height;
    let needsResize = false;
    
    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      needsResize = true;
      if (width > height) {
        width = MAX_DIMENSION;
        height = Math.round((metadata.height * MAX_DIMENSION) / metadata.width);
      } else {
        height = MAX_DIMENSION;
        width = Math.round((metadata.width * MAX_DIMENSION) / metadata.height);
      }
    }
    
    let pipeline = sharp(fileBuffer);
    if (needsResize) {
      console.log(`Resizing to: ${width}x${height}`);
      pipeline = pipeline.resize(width, height);
    }
    
    pipeline = pipeline.webp({ quality: 80, effort: 6 });
    
    await pipeline.toFile(outputFile);
    
    const statsAfter = fs.statSync(outputFile);
    const sizeAfterKB = (statsAfter.size / 1024).toFixed(1);
    const savings = ((statsBefore.size - statsAfter.size) / statsBefore.size * 100).toFixed(2);
    
    console.log('[SUCCESS] Background image optimized!');
    console.log(`Output: ${outputFile}`);
    console.log(`New size: ${sizeAfterKB} KB (Reduced by ${savings}%)`);
    console.log(`New dimensions: ${width}x${height}`);
  } catch (error) {
    console.error('[ERROR] Failed to optimize background image:', error);
    process.exit(1);
  }
}

main();
