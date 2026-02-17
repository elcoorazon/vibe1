export type HistoryItem = {
  expression: string;
  result: string;
  timestamp: string;
};

const LIMIT = 20;
let history: HistoryItem[] = [];

export function addHistory(expression: string, result: string): HistoryItem[] {
  const record: HistoryItem = {
    expression,
    result,
    timestamp: new Date().toISOString(),
  };
  history = [record, ...history].slice(0, LIMIT);
  return history;
}

export function getHistory(): HistoryItem[] {
  return history;
}

export function clearHistory(): void {
  history = [];
}
