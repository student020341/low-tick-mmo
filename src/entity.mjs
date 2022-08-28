import {v4 as uuid} from "uuid";

class Entity {
  constructor(position, asset) {
        // x/y representing current grid coordinate
        this.position = position;
        // TODO make some kind of asset database where chicken means something
        // resource name (ex: "chicken")
        this.asset = asset;
        this.id = uuid();
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
    return new Resource(this.entity.position, this.entity.asset, this.info);
  }
}

export class Mob {
  constructor(position, asset, info) {
    this.entity = new Entity(position, asset);

    // mob info, ex: loot and stats
    this.info = info;
  }

  getType() {
    return "mob";
  }

  clone() {
    return new Mob(this.entity.position, this.entity.asset, this.info);
  }
}

export class Loot {
  constructor(ref, quantity, chance) {
    this.ref = ref;
    this.quantity = quantity;
    this.chance = chance;
  }
}
