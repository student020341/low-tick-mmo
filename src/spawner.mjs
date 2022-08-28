import {v4 as uuid} from "uuid";
import logger from "./log.mjs";

const logKey = "spawners";

export default class Spawner {
  constructor(entity, spawn_data) {
    // mob or resource class and spawning parameters (ex: higher and lower level chickens)
    this.entity = entity;
    // ticks to respawn, spawn cap, etc
    this.spawn_data = spawn_data;
    this._validate();

    // track ticks per spawner since they have independent limits
    this.tick_count = 0;

    this.spawned = [];

    this.id = uuid();
  }

  tick() {
    this.tick_count++;
    if (this.tick_count >= this.spawn_data.ticks) {
      // tick over whether or not anything happens
      this.tick_count = 0;
      logger.log(logKey, `${this.id} tick`)
      if (this.spawned.length < this.spawn_data.spawn_cap) {
        logger.log(logKey, `${this.id} spawning entity ${this.entity.getType()}/${this.entity.entity.asset}`);
        this.spawned.push(this.entity.clone());
      }
    }
  }

  _validate() {
    if (isNaN(this.spawn_data.spawn_cap) || this.spawn_data.spawn_cap < 1) {
      this.spawn_data.spawn_cap = 1;
    }

    if (isNaN(this.spawn_data.ticks) || this.spawn_data.ticks < 1) {
      this.spawn_data.ticks = 1;
    }
  }
}
