import { Queue } from "bullmq";
import { QUEUE_NAME, redisOptions } from "../config";

let stashQueue: Queue | null = null;

export const createStashQueue = () =>
  (stashQueue = new Queue(QUEUE_NAME, { connection: redisOptions }));

export const getStashQueue = () => {
  if (!stashQueue) {
    throw new Error("Stash queue has not been created yet");
  }
  return stashQueue;
};