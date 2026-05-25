const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const TARGET_DIR = path.join(__dirname, '../public/artworks');
const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 82;

async function compressImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
    return;
  }

  const stats = fs.statSync(filePath);
  const sizeBefore = stats.size;

  try {
    const image = sharp(filePath);
    const metadata = await image.metadata();

    let width = metadata.width;
    let height = metadata.height;

    if (!width || !height) {
      console.warn(`Could not read dimensions for: ${filePath}`);
      return;
    }

    let needsResize = false;
    let newWidth = width;
    let newHeight = height;

    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      needsResize = true;
      if (width > height) {
        newWidth = MAX_DIMENSION;
        newHeight = Math.round((height * MAX_DIMENSION) / width);
      } else {
        newHeight = MAX_DIMENSION;
        newWidth = Math.round((width * MAX_DIMENSION) / height);
      }
    }

    // Temporary path to write the compressed image
    const tempFilePath = filePath + '.tmp';

    let pipeline = sharp(filePath);
    if (needsResize) {
      pipeline = pipeline.resize(newWidth, newHeight);
    }

    if (ext === '.jpg' || ext === '.jpeg') {
      pipeline = pipeline.jpeg({ quality: JPEG_QUALITY, progressive: true });
    } else if (ext === '.png') {
      pipeline = pipeline.png({ compressionLevel: 8, palette: true });
    }

    await pipeline.toFile(tempFilePath);

    const tempStats = fs.statSync(tempFilePath);
    const sizeAfter = tempStats.size;

    if (sizeAfter < sizeBefore) {
      // Overwrite the original file with the compressed one
      fs.unlinkSync(filePath);
      fs.renameSync(tempFilePath, filePath);
      const savings = ((sizeBefore - sizeAfter) / sizeBefore * 100).toFixed(1);
      console.log(`[SUCCESS] Optimized: ${path.relative(TARGET_DIR, filePath)}`);
      console.log(`  Size: ${(sizeBefore / 1024 / 1024).toFixed(2)} MB -> ${(sizeAfter / 1024).toFixed(1)} KB (-${savings}%)`);
      console.log(`  Dimensions: ${width}x${height} -> ${newWidth}x${newHeight}`);
    } else {
      // Clean up the temp file if the compressed version is somehow larger
      fs.unlinkSync(tempFilePath);
      console.log(`[SKIPPED] Compressed size is larger for: ${path.relative(TARGET_DIR, filePath)}`);
    }
  } catch (err) {
    console.error(`[ERROR] Failed to compress ${filePath}:`, err);
  }
}

async function processDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      await processDirectory(fullPath);
    } else if (entry.isFile()) {
      await compressImage(fullPath);
    }
  }
}

async function main() {
  console.log(`Starting image compression under: ${TARGET_DIR}`);
  console.log(`Settings: Max Dimension = ${MAX_DIMENSION}px, JPEG Quality = ${JPEG_QUALITY}%`);
  
  if (!fs.existsSync(TARGET_DIR)) {
    console.error(`Directory does not exist: ${TARGET_DIR}`);
    process.exit(1);
  }

  const startTime = Date.now();
  await processDirectory(TARGET_DIR);
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\nFinished compression in ${duration}s!`);
}

main();
