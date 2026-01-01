import { getPrismaClient } from "../../helper/initiatePrisma";

export const getController = async ({ req, res }: { req: any; res: any }) => {
  const prisma = getPrismaClient();

  const user = req.user;

  if (!user) {
    return res.status(401).send({ error: "Unauthorized: User ID missing" });
  }

  try {
    const items = await prisma.item.findMany({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
        title: true,
        originalUrl: true,
        isProcessed: true,
        description: true,
        imageUrl: true,
        createdAt: true,
      },
    //   take: 2,
      orderBy: {
        createdAt: "desc",
      },
    });
    return res.status(200).json(items);
  } catch (error) {
    return res.status(500).send({ error: "Internal Server Error" });
  }
};
