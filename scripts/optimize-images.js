
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const MAX_WIDTH = 1920;

async function optimizeImages(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      await optimizeImages(filePath);
    } else if (file.match(/\.(jpg|jpeg|png)$/i)) {
      const originalSize = stat.size;
      const sharpInstance = sharp(filePath);

      const metadata = await sharpInstance.metadata();

      if (metadata.width > MAX_WIDTH) {
        sharpInstance.resize(MAX_WIDTH);
      }

      if (file.match(/\.(jpg|jpeg)$/i)) {
        sharpInstance.jpeg({ quality: 80 });
      } else if (file.match(/\.png$/i)) {
        sharpInstance.png({ quality: 80 });
      }

      const tempFilePath = `${filePath}.tmp`;
      await sharpInstance.toFile(tempFilePath);

      const newSize = fs.statSync(tempFilePath).size;
      fs.renameSync(tempFilePath, filePath);

      console.log(`Optimized ${filePath}: ${originalSize} bytes -> ${newSize} bytes`);
    }
  }
}

(async () => {
  console.log('Starting image optimization...');
  await optimizeImages(publicDir);
  console.log('Image optimization complete!');
})();
