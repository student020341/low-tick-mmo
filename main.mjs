import fastify from "fastify";
import fastws from "@fastify/websocket";
import {v4 as uuid} from "uuid";
import Game from "./src/game.mjs";

const game = new Game();

// server
const router = fastify({logger: true});
router.register(fastws);
router.register(async function (r) {
  r.get("/ws", {websocket: true}, (conn, req) => {
    const id = uuid();
    game.playerJoin(id, conn.socket);

    conn.socket.on("close", () => {
      game.playerLeave(id);
    });
  });
});

setInterval(() => {
  // spawn & move things, collect changes for active chunks
  const updates = game.chunkStep();

  // send relevant updates to players
  game.updatePlayers(updates);
}, 500);

//
router.get("/", async (req, res) => {
  return {status: "ok"};
});

// run server
(async () => {
  try {
    await router.listen({port: 3000});
  } catch (err) {
    router.log.error(err);
    process.exit(1);
  }
})();

