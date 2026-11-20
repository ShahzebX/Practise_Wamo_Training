import { CONSTANTS, RESERVED_FUNCTIONS, OPERATORS } from "./constants.js";

export class CalculatorError extends Error {
  constructor(message) {
    super(message);
    this.name = "CalculatorError";
  }
}

/**
 * Entry point.
 *
 * @param {string} expression
 * @param {Object} userVariables
 * @returns {number}
 */

export function evaluateExpression(expression, userVariables = {}) {
  if (typeof expression !== "string" || !expression.trim()) {
    throw new CalculatorError("Expression can't be empty!");
  }

  const trimmed = expression.trim();

  const CONTEXT = {
    ...CONSTANTS,
    ...userVariables,
  };

  const tokens = tokenize(trimmed, CONTEXT);

  const rpnQueue = shuntingYard(tokens);

  const result = evaluateRPN(rpnQueue);

  return result;
}

/**
 * Checks whether the previous token implies implicit multiplication
 * with the upcoming token. True when the previous token produces a
 * value (NUMBER or closing RPAREN).
 */
function requiresImplicitMultiplication(prevToken) {
  return (
    prevToken &&
    (prevToken.type === "NUMBER" || prevToken.type === "RPAREN")
  );
}

function tokenize(expr, context) {
  const tokens = [];
  let i = 0;

  while (i < expr.length) {
    const char = expr[i];

    // Skip whitespace
    if (/\s/.test(char)) {
      i++;
      continue;
    }

    // Numbers including decimals
    if (/[0-9.]/.test(char)) {
      let numStr = "";
      while (i < expr.length && /[0-9.]/.test(expr[i])) {
        numStr += expr[i];
        i++;
      }
      const parsed = Number(numStr);
      if (Number.isNaN(parsed)) {
        throw new CalculatorError(`Invalid number format: "${numStr}"`);
      }
      if (requiresImplicitMultiplication(tokens[tokens.length - 1])) {
        tokens.push({ type: "OPERATOR", value: "*" });
      }
      tokens.push({ type: "NUMBER", value: parsed });
      continue;
    }

    if (/[a-zA-Z_]/.test(char)) {
      let identifierStr = "";
      while (i < expr.length && /[a-zA-Z0-9_]/.test(expr[i])) {
        identifierStr += expr[i];
        i++;
      }
      const lower = identifierStr.toLowerCase();

      if (RESERVED_FUNCTIONS.includes(lower)) {
        if (requiresImplicitMultiplication(tokens[tokens.length - 1])) {
          tokens.push({ type: "OPERATOR", value: "*" });
        }
        tokens.push({ type: "FUNCTION", value: lower });
      } else if (Object.prototype.hasOwnProperty.call(context, lower)) {
        if (requiresImplicitMultiplication(tokens[tokens.length - 1])) {
          tokens.push({ type: "OPERATOR", value: "*" });
        }
        tokens.push({ type: "NUMBER", value: context[lower] });
      } else {
        throw new CalculatorError(`Unknown identifier: "${identifierStr}"`);
      }
      continue;
    }

    if (["+", "-", "*", "/", "^", "(", ")"].includes(char)) {
      if (char === "-") {
        const prev = tokens[tokens.length - 1];
        const isUnary =
          !prev ||
          prev.type === "OPERATOR" ||
          prev.type === "LPAREN" ||
          prev.type === "FUNCTION";
        if (isUnary) {
          tokens.push({ type: "NUMBER", value: 0 });
        }
      }

      if (char === "(") {
        if (requiresImplicitMultiplication(tokens[tokens.length - 1])) {
          tokens.push({ type: "OPERATOR", value: "*" });
        }
        tokens.push({ type: "LPAREN", value: char });
      } else if (char === ")") tokens.push({ type: "RPAREN", value: char });
      else tokens.push({ type: "OPERATOR", value: char });

      i++;
      continue;
    }

    throw new CalculatorError(`Invalid character: "${char}"`);
  }

  return tokens;
}

function shuntingYard(tokens) {
  const outputQueue = [];
  const operatorStack = [];

  for (const token of tokens) {
    if (token.type === "NUMBER") {
      outputQueue.push(token);
    } else if (token.type === "FUNCTION") {
      operatorStack.push(token);
    } else if (token.type === "OPERATOR") {
      const o1 = token.value;
      while (operatorStack.length > 0) {
        const top = operatorStack[operatorStack.length - 1];
        if (
          top.type === "FUNCTION" ||
          (top.type === "OPERATOR" &&
            ((OPERATORS[o1].associativity === "left" &&
              OPERATORS[o1].precedence <= OPERATORS[top.value].precedence) ||
              (OPERATORS[o1].associativity === "right" &&
                OPERATORS[o1].precedence < OPERATORS[top.value].precedence)))
        ) {
          outputQueue.push(operatorStack.pop());
        } else {
          break;
        }
      }
      operatorStack.push(token);
    } else if (token.type === "LPAREN") {
      operatorStack.push(token);
    } else if (token.type === "RPAREN") {
      let foundLparen = false;
      while (operatorStack.length > 0) {
        const top = operatorStack.pop();
        if (top.type === "LPAREN") {
          foundLparen = true;
          break;
        }
        outputQueue.push(top);
      }
      if (!foundLparen) {
        throw new CalculatorError("Mismatched parentheses.");
      }
      if (
        operatorStack.length > 0 &&
        operatorStack[operatorStack.length - 1].type === "FUNCTION"
      ) {
        outputQueue.push(operatorStack.pop());
      }
    }
  }

  while (operatorStack.length > 0) {
    const top = operatorStack.pop();
    if (top.type === "LPAREN" || top.type === "RPAREN") {
      throw new CalculatorError("Mismatched parentheses.");
    }
    outputQueue.push(top);
  }

  return outputQueue;
}

function evaluateRPN(rpnQueue) {
  const stack = [];

  for (const token of rpnQueue) {
    if (token.type === "NUMBER") {
      stack.push(token.value);
    } else if (token.type === "OPERATOR") {
      if (stack.length < 2)
        throw new CalculatorError("Invalid expression syntax.");
      const b = stack.pop();
      const a = stack.pop();

      switch (token.value) {
        case "+":
          stack.push(a + b);
          break;
        case "-":
          stack.push(a - b);
          break;
        case "*":
          stack.push(a * b);
          break;
        case "/":
          if (b === 0) throw new CalculatorError("Division by zero.");
          stack.push(a / b);
          break;
        case "^":
          stack.push(a ** b);
          break;
        default:
          throw new CalculatorError(`Unknown operator: "${token.value}"`);
      }
    } else if (token.type === "FUNCTION") {
      if (stack.length < 1)
        throw new CalculatorError("Invalid function syntax.");
      const arg = stack.pop();

      switch (token.value) {
        case "sqrt":
          if (arg < 0)
            throw new CalculatorError("Square root of negative number.");
          stack.push(Math.sqrt(arg));
          break;
        case "sin":
          stack.push(Math.sin(arg));
          break;
        case "cos":
          stack.push(Math.cos(arg));
          break;
        case "tan":
          stack.push(Math.tan(arg));
          break;
        default:
          throw new CalculatorError(`Unknown function: "${token.value}"`);
      }
    }
  }

  if (stack.length !== 1) {
    throw new CalculatorError("Invalid expression structure.");
  }

  return stack[0];
}
