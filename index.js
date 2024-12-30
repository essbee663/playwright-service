const express = require('express');
const { chromium } = require('playwright');

const app = express();
app.use(express.json());

app.post('/scrape', async (req, res) => {
  const { url, selector } = req.body;

  if (!url || !selector) {
    return res.status(400).json({ error: 'Missing "url" or "selector"' });
  }

  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Wait for the selector and scrape data
    await page.waitForSelector(selector);
    const data = await page.evaluate((selector) => {
      return Array.from(document.querySelectorAll(selector)).map(el => ({
        href: el.href,
        text: el.textContent.trim(),
      }));
    }, selector);

    await browser.close();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Scraping Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Service running on port ${PORT}`));
