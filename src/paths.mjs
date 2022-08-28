class GridPoint {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.neighbors = [];
    this.parent = null;
    this.solid = false; // cannot move over this space
  }

  updateNeighbors(grid) {
    // TODO diagonal?
    const {x, y} = this;
    if (this.solid) {
      return;
    }

    let right = null;
    if (x < grid.length - 1) {
      right = grid[x+1][y];
    }

    let left = null;
    if (x > 0) {
      left = grid[x-1][y];
    }

    let top = null;
    if (y < grid[x].length - 1) {
      top = grid[x][y + 1];
    }

    let bottom = null;
    if (y > 0) {
      bottom = grid[x][y - 1];
    }

    [right, left, top, bottom].forEach(d => {
      if (d && !d.solid) {
        this.neighbors.push(d);
      }
    });
  }
}

class Paths {
  constructor(obstacles=[]) {

    /** @type Array<Array<GridPoint>> */
    this.grid = new Array(10);
    for (let x = 0;x < 10;x++) {
      this.grid[x] = new Array(10);
      for (let y = 0;y < 10;y++) {
        this.grid[x][y] = new GridPoint(x, y);
        const obstacle = obstacles.some(([o_x, o_y]) => o_x == x && o_y == y);
        if (obstacle) {
          this.grid[x][y].solid = true;
        }
      }
    }

    for (let x = 0;x < 10;x++) {
      for (let y = 0;y < 10;y++) {
        this.grid[x][y].updateNeighbors(this.grid);
      }
    }
  }

  heuristic(a, b) {
    return Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
  }

  search(start, end) {

    const start_node = this.grid[start[0]][start[1]];
    const end_node = this.grid[end[0]][end[1]];

    const open_set = [start_node];
    const closed_set = [];
    const path = [];

    while(open_set.length > 0) {
      //
      let low = 0;
      for (let i = 0;i < open_set.length;i++) {
        if (open_set[i].f < open_set[low].f) {
          low = i;
        }
      }

      let current = open_set[low];

      //
      if (current == end_node) {
        let tmp = current;
        path.push(tmp);
        while(tmp.parent) {
          path.push(tmp.parent);
          tmp = tmp.parent;
        }
        return path.reverse().map(n => `${n.x}, ${n.y}`);
      }

      //
      open_set.splice(low, 1);
      closed_set.push(current);
      let neighbors = current.neighbors;
      for (let i = 0;i < neighbors.length;i++) {
        let neighbor = neighbors[i];
        if (!closed_set.includes(neighbor)) {
          let possibleG = current.g + 1;
          if (!open_set.includes(neighbor)) {
            open_set.push(neighbor);
          } else if (possibleG >= neighbor.g) {
            continue;
          }

          neighbor.g = possibleG;
          neighbor.h = this.heuristic(neighbor, end);
          neighbor.f = neighbor.g + neighbor.h;
          neighbor.parent = current;
        }
      }
    }

    return null; // no path
  }
}

const foop = new Paths([
  [3, 1]
]);
console.log(foop.search([1, 1], [5, 1]));
