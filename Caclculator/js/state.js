import { CONSTANTS, RESERVED_FUNCTIONS } from "./constants.js";

// Store user variables in a Map or plain object. Before adding a variable, validate that:
export class CalculatorState {
  constructor() {
    this.variables = new Map();
    this.history = [];
  }

  setVariable(name, value) {
    const trimmedName = name.trim().toLowerCase();
    const numericValue = Number(value);

    if (!trimmedName) {
      throw new Error("Variable name cannot be empty.");
    }

    if (Object.prototype.hasOwnProperty.call(CONSTANTS, trimmedName)) {
      throw new Error(`Cannot use reserved constant name "${trimmedName}".`);
    }

    if (RESERVED_FUNCTIONS.includes(trimmedName)) {
      throw new Error(`Cannot use reserved function name "${trimmedName}".`);
    }
    if (Number.isNaN(numericValue)) {
      throw new Error("Variable value must be a valid number.");
    }

    this.variables.set(trimmedName, numericValue);
  }

  getAllVariables() {
    return Object.fromEntries(this.variables);
  }

  removeVariable(name) {
    return this.variables.delete(name.trim().toLowerCase());
  }

  addHistory(expression, result) {
    const historyItem = {
      id: crypto.randomUUID(),
      expression: expression.trim(),
      result: result,
    };

    this.history.unshift(historyItem);
    return historyItem;
  }

  removeHistory(id) {
    this.history = this.history.filter((item) => item.id !== id);
  }

  clearHistory() {
    this.history = [];
  }

  getHistory() {
    return this.history;
  }
}
