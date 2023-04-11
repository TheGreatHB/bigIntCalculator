let result; // Declare the result variable

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    window.close();
  }
});
document
  .getElementById("inputExpression")
  .addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      calculate();
    }
  });
document.getElementById("copyResult").addEventListener("click", () => {
  if (result !== undefined) {
    navigator.clipboard.writeText(result);
  }
});

function calculate() {
  const inputExpression = document
    .getElementById("inputExpression")
    .value.trim();
  try {
    result = evaluateExpression(inputExpression); // Save the result
    document.getElementById("result").innerText = `${result}`;
  } catch (error) {
    document.getElementById("result").innerText = "Invalid expression";
  }
}

function evaluateExpression(expression) {
  const operatorPrecedence = {
    "+": 1,
    "-": 1,
    "*": 2,
    "/": 2,
  };

  const tokens = expression.match(/\d+|[+\-*/()]/g);
  const outputQueue = [];
  const operatorStack = [];

  for (const token of tokens) {
    if (/\d+/.test(token)) {
      outputQueue.push(token);
    } else if (/[+\-*/]/.test(token)) {
      while (
        operatorStack.length > 0 &&
        /[+\-*/]/.test(operatorStack[operatorStack.length - 1]) &&
        operatorPrecedence[token] <=
          operatorPrecedence[operatorStack[operatorStack.length - 1]]
      ) {
        outputQueue.push(operatorStack.pop());
      }
      operatorStack.push(token);
    } else if (token === "(") {
      operatorStack.push(token);
    } else if (token === ")") {
      while (
        operatorStack.length > 0 &&
        operatorStack[operatorStack.length - 1] !== "("
      ) {
        outputQueue.push(operatorStack.pop());
      }
      if (operatorStack[operatorStack.length - 1] === "(") {
        operatorStack.pop();
      } else {
        throw new Error("Invalid expression");
      }
    }
  }

  while (operatorStack.length > 0) {
    outputQueue.push(operatorStack.pop());
  }

  const evaluationStack = [];

  for (const token of outputQueue) {
    if (/\d+/.test(token)) {
      evaluationStack.push(BigInt(token));
    } else if (/[+\-*/]/.test(token)) {
      const b = evaluationStack.pop();
      const a = evaluationStack.pop();

      switch (token) {
        case "+":
          evaluationStack.push(a + b);
          break;
        case "-":
          evaluationStack.push(a - b);
          break;
        case "*":
          evaluationStack.push(a * b);
          break;
        case "/":
          evaluationStack.push(a / b);
          break;
      }
    }
  }

  if (evaluationStack.length === 1) {
    return evaluationStack[0].toString();
  } else {
    throw new Error("Invalid expression");
  }
}
