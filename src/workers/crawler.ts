import { Worker } from "bullmq";
import { redisOptions, QUEUE_NAME } from "../config";
import { scrapeUrl } from "./scrapers/baseScraper"; // <--- Import the scraper

console.log("[Worker] Crawler service starting...");

const worker = new Worker(
  QUEUE_NAME,
  async (job) => {
    const { url } = job.data;

    console.log(`[Worker] Scraping URL: ${url}`);

    try {
      const metadata = await scrapeUrl(url);

      console.log("[Worker] Found Metadata:");
      console.log(
        `Title:       ${metadata.title?.substring(0, 50)}${
          metadata.title?.length > 50 ? "..." : ""
        }`
      );
      console.log(`Image:       ${metadata.image}`);
      console.log(
        `Description: ${metadata.description?.substring(0, 80)}${
          metadata.description?.length > 80 ? "..." : ""
        }`
      );
    } catch (err: any) {
      console.error(`[Worker] Failed to scrape ${url}: ${err.message}`);

      throw err;
    }
  },
  { connection: redisOptions }
);

worker.on("failed", (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed: ${err.message}`);
});
