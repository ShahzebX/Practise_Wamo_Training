// Handles DOM queries, event listeners, and rendering updates.
export class CalculatorUI {
  constructor(handlers) {
    this.handlers = handlers;

    this.expressionInput = document.getElementById("expressionInput");
    this.outputDisplay = document.getElementById("outputDisplay");
    this.keypad = document.getElementById("keypad");

    this.varNameInput = document.getElementById("varNameInput");
    this.varValueInput = document.getElementById("varValueInput");
    this.addVarBtn = document.getElementById("addVarBtn");
    this.variableList = document.getElementById("variableList");

    this.historyList = document.getElementById("historyList");
    this.clearHistoryBtn = document.getElementById("clearHistoryBtn");

    this.bindEvents();
  }

  bindEvents() {
    // Event delegation for keypad buttons
    this.keypad.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button) return;

      const { action, value } = button.dataset;
      if (action === "insert") this.insertText(value);
      else if (action === "clear") this.clearInput();
      else if (action === "backspace") this.backspace();
      else if (action === "calculate") this.triggerCalculate();
    });

    // Evaluate on Enter key inside input
    this.expressionInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        this.triggerCalculate();
      }
    });

    // Add variable button
    this.addVarBtn.addEventListener("click", () => {
      this.handlers.onAddVariable(
        this.varNameInput.value,
        this.varValueInput.value,
      );
    });

    // Event delegation for variable list (delete variable)
    this.variableList.addEventListener("click", (event) => {
      const deleteBtn = event.target.closest("[data-delete-var]");
      if (deleteBtn) {
        event.stopPropagation();
        this.handlers.onDeleteVariable(deleteBtn.dataset.deleteVar);
      }
    });

    // Clear history button
    if (this.clearHistoryBtn) {
      this.clearHistoryBtn.addEventListener("click", () => {
        this.handlers.onClearHistory();
      });
    }

    // Event delegation for history list (select to fill input, or delete item)
    this.historyList.addEventListener("click", (event) => {
      const deleteBtn = event.target.closest("[data-delete-id]");
      if (deleteBtn) {
        event.stopPropagation();
        this.handlers.onDeleteHistory(deleteBtn.dataset.deleteId);
        return;
      }

      const itemEl = event.target.closest("[data-expression]");
      if (itemEl) {
        this.expressionInput.value = itemEl.dataset.expression;
        this.expressionInput.focus();
      }
    });
  }

  insertText(text) {
    const start =
      this.expressionInput.selectionStart ?? this.expressionInput.value.length;
    const end =
      this.expressionInput.selectionEnd ?? this.expressionInput.value.length;
    const current = this.expressionInput.value;

    this.expressionInput.value =
      current.slice(0, start) + text + current.slice(end);
    const newCursor = start + text.length;
    this.expressionInput.setSelectionRange(newCursor, newCursor);
    this.expressionInput.focus();
  }

  clearInput() {
    this.expressionInput.value = "";
    this.outputDisplay.textContent = "0.0000";
    this.outputDisplay.classList.remove("error");
    this.expressionInput.focus();
  }

  backspace() {
    const start =
      this.expressionInput.selectionStart ?? this.expressionInput.value.length;
    const end =
      this.expressionInput.selectionEnd ?? this.expressionInput.value.length;
    const current = this.expressionInput.value;

    if (start !== end) {
      this.expressionInput.value = current.slice(0, start) + current.slice(end);
      this.expressionInput.setSelectionRange(start, start);
    } else if (start > 0) {
      this.expressionInput.value =
        current.slice(0, start - 1) + current.slice(start);
      this.expressionInput.setSelectionRange(start - 1, start - 1);
    }
    this.expressionInput.focus();
  }

  triggerCalculate() {
    this.handlers.onCalculate(this.expressionInput.value);
  }

  showResult(formattedResult) {
    this.outputDisplay.textContent = formattedResult;
    this.outputDisplay.classList.remove("error");
  }

  showError(message) {
    this.outputDisplay.textContent = `Error: ${message}`;
    this.outputDisplay.classList.add("error");
  }

  clearVariableInputs() {
    this.varNameInput.value = "";
    this.varValueInput.value = "";
  }

  renderVariables(variables) {
    this.variableList.innerHTML = "";
    for (const [name, value] of Object.entries(variables)) {
      const li = document.createElement("li");

      const textSpan = document.createElement("span");
      textSpan.textContent = `${name} = ${value}`;

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.textContent = "Delete";
      deleteBtn.dataset.deleteVar = name;

      li.append(textSpan, deleteBtn);
      this.variableList.appendChild(li);
    }
  }

  renderHistory(historyItems) {
    this.historyList.innerHTML = "";
    for (const item of historyItems) {
      const li = document.createElement("li");
      li.dataset.expression = item.expression;

      const textSpan = document.createElement("span");
      textSpan.textContent = `${item.expression} = ${item.result}`;

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.textContent = "Delete";
      deleteBtn.dataset.deleteId = item.id;

      li.append(textSpan, deleteBtn);
      this.historyList.appendChild(li);
    }
  }
}
