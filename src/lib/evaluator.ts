const OPERATORS = new Set(["+", "-", "*", "/", "%"]);

function precedence(operator: string): number {
  switch (operator) {
    case "+":
    case "-":
      return 1;
    case "*":
    case "/":
    case "%":
      return 2;
    default:
      return 0;
  }
}

function applyOperator(operator: string, left: number, right: number): number {
  switch (operator) {
    case "+":
      return left + right;
    case "-":
      return left - right;
    case "*":
      return left * right;
    case "/":
      if (right === 0) {
        throw new Error("Cannot divide by zero");
      }
      return left / right;
    case "%":
      if (right === 0) {
        throw new Error("Cannot modulo by zero");
      }
      return left % right;
    default:
      throw new Error(`Unsupported operator: ${operator}`);
  }
}

function tokenize(expression: string): string[] {
  const cleaned = expression.replace(/×/g, "*").replace(/÷/g, "/").replace(/\s+/g, "");
  if (!cleaned) {
    throw new Error("Expression is empty");
  }

  const tokens: string[] = [];
  let current = "";

  for (let i = 0; i < cleaned.length; i += 1) {
    const char = cleaned[i];
    const prev = cleaned[i - 1];

    if (/\d|\./.test(char)) {
      current += char;
      continue;
    }

    if (char === "(" || char === ")") {
      if (current) {
        tokens.push(current);
        current = "";
      }
      tokens.push(char);
      continue;
    }

    if (OPERATORS.has(char)) {
      const unaryMinus =
        char === "-" &&
        (i === 0 || OPERATORS.has(prev) || prev === "(");
      if (unaryMinus) {
        current += char;
        continue;
      }

      if (current) {
        tokens.push(current);
        current = "";
      }
      tokens.push(char);
      continue;
    }

    throw new Error(`Invalid character: ${char}`);
  }

  if (current) {
    tokens.push(current);
  }

  return tokens;
}

export function evaluateExpression(expression: string): number {
  const tokens = tokenize(expression);
  const values: number[] = [];
  const operators: string[] = [];

  const reduceTop = () => {
    const operator = operators.pop();
    const right = values.pop();
    const left = values.pop();

    if (operator === undefined || right === undefined || left === undefined) {
      throw new Error("Invalid expression");
    }

    values.push(applyOperator(operator, left, right));
  };

  for (const token of tokens) {
    if (!Number.isNaN(Number(token))) {
      values.push(Number(token));
      continue;
    }

    if (token === "(") {
      operators.push(token);
      continue;
    }

    if (token === ")") {
      while (operators.length && operators[operators.length - 1] !== "(") {
        reduceTop();
      }
      if (operators.pop() !== "(") {
        throw new Error("Mismatched parentheses");
      }
      continue;
    }

    while (
      operators.length &&
      operators[operators.length - 1] !== "(" &&
      precedence(operators[operators.length - 1]) >= precedence(token)
    ) {
      reduceTop();
    }
    operators.push(token);
  }

  while (operators.length) {
    if (operators[operators.length - 1] === "(") {
      throw new Error("Mismatched parentheses");
    }
    reduceTop();
  }

  if (values.length !== 1) {
    throw new Error("Invalid expression");
  }

  return values[0];
}

export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return "Error";
  }
  const rounded = Math.round((value + Number.EPSILON) * 1e10) / 1e10;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}
