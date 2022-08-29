import Spawner from "./spawner.mjs";
import {Mob, Resource, Loot} from "./entity.mjs";
import {v4 as uuid} from "uuid";
import {Paths} from "./paths.mjs";

// chunks are assumed to be 10x10 grid
export default class Chunk {
  /**
   * 
   * @param {string} name 
   * @param {Array<Spawner>} spawners 
   * @param {Array<number>} coordinate 
   * @param {Array<Obstacle>} obstacles 
   */
  constructor(name, spawners, coordinate, obstacles) {
    this.id = uuid();
    
    /** 
     * name of map chunk
     * 
     * @type string
    */
    this.name = name;

    /**
     *  npcs and resource nodes that spawn on this map
     * 
     * @type Array<Spawner>
     */
    this.spawners = spawners;
    this.spawners.forEach(s => {
      s.entity.entity.chunk_id = this.id;
    });

    /**
     *  map width and height, all rectangles for now
     * 
     * @type Array<number>
     */
    this.coordinate = coordinate;

    /**
     *  objects in map that cannot be moved through
     * 
     * @type Array<Obstacle>
     */
    this.obstacles = obstacles;

    this.paths = new Paths(obstacles.map(o => o.position));
  }

  toJSON() {
    return {
      id: this.id,
      coordinate: this.coordinate,
    };
  }
}

export class Obstacle {
  constructor(ref, position) {
    this.ref = ref;
    this.position = position;
  }
}

export const coordsAround = (coord) => {
  return [
    [coord[0]-1, coord[1]-1],
    [coord[0], coord[1]-1],
    [coord[0]+1, coord[1]-1],
    [coord[0]-1, coord[1]],
    [coord[0]+1, coord[1]],
    [coord[0]-1, coord[1]+1],
    [coord[0], coord[1]+1],
    [coord[0]+1, coord[1]+1]
  ];
};

export const defaultChunks = () => {
  const starting_chunk = new Chunk(
    "Starting Area",
    [
      new Spawner(
        new Mob(
          [2, 2], // start in x: 2, y:2 in a sort of grid
          "chicken", // mob asset is "chicken"
          {
            level: 1,
            health: 3,
            loot: [
              // always drop 3-8 feathers
              new Loot("feather", [3, 8], 1),
              // always drop 1 set of bones
              new Loot("bones", [1, 1], 1),
              // 30% chance to drop 2-3 eggs
              new Loot("eggs", [2, 3], 0.3),
              // 40% chance for a possible bonus egg
              new Loot("eggs", [0, 1], 0.4),
            ]
            // TODO attack? range?
          }
        ),
        {
          ticks: 6, // spawn chicken every 3 seconds
          spawn_cap: 2, // at most 2 chickens spawned by this spawner
        }
      ),
      new Spawner(
        new Resource(
          [5, 5],
          "tree",
          {
            level: 1, // skill level needed to harvest
            health: 5, // strikes resource node can survive
            loot: [
              // award 1-2 logs on every strike
              new Loot("logs", [1, 2], 1),
              new Loot("leaf", [0, 3], 0.4),
            ]
          }
        ),
        {
          ticks: 30 // tree respawns in 15 seconds
        }
      )
    ],
    [0, 0], // starting point
    [
      new Obstacle("stump", [5, 5]), // stump for tree resource
      ...[
        [4, 7],
        [5, 7],
        [6, 7],
        [7, 7]
      ].map(arr => new Obstacle("water", arr)) // patches of water above the tree
    ]
  );

  const second_chunk = new Chunk(
    "Area 2",
    [
      new Spawner(
        new Resource(
          [2, 3],
          "iron",
          {
            level: 1,
            health: 3,
            loot: [
              new Loot("iron-ore", [1, 2], 1),
              new Loot("rock", [0, 3], 0.6)
            ]
          }
        ),
        {
          ticks: 20 // resource regenerates at 10 seconds
        }
      )
    ],
    [1, 0], // chunk is to the right of the starting area
    [] // no environmental obstacles in map 2
  );

  const third_chunk = new Chunk(
    "Area 3",
    [
      // lone chicken in area 3, should not send updates for players in the starting area
      new Spawner(
        new Mob(
          [6, 7],
          "chicken",
          {
            level: 1,
            health: 3,
            loot: [
              // TODO make mob loot pools/tables so this doesn't need to be replicated
              new Loot("feather", [3, 8], 1),
              new Loot("bones", [1, 1], 1),
              new Loot("eggs", [1, 3], 0.3),
            ]
          }
        ),
        {
          ticks: 10, // spawn chicken every 5 seconds
          spawn_cap: 1,
        }
      )
    ],
    [2, 0],
    []
  );

  return [
    starting_chunk,
    second_chunk,
    third_chunk
  ];
};
