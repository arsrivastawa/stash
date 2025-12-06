import puppeteer from "puppeteer";

export interface ScrapedData {
  title: string;
  description: string;
  image: string;
  url: string;
}

export async function scrapeUrl(url: string): Promise<ScrapedData> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36"
    );

    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    try {
      await page.waitForSelector("article", { timeout: 10000 });
    } catch (err) {
      console.log(
        "No article tag found, might be a login wall or bot detection."
      );
    }

    const data = await page.evaluate(() => {
      const getMeta = (propName: string) => {
        const element =
          document.querySelector(`meta[property='${propName}']`) ||
          document.querySelector(`meta[name='${propName}']`);
        return element ? element.getAttribute("content") || "" : "";
      };

      return {
        title: getMeta("og:title") || document.title,
        description: getMeta("og:description") || getMeta("description"),
        image: getMeta("og:image"),
      };
    });

    return { ...data, url };
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    throw error;
  } finally {
    await browser.close();
  }
}
