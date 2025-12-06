import express from "express";
import { Queue } from "bullmq";
import { redisOptions, QUEUE_NAME } from "../config";

const app = express();
const port = process.env.PORT || 3000;

const stashQueue = new Queue(QUEUE_NAME, { connection: redisOptions });

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Stash Queue API is running");
});

app.post("/save", async (req, res) => {
  const { url } = req.body;
  if (!url) res.status(400).send({ error: "URL is required" });

  try {
    const job = await stashQueue.add("save-url", { url });
    res
      .status(200)
      .send({
        status: "queued",
        jobId: job.id,
      });
  } catch (error) {
    res.status(500).send({ error: "Failed to add job to the queue" });
  }
});

app.listen(port, () => {
  console.log(`[API] Server is running on http://localhost:${port}`);
});
