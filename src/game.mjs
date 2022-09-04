import Chunk, { coordsAround, defaultChunks } from "./chunk.mjs";
import { cmpCoords } from "./utils.mjs";

export default class Game {
  constructor() {
    /** @type Array<Chunk> */
    this.chunks = [];
    this.players = {};

    this.setupChunks();
  }

  playerJoin(id, ws) {
    this.players[id] = {
      ws,
      chunk: [0, 0], // map chunk coordinate
      position: [1, 1]
    };

    // get any existing data to send to player
    const player = this.players[id];
    const spaces = [player.chunk, ...coordsAround(player.chunk)];
    const chunks = this.chunks.filter(c => spaces.some(s => cmpCoords(s, c.coordinate)));
    const game_state = chunks.reduce((updates, chunk) => {
      // spawned entities
      const spawned = chunk.spawners.reduce((spawned, spawner) => spawned.concat(spawner.spawned), [])
        .map(e => ({chunk, type: "entity-spawn", data: e}));

      // chunk obstacles
      const obstacles = {
        chunk,
        type: "chunk-data",
        obstacles: chunk.obstacles
      };

      return updates
        .concat(spawned)
        .concat(obstacles);
    }, []);

    player.ws.send(JSON.stringify(game_state));
  }

  playerMessage(id, raw) {
    const player = this.players[id];
    if (!player) {
      console.error(`player ${id} does not exist`);
      return;
    }

    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch(e) {
      console.error(`playerMessage: invalid json: ${raw.toString()}`);
      return;
    }

    if (!msg.type) {
      console.error(`playerMessage: invalid json: ${raw.toString()}`);
    }

    switch(msg.type) {
      case "test": {
        console.log(`received test message from player ${id}`);
        player.ws.send(JSON.stringify([{type: "test"}]));
        break;
      }
    }
  }

  playerLeave(id) {
    delete this.players[id];
  }

  setupChunks() {
    // TODO make map configurable
    this.chunks = defaultChunks();

    // console.log(this.chunks);
  }

  //
  chunkStep() {
    // updates to send to clients
    let updates = [];

    // get map of active chunks
    /** @type Object.<string, Chunk> */
    const chunk_map = (Object.keys(this.players).reduce((acc, next) => {
      const p = this.players[next];
      const coords = [p.chunk, ...coordsAround(p.chunk)];
      const chunks = this.chunks.filter(chunk => coords.some(coord => chunk.coordinate[0] == coord[0] && chunk.coordinate[1] == coord[1]));
      return Object.assign(acc, ...chunks.map(c => ({ [c.id]: c })));
    }, {}));

    Object.values(chunk_map).forEach(chunk => {
      // spawn mobs
      chunk.spawners.forEach(s => {
        let new_ent = s.tick();
        if (new_ent != null) {
          updates.push({ chunk, type: "entity-spawn", data: new_ent });
        }
      });

      // 30% chance to select a mob from this chunk to move
      if (Math.random() > 0.7) {
        const mobs = chunk.spawners.reduce((acc, next) => acc.concat(next.spawned.filter(s => s.getType() == "mob")), []);

        // select mobs to move
        if (mobs.length > 0) {
          let mob = null;
          const not_moving = mobs.filter(mob => mob.path.length == 0);
          if (not_moving.length > 0) {
            // select a mob that isn't moving for a new path
            mob = not_moving[Math.floor(Math.random() * not_moving.length)];
          } else if (Math.random() > 0.7) {
            // 30% chance to overwrite current path of a mob that is already moving
            mob = mobs[Math.floor(Math.random() * mobs.length)];
          }

          if (mob != null) {
            const new_x = Math.floor(Math.random() * 10);
            const new_y = Math.floor(Math.random() * 10);
            const path = chunk.paths.search(mob.entity.position, [new_x, new_y]);
            // check for potentially unreachable destination (no good path or target space is solid)
            if (path != null) {
              mob.path = path;
              updates.push({ chunk, type: "entity-path", data: { id: mob.entity.id, path } });
            }
          }
        }
      }
    });

    return updates;
  }

  updatePlayers(updates) {
    Object.keys(this.players).forEach(player_id => {
      const player = this.players[player_id];
      const spaces = [player.chunk, ...coordsAround(player.chunk)];
      // if a player is in chunk 0 and another player is in chunk 2, both will get updates from chunk 1, but will not get updates from each other
      const relevant_updates = updates.filter(update => spaces.some(pc => pc[0] == update.chunk.coordinate[0] && pc[1] == update.chunk.coordinate[1]));
      if (relevant_updates.length > 0) {
        player.ws.send(JSON.stringify(relevant_updates));
      }
    });
  }
}
