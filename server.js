import express from "express";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

const stats = {
  totalExecutions: 0,
  uniqueUsers: new Set(),
  gameCounts: {},
};

app.post("/webhook", (req, res) => {
  const embed = req.body.embeds?.[0];
  if (!embed) return res.status(400).send("No embed found");

  const fields = Object.fromEntries(embed.fields.map(f => [f.name, f.value]));

  const userId = fields["User ID"];
  const gameName = fields["Game"];

  stats.totalExecutions += 1;
  stats.uniqueUsers.add(userId);

  if (gameName) {
    stats.gameCounts[gameName] = (stats.gameCounts[gameName] || 0) + 1;
  }

  res.sendStatus(200);
});

app.get("/stats", (req, res) => {
  const topGames = Object.entries(stats.gameCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => ({ name, count }));

  res.json({
    totalExecutions: stats.totalExecutions,
    uniqueUsers: stats.uniqueUsers.size,
    topGames
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
