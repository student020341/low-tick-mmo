import {v4 as uuid} from "uuid";

class Entity {
  constructor(position, asset) {
        // x/y representing current grid coordinate
        this.position = position;
        // TODO make some kind of asset database where chicken means something
        // resource name (ex: "chicken")
        this.asset = asset;
        this.id = uuid();
        // id of owning chunk
        /** @type string */
        this.chunk_id = null;
  }

  toJSON() {
    return {
      id: this.id,
      position: this.position,
      asset: this.asset
    };
  }
}

export class Resource {
  constructor(position, asset, info) {
    this.entity = new Entity(position, asset);

    // resource info, ex: materials and quantities yielded
    this.info = info;
  }

  getType() {
    return "resource";
  }

  clone() {
    const e = new Resource(this.entity.position, this.entity.asset, this.info);
    e.entity.chunk_id = this.entity.chunk_id;
    return e;
  }

  toJSON() {
    return {
      entity: this.entity,
      info: this.info,
      type: this.getType()
    };
  }
}

export class Mob {
  constructor(position, asset, info) {
    this.entity = new Entity(position, asset);

    // mob info, ex: loot and stats
    this.info = info;

    // points to move towards each tick
    this.path = [];
  }

  getType() {
    return "mob";
  }

  clone() {
    const e = new Mob(this.entity.position, this.entity.asset, this.info);
    e.entity.chunk_id = this.entity.chunk_id;
    return e;
  }

  toJSON() {
    return {
      entity: this.entity,
      info: {
        level: this.info.level,
        health: this.info.health
      },
      path: this.path,
      type: this.getType()
    }
  }
}

export class Loot {
  constructor(ref, quantity, chance) {
    this.ref = ref;
    this.quantity = quantity;
    this.chance = chance;
  }
}
