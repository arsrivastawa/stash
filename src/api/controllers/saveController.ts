import { getStashQueue } from "../../helper/createStash";
import { getPrismaClient } from "../../helper/initiatePrisma";

export const saveController = async ({ req, res }: { req: any; res: any }) => {
  const { url } = req.body;
  
  // 1. Get the User ID from the request (Populated by your 'requireAuth' middleware)
  // If this is undefined, it means your route isn't protected properly!
  const userId = req.user?.id; 

  if (!url) return res.status(400).send({ error: "URL is required" });
  if (!userId) return res.status(401).send({ error: "Unauthorized: User ID missing" });

  const stashQueue = getStashQueue();
  const prisma = getPrismaClient();

  // 2. Check for duplicates ONLY for this specific user
  // (Alice can save google.com even if Bob already saved it)
  const existing = await prisma.item.findFirst({
    where: {
      originalUrl: url,
      userId: userId // <--- Added this constraint
    }
  })

  if (existing) {
    return res.status(200).send({
      status: "exists",
      itemId: existing.id,
    });
  }

  try {
    // 3. Create the item WITH the userId
    const savedItem = await prisma.item.create({
      data: {
        originalUrl: url,
        isProcessed: false,
        userId: userId, // <--- THE FIX: Linking the item to the user
      },
    });
    
    console.log('[API] Saved item to database with ID:', savedItem.id);
    
    // Pass userId to the queue job too (in case the worker needs it)
    const job = await stashQueue.add("save-url", { url, userId });
    
    res.status(200).send({
      status: "queued",
      jobId: job.id,
    });
  } catch (error) {
    console.error(error); // Log the actual error to see what's wrong
    res.status(500).send({ error: "Failed to save item" });
  }
};