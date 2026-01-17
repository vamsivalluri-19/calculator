const display = document.getElementById("display");
const buttons = document.querySelectorAll(".btn");
const themeToggle = document.getElementById("themeToggle");
const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistory");

let currentInput = "0";
let previousValue = null;
let currentOperator = null;
let shouldResetInput = false;

// Memory value for MC/MR/M+/M-
let memoryValue = 0;

// In-memory history
let history = [];

/* ---------- Event wiring ---------- */

// Buttons
for (let i = 0; i < buttons.length; i++) {
  buttons[i].addEventListener("click", handleButtonClick);
}

// Keyboard
document.addEventListener("keydown", handleKeyDown);

// Theme toggle
themeToggle.addEventListener("click", toggleTheme);

// Clear history
clearHistoryBtn.addEventListener("click", () => {
  history = [];
  renderHistory();
});

/* ---------- Button handlers ---------- */

function handleButtonClick(e) {
  const btn = e.target;

  if (btn.classList.contains("number") || btn.classList.contains("dot")) {
    handleNumber(btn.getAttribute("data-num"));
  } else if (btn.classList.contains("operator")) {
    handleOperator(btn.getAttribute("data-op"));
  } else if (btn.classList.contains("equal")) {
    handleEquals();
  } else if (btn.classList.contains("clear")) {
    handleClear();
  } else if (btn.classList.contains("backspace")) {
    handleBackspace();
  } else if (btn.classList.contains("percent")) {
    handlePercent();
  } else if (btn.classList.contains("mem")) {
    handleMemory(btn.getAttribute("data-mem"));
  }
}

function handleKeyDown(e) {
  const key = e.key;

  if (key >= "0" && key <= "9") {
    handleNumber(key);
  } else if (key === ".") {
    handleNumber(".");
  } else if (key === "+" || key === "-" || key === "*" || key === "/") {
    handleOperator(key);
  } else if (key === "Enter" || key === "=") {
    e.preventDefault();
    handleEquals();
  } else if (key === "Escape") {
    handleClear();
  } else if (key === "Backspace") {
    handleBackspace();
  } else if (key === "%") {
    handlePercent();
  }
}

/* ---------- Core calculator logic ---------- */

function handleNumber(num) {
  // Prevent multiple dots
  if (num === "." && currentInput.includes(".")) return;

  if (currentInput === "0" || shouldResetInput || currentInput === "Error") {
    currentInput = num === "." ? "0." : num;
    shouldResetInput = false;
  } else {
    currentInput += num;
  }
  updateDisplay();
}

function handleOperator(op) {
  if (currentOperator !== null && !shouldResetInput) {
    calculate();
  } else {
    previousValue = parseFloat(currentInput);
  }
  currentOperator = op;
  shouldResetInput = true;
}

function handleEquals() {
  if (currentOperator === null) return;

  const prev = previousValue;
  const curr = parseFloat(currentInput);
  const op = currentOperator;

  calculate();

  if (currentInput !== "Error") {
    const expression = `${prev} ${op} ${curr} = ${currentInput}`;
    history.push(expression);
    renderHistory();
  }

  currentOperator = null;
}

function handleClear() {
  currentInput = "0";
  previousValue = null;
  currentOperator = null;
  shouldResetInput = false;
  updateDisplay();
}

function handleBackspace() {
  if (shouldResetInput || currentInput === "Error") return;

  if (currentInput.length <= 1) {
    currentInput = "0";
  } else {
    currentInput = currentInput.slice(0, -1);
  }
  updateDisplay();
}

function handlePercent() {
  const value = parseFloat(currentInput);
  if (isNaN(value)) return;
  currentInput = String(value / 100);
  updateDisplay();
}

function calculate() {
  const currentValue = parseFloat(currentInput);
  let result = previousValue;

  if (currentOperator === "+") {
    result = previousValue + currentValue;
  } else if (currentOperator === "-") {
    result = previousValue - currentValue;
  } else if (currentOperator === "*") {
    result = previousValue * currentValue;
  } else if (currentOperator === "/") {
    if (currentValue === 0) {
      currentInput = "Error";
      updateDisplay();
      previousValue = null;
      shouldResetInput = true;
      return;
    }
    result = previousValue / currentValue;
  }

  currentInput = String(result);
  previousValue = result;
  shouldResetInput = true;
  updateDisplay();
}

/* ---------- Memory: MC, MR, M+, M- ---------- */

function handleMemory(action) {
  const val = parseFloat(currentInput);
  if (isNaN(val) && action !== "MR" && action !== "MC") return;

  if (action === "MC") {
    memoryValue = 0;
  } else if (action === "MR") {
    currentInput = String(memoryValue);
    shouldResetInput = true;
    updateDisplay();
  } else if (action === "M+") {
    memoryValue += val;
  } else if (action === "M-") {
    memoryValue -= val;
  }
}

/* ---------- Theme & history UI ---------- */

function toggleTheme() {
  const body = document.body;
  const isDark = body.classList.contains("dark");

  if (isDark) {
    body.classList.remove("dark");
    body.classList.add("light");
    themeToggle.textContent = "Dark";
  } else {
    body.classList.remove("light");
    body.classList.add("dark");
    themeToggle.textContent = "Light";
  }
}

function renderHistory() {
  historyList.innerHTML = "";

  for (let i = 0; i < history.length; i++) {
    const item = document.createElement("div");
    item.className = "history-item";
    item.textContent = history[i];

    item.addEventListener("click", () => {
      const parts = history[i].split("=");
      const result = parts[1].trim();
      currentInput = result;
      shouldResetInput = true;
      updateDisplay();
    });

    historyList.appendChild(item);
  }
}

/* ---------- Display ---------- */

function updateDisplay() {
  display.textContent = currentInput;
}
