import Chunk, { coordsAround, defaultChunks } from "./chunk.mjs";
import * as foo from "./paths.mjs";

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
    // get map of active chunks
    /** @type Object.<string, Chunk> */
    const chunk_map = (Object.keys(this.players).reduce((acc, next) => {
      const p = this.players[next];
      const coords = [p.chunk, ...coordsAround(p.chunk)];
      const chunks = this.chunks.filter(chunk => coords.some(coord => chunk.coordinate[0] == coord[0] && chunk.coordinate[1] == coord[1]));
      return Object.assign(acc, ...chunks.map(c => ({[c.id]: c})));
    }, {}));

    // TODO consider moving multiple mobs per active chunk
    let mobs_to_move = [];
    Object.values(chunk_map).forEach(chunk => {
      // spawn mobs
      chunk.spawners.forEach(s => {
        s.tick();
      });

      // 20% chance to select a mob from this chunk to move
      if (Math.random() > 0.8) {
        const mobs = chunk.spawners.reduce((acc, next) => acc.concat(next.spawned.filter(s => s.getType() == "mob")), []);

        // select mobs to move
        if (mobs.length > 0) {
          mobs_to_move.push(mobs[Math.floor(Math.random() * mobs.length)]);
        }
      }
    });

    //
    console.log(mobs_to_move);
  }
}

// manages path finder
// manages chunks
// manages players
