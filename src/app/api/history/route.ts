import { NextRequest, NextResponse } from "next/server";
import { addHistory, clearHistory, getHistory } from "@/lib/historyStore";

export async function GET() {
  return NextResponse.json({ history: getHistory() });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    expression?: string;
    result?: string;
  };

  if (!body.expression || !body.result) {
    return NextResponse.json(
      { error: "Both expression and result are required." },
      { status: 400 },
    );
  }

  return NextResponse.json({ history: addHistory(body.expression, body.result) });
}

export async function DELETE() {
  clearHistory();
  return NextResponse.json({ history: [] });
}
