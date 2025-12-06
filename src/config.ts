import { ConnectionOptions } from "bullmq";
import dotenv from "dotenv";

dotenv.config();

export const redisOptions: ConnectionOptions = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
}

export const QUEUE_NAME = "stash-queue";