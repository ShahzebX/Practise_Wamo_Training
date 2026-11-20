import { CalculatorState } from "./state.js";
import { evaluateExpression, CalculatorError } from "./parser.js";
import { CalculatorUI } from "./ui.js";

const state = new CalculatorState();

const calculatorUI = new CalculatorUI({
  onCalculate(expression) {
    try {
      const result = evaluateExpression(expression, state.getAllVariables());
      const formattedResult = result.toFixed(4);

      calculatorUI.showResult(formattedResult);
      state.addHistory(expression, formattedResult);
      calculatorUI.renderHistory(state.getHistory());
    } catch (error) {
      const message =
        error instanceof CalculatorError
          ? error.message
          : "Unexpected calculation error.";
      calculatorUI.showError(message);
    }
  },

  onAddVariable(name, value) {
    try {
      state.setVariable(name, value);
      calculatorUI.clearVariableInputs();
      calculatorUI.renderVariables(state.getAllVariables());
    } catch (error) {
      calculatorUI.showError(error.message);
    }
  },

  onDeleteHistory(id) {
    state.removeHistory(id);
    calculatorUI.renderHistory(state.getHistory());
  },

  onDeleteVariable(name) {
    state.removeVariable(name);
    calculatorUI.renderVariables(state.getAllVariables());
  },

  onClearHistory() {
    state.clearHistory();
    calculatorUI.renderHistory(state.getHistory());
  },
});
