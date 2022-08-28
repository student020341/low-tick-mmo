
class Logger {
  constructor(arr) {
    this.filter = new Set(arr);
  }

  log(key, ...args) {
    if (this.filter.has(key)) {
      console.log(...args);
    }
  }
}

const logger = new Logger([
  // logs here
]);
export default logger;
