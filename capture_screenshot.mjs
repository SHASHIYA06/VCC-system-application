import { chromium } from 'playwright';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

async function capturePreview() {
  console.log('Starting Next.js development server...');
  const server = spawn('npm', ['run', 'dev'], { stdio: 'pipe' });
  
  let devUrl = 'http://localhost:3000';
  let isServerReady = false;
  
  server.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(output);
    const match = output.match(/Local:\s+(http:\/\/localhost:\d+)/);
    if (match) {
      devUrl = match[1];
    }
    if (output.includes('Ready in') || output.includes('started server on') || output.includes('compiled client and server successfully')) {
      isServerReady = true;
    }
  });

  server.stderr.on('data', (data) => {
    const output = data.toString();
    console.error(`stderr: ${output}`);
    const match = output.match(/Local:\s+(http:\/\/localhost:\d+)/);
    if (match) {
      devUrl = match[1];
    }
  });

  // Wait for the server to be ready
  let attempts = 0;
  while (!isServerReady && attempts < 40) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    attempts++;
  }

  if (!isServerReady) {
    console.error('Server did not start in time.');
    server.kill();
    process.exit(1);
  }

  console.log(`Server is ready at ${devUrl}. Capturing screenshot...`);

  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    // Set a good viewport for the dashboard
    await page.setViewportSize({ width: 1440, height: 900 });
    
    await page.goto(`${devUrl}/dashboard`, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Wait an extra second for animations/glass effects to render
    await page.waitForTimeout(2000);
    
    const screenshotPath = '/Users/shashishekharmishra/.gemini/antigravity/brain/1df06787-5f96-4c09-b3f9-aaef7cb925d4/live_dashboard_preview.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    
    console.log(`Screenshot saved successfully to: ${screenshotPath}`);
    await browser.close();
  } catch (error) {
    console.error('Failed to capture screenshot:', error);
  } finally {
    server.kill();
    process.exit(0);
  }
}

capturePreview();
