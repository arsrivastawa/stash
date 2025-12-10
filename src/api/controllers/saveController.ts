import { getStashQueue } from "../../helper/createStash";
import { getPrismaClient } from "../../helper/initiatePrisma";

export const saveController = async ({ req, res }: { req: any; res: any }) => {
  // console.log("\n\n\n", req, "\n\n\n")
  const { url } = req.body;
  if (!url) res.status(400).send({ error: "URL is required" });

  const stashQueue = getStashQueue();
  const prisma = getPrismaClient();

  const existing = await prisma.item.findUnique({
    where: {originalUrl: url}
  })

  if (existing) {
    return res.status(200).send({
      status: "exists",
      itemId: existing.id,
    });
  }
  try {

    const savedItem = await prisma.item.create({
      data: {
        originalUrl: url,
        isProcessed: false,
      },
    });
    
    console.log('[API] Saved item to database with ID:', savedItem.id);
    const job = await stashQueue.add("save-url", { url });
    res.status(200).send({
      status: "queued",
      jobId: job.id,
    });
  } catch (error) {
    res.status(500).send({ error: "Failed to add job to the queue" });
  }
};
