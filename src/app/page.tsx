"use client";

import { useEffect, useMemo, useState } from "react";
import { evaluateExpression, formatNumber } from "@/lib/evaluator";
import type { HistoryItem } from "@/lib/historyStore";

type Key =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "."
  | "+"
  | "-"
  | "×"
  | "÷"
  | "%"
  | "C"
  | "⌫"
  | "+/-"
  | "="
  | "("
  | ")";

const BUTTONS: Key[] = [
  "C",
  "⌫",
  "%",
  "÷",
  "7",
  "8",
  "9",
  "×",
  "4",
  "5",
  "6",
  "-",
  "1",
  "2",
  "3",
  "+",
  "+/-",
  "0",
  ".",
  "=",
];

const OPERATOR_SET = new Set(["+", "-", "×", "÷", "%"]);

const normalizeForEval = (value: string): string =>
  value.replace(/×/g, "*").replace(/÷/g, "/");

export default function Home() {
  const [expression, setExpression] = useState("");
  const [currentValue, setCurrentValue] = useState("0");
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const updateDisplay = (nextExpression: string) => {
    setExpression(nextExpression);

    if (!nextExpression) {
      setCurrentValue("0");
      return;
    }

    const parts = nextExpression.split(/[+\-×÷%()]/).filter(Boolean);
    setCurrentValue(parts[parts.length - 1] ?? "0");
  };

  const loadHistory = async () => {
    try {
      const response = await fetch("/api/history");
      const payload = (await response.json()) as { history: HistoryItem[] };
      setHistory(payload.history ?? []);
    } catch {
      setHistory([]);
    }
  };

  useEffect(() => {
    void loadHistory();
  }, []);

  const appendNumber = (value: string) => {
    const activeChunk = expression.split(/[+\-×÷%()]/).pop() ?? "";
    if (value === "." && activeChunk.includes(".")) {
      return;
    }

    if (lastResult !== null && !OPERATOR_SET.has(expression.slice(-1))) {
      updateDisplay(value === "." ? "0." : value);
      setLastResult(null);
      return;
    }

    if (value === "." && (activeChunk === "" || activeChunk === "-")) {
      updateDisplay(`${expression}0.`);
      return;
    }

    updateDisplay(`${expression}${value}`);
  };

  const appendOperator = (operator: string) => {
    if (!expression && operator !== "-") {
      return;
    }

    const lastChar = expression.slice(-1);
    if (OPERATOR_SET.has(lastChar)) {
      updateDisplay(`${expression.slice(0, -1)}${operator}`);
      return;
    }

    updateDisplay(`${expression}${operator}`);
    setLastResult(null);
  };

  const toggleSign = () => {
    if (!expression) {
      updateDisplay("-");
      return;
    }

    const match = expression.match(/(-?\d*\.?\d+)$/);
    if (!match) {
      updateDisplay(`${expression}-`);
      return;
    }

    const value = match[1];
    const replacement = value.startsWith("-") ? value.slice(1) : `-${value}`;
    updateDisplay(`${expression.slice(0, -value.length)}${replacement}`);
  };

  const clearAll = () => {
    setExpression("");
    setCurrentValue("0");
    setLastResult(null);
  };

  const backspace = () => {
    updateDisplay(expression.slice(0, -1));
  };

  const evaluateCurrent = async () => {
    if (!expression) {
      return;
    }

    try {
      const result = formatNumber(evaluateExpression(normalizeForEval(expression)));
      setLastResult(result);
      setCurrentValue(result);

      await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expression, result }),
      });

      await loadHistory();
      updateDisplay(result);
    } catch {
      setCurrentValue("Error");
      setLastResult(null);
    }
  };

  const onPress = async (key: Key) => {
    if (/\d|\./.test(key)) {
      appendNumber(key);
      return;
    }

    if (OPERATOR_SET.has(key)) {
      appendOperator(key);
      return;
    }

    if (key === "C") {
      clearAll();
      return;
    }

    if (key === "⌫") {
      backspace();
      return;
    }

    if (key === "+/-") {
      toggleSign();
      return;
    }

    if (key === "=") {
      await evaluateCurrent();
    }
  };

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (/\d/.test(event.key)) {
        void onPress(event.key as Key);
      } else if (event.key === ".") {
        void onPress(".");
      } else if (event.key === "+") {
        void onPress("+");
      } else if (event.key === "-") {
        void onPress("-");
      } else if (event.key === "*") {
        void onPress("×");
      } else if (event.key === "/") {
        event.preventDefault();
        void onPress("÷");
      } else if (event.key === "%") {
        void onPress("%");
      } else if (event.key === "Enter" || event.key === "=") {
        event.preventDefault();
        void onPress("=");
      } else if (event.key === "Backspace") {
        void onPress("⌫");
      } else if (event.key.toLowerCase() === "c" || event.key === "Escape") {
        void onPress("C");
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const expressionDisplay = useMemo(
    () => expression || (lastResult ? `Ans = ${lastResult}` : "0"),
    [expression, lastResult],
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 p-4 md:flex-row md:p-8">
      <section className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-2xl md:w-2/3">
        <h1 className="mb-4 text-2xl font-semibold">Vibe Calculator</h1>
        <div className="mb-4 rounded-xl bg-slate-950 p-4 text-right">
          <p className="truncate text-sm text-slate-400">{expressionDisplay}</p>
          <p className="text-4xl font-bold tracking-tight">{currentValue}</p>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {BUTTONS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => void onPress(key)}
              className="rounded-xl border border-slate-700 bg-slate-800 py-3 text-lg font-medium transition hover:bg-slate-700 active:scale-95"
            >
              {key}
            </button>
          ))}
        </div>
      </section>

      <aside className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 p-4 md:w-1/3">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">History</h2>
          <button
            type="button"
            onClick={async () => {
              await fetch("/api/history", { method: "DELETE" });
              await loadHistory();
            }}
            className="rounded-md border border-slate-700 px-3 py-1 text-sm hover:bg-slate-800"
          >
            Clear history
          </button>
        </div>

        <ul className="space-y-2">
          {history.length === 0 ? (
            <li className="text-sm text-slate-500">No calculations yet.</li>
          ) : (
            history.map((entry) => (
              <li
                key={`${entry.timestamp}-${entry.expression}`}
                className="rounded-lg bg-slate-950 p-3"
              >
                <p className="text-sm text-slate-300">{entry.expression}</p>
                <p className="font-semibold text-cyan-400">= {entry.result}</p>
              </li>
            ))
          )}
        </ul>
      </aside>
    </main>
  );
}
