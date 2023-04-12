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
  expression = expression.replace(/\*\*/g, "^"); // Replace ** with ^

  const operatorPrecedence = {
    "+": 1,
    "-": 1,
    "*": 2,
    "/": 2,
    "^": 3,
  };

  const tokens = expression.match(/\d+(?:\.\d+)?(?:e[+-]?\d+)?|[+\-*/()^]/gi);
  const outputQueue = [];
  const operatorStack = [];

  for (const token of tokens) {
    if (/\d+(?:\.\d+)?(?:e[+-]?\d+)?/i.test(token)) {
      outputQueue.push(parseExponentialToBigInt(token));
    } else if (/[+\-*/^]/.test(token)) {
      while (
        operatorStack.length > 0 &&
        /[+\-*/^]/.test(operatorStack[operatorStack.length - 1]) &&
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
    if (/\d+(?:\.\d+)?(?:e[+-]?\d+)?/i.test(token)) {
      evaluationStack.push(BigInt(token));
    } else if (/[+\-*/^]/.test(token)) {
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
        case "^":
          evaluationStack.push(a ** b);
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

function parseExponentialToBigInt(numString) {
  const [significand, exponent] = numString.toLowerCase().split("e");
  let [integerPart, decimalPart = ""] = significand.split(".");
  const exp = parseInt(exponent, 10);

  if (exp >= 0) {
    return BigInt(
      integerPart + decimalPart + "0".repeat(exp - decimalPart.length)
    );
  } else {
    const decimalDigits = -exp - 1;
    const shiftedIntegerPart = integerPart.slice(0, -decimalDigits) || "0";
    const shiftedDecimalPart = integerPart.slice(-decimalDigits) + decimalPart;
    return BigInt(shiftedIntegerPart + shiftedDecimalPart);
  }
}
