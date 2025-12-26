import express, { Request } from "express";
import { createStashQueue } from "../helper/createStash";
import { saveController } from "./controllers/saveController";
import { createPrismaClient } from "../helper/initiatePrisma";
import cors from 'cors'
import { use } from "marked";
import { AuthRequest, requireAuth } from "./middlewares/requireAuth";

const app = express();
const port = process.env.PORT || 3000;

createStashQueue()
createPrismaClient();

app.use(cors())
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Stash Queue API is running");
});

app.post("/check", requireAuth, (req: AuthRequest, res) =>  {
  res.json({ message: "Save endpoint", user: req.user !== undefined ? req.user : null });
});
//

app.use("/save", requireAuth, (req: AuthRequest, res) => saveController({ req, res }));

app.listen(port, () => {
  console.log(`[API] Server is running on http://localhost:${port}`);
});
