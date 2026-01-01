import { getPrismaClient } from "../../helper/initiatePrisma";

export const deleteController = async ({ req, res }: { req: any; res: any }) => {
  const prisma = getPrismaClient();

  const user = req.user;

  if (!user) {
    return res.status(401).send({ error: "Unauthorized: User ID missing" });
  }

  const { id } = req.body;

  if (!id) {
    return res.status(400).send({ error: "Item ID is required" });
  }

  try {
    const item = await prisma.item.findUnique({
      where: {
        id: id,
      },
    });

    if (!item) {
      return res.status(404).send({ error: "Item not found" });
    }

    if (item.userId !== user.id) {
      return res
        .status(403)
        .send({
          error: "Forbidden: You do not have permission to delete this item",
        });
    }

    await prisma.item.delete({
      where: {
        id: id,
        userId: user.id,
      },
    });

    return res.status(200).send({ message: "Item deleted successfully" });
  } catch (error) {
    return res.status(500).send({ error: "Internal Server Error" });
  }
};
