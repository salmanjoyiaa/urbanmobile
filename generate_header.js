const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1000, height: 450 },
    deviceScaleFactor: 2,
  });

  const iconBase64 = fs.readFileSync(path.join(__dirname, 'public/icon.png'), 'base64');
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: white;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          position: relative;
        }
        .container {
          display: flex;
          align-items: center;
          gap: 30px;
          margin-bottom: 40px;
        }
        .logo {
          width: 140px;
          height: 140px;
          border-radius: 20px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .title-group {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        h1 {
          font-size: 85px;
          margin: 0;
          line-height: 1;
          font-weight: 800;
          letter-spacing: -2px;
          color: #111;
        }
        p {
          font-size: 32px;
          margin: 10px 0 0 0;
          color: #666;
          font-weight: 500;
          line-height: 1.2;
        }
        .lines {
          position: absolute;
          bottom: 20px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .line {
          height: 1px;
          background-color: #000;
          width: 80%;
          margin-bottom: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <img class="logo" src="data:image/png;base64,${iconBase64}" />
        <div class="title-group">
          <h1>UrbanSaudi</h1>
          <p>The Open Standard for<br/>Real Estate in Saudi Arabia</p>
        </div>
      </div>
      
      <div class="lines">
        <div class="line" style="opacity: 0.1"></div>
        <div class="line" style="opacity: 0.08; width: 78%;"></div>
        <div class="line" style="opacity: 0.06; width: 76%;"></div>
        <div class="line" style="opacity: 0.04; width: 74%;"></div>
        <div class="line" style="opacity: 0.02; width: 72%;"></div>
      </div>
    </body>
    </html>
  `;

  await page.setContent(htmlContent);
  await page.waitForLoadState('networkidle');
  
  await page.screenshot({ path: path.join(__dirname, 'docs/screenshots/urbansaudi_header.png') });
  
  await browser.close();
  console.log('Header generated successfully.');
})();
