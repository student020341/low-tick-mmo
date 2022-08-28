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

process.exit(0);

setInterval(() => {
  game.chunkStep();
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

/**
 * ideas
 * 
 * - first scope
 * - simple game with simple interaction
 * - receive input from websocket
 * - sections of map managed separately
 * - initial scope - 1 or 2 maps, anonymous player just moves around
 * - 2 ticks per second
 * - second scope
 * - monsters walk, monsters detect, players register movement changes on tick
 * - process and override tick actions in websocket, submit on tick
 * - third scope
 * - monster -> player, player -> monster changes to a battle mode that other players and monsters can enter
 * - direct client & server battle?
 * 
 * immediate next
 * 
 * - simple renderer for chunk 0 in client
 * - simple grid pathing
 * - path finder chooses mobs in active chunks to spawn stuff
 * - anonymous player can join and walk around
 */
