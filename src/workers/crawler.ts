import { Worker } from 'bullmq';
import { redisOptions, QUEUE_NAME } from '../config';

console.log('[Worker] Crawler service starting...');

const worker = new Worker(QUEUE_NAME, async (job) => {

  console.log(`[Worker] Picking up job ${job.id}`);
  console.log(`[Worker] Scraping URL: ${job.data.url}`);

  await new Promise((resolve) => setTimeout(resolve, 3000));
  
  console.log(`[Worker] Finished processing: ${job.data.url}`);

}, { connection: redisOptions });

worker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed: ${err.message}`);
});