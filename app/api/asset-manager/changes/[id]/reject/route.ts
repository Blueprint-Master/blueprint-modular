import { recordVote } from "../vote";

export function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return recordVote(request, params, false);
}
