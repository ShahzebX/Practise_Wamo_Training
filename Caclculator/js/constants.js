// Immutable configurations

export const CONSTANTS = Object.freeze({
  pi: Math.PI,
  e: Math.E,
});

export const RESERVED_FUNCTIONS = Object.freeze(["sqrt", "sin", "cos", "tan"]);

export const OPERATORS = Object.freeze({
  "+": { precedence: 1, associativity: "left" },
  "-": { precedence: 1, associativity: "left" },
  "*": { precedence: 2, associativity: "left" },
  "/": { precedence: 2, associativity: "left" },
  "^": { precedence: 3, associativity: "right" },
});
