/**
 * SIMULATED BACKEND (Express + Vite)
 * 
 * NOTE: This server is used for the live preview in this environment.
 * The real Django backend requested is implemented in the project files:
 * - /backend/ (Django project)
 * - /users/ (Auth app)
 * - /futebol/ (Core app)
 * - /vercel.json (Vercel config)
 * - /requirements.txt (Python dependencies)
 * 
 * The API endpoints below match the Django implementation.
 */
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "futgestao-secret-key";

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Mock Database
  const users: any[] = [];
  const teams: any[] = [];
  const players: any[] = [];
  const championships: any[] = [];
  const matches: any[] = [];

  // Middleware
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.userId = (decoded as any).id;
      next();
    } catch (err) {
      res.status(401).json({ message: "Invalid token" });
    }
  };

  // Auth Routes
  app.post("/api/register", async (req, res) => {
    const { name, email, password } = req.body;
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = { id: Date.now().toString(), name, email, password: hashedPassword };
    users.push(user);
    const token = jwt.sign({ id: user.id }, JWT_SECRET);
    res.json({ user: { id: user.id, name, email }, token });
  });

  app.post("/api/token", async (req, res) => {
    const { email, password } = req.body;
    const user = users.find((u) => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id }, JWT_SECRET);
    res.json({ user: { id: user.id, name: user.name, email }, token });
  });

  app.get("/api/me", authenticate, (req: any, res) => {
    const user = users.find(u => u.id === req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ id: user.id, name: user.name, email: user.email });
  });

  // Teams (Times)
  app.get("/api/times", authenticate, (req: any, res) => {
    res.json(teams.filter(t => t.createdBy === req.userId));
  });

  app.post("/api/times", authenticate, (req: any, res) => {
    const { name, city } = req.body;
    const team = { id: Date.now().toString(), name, city, createdBy: req.userId };
    teams.push(team);
    res.json(team);
  });

  app.put("/api/times/:id", authenticate, (req: any, res) => {
    const index = teams.findIndex(t => t.id === req.params.id && t.createdBy === req.userId);
    if (index === -1) return res.status(404).json({ message: "Team not found" });
    teams[index] = { ...teams[index], ...req.body };
    res.json(teams[index]);
  });

  app.delete("/api/times/:id", authenticate, (req: any, res) => {
    const index = teams.findIndex(t => t.id === req.params.id && t.createdBy === req.userId);
    if (index === -1) return res.status(404).json({ message: "Team not found" });
    teams.splice(index, 1);
    res.json({ message: "Team deleted" });
  });

  // Players (Jogadores)
  app.get("/api/jogadores", authenticate, (req: any, res) => {
    const userTeams = teams.filter(t => t.createdBy === req.userId).map(t => t.id);
    res.json(players.filter(p => userTeams.includes(p.teamId)));
  });

  app.post("/api/jogadores", authenticate, (req: any, res) => {
    const { name, age, position, teamId } = req.body;
    const player = { id: Date.now().toString(), name, age, position, teamId };
    players.push(player);
    res.json(player);
  });

  // Championships (Campeonatos)
  app.get("/api/campeonatos", authenticate, (req: any, res) => {
    res.json(championships);
  });

  app.post("/api/campeonatos", authenticate, (req: any, res) => {
    const { name, year } = req.body;
    const championship = { id: Date.now().toString(), name, year };
    championships.push(championship);
    res.json(championship);
  });

  // Matches (Partidas)
  app.get("/api/partidas", authenticate, (req: any, res) => {
    res.json(matches);
  });

  app.post("/api/partidas", authenticate, (req: any, res) => {
    const { homeTeamId, awayTeamId, homeGoals, awayGoals, date } = req.body;
    const match = { id: Date.now().toString(), homeTeamId, awayTeamId, homeGoals, awayGoals, date };
    matches.push(match);
    res.json(match);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Error starting server:", err);
});
