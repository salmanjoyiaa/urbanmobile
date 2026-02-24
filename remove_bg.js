const { removeBackground } = require('@imgly/background-removal-node');
const fs = require('fs');

async function main() {
    const inputPath = 'file://D:/Vibe/urbansaudi/public/images/hero-villa-3d.png';
    const outputPath = 'D:/Vibe/urbansaudi/public/images/hero-villa-3d.png';

    console.log('Removing background...');
    try {
        const imageBlob = await removeBackground(inputPath);
        
        const arrayBuffer = await imageBlob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        fs.writeFileSync(outputPath, buffer);
        console.log('Successfully saved to ' + outputPath);
    } catch (err) {
        console.error('Error removing background:', err);
    }
}

main();