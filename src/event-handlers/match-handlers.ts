import { near, JSONValue, TypedMap, BigInt } from "@graphprotocol/graph-ts";
import { Match } from "../../generated/schema";

export function handleCreateMatch(
  method: string,
  event: string,
  data: TypedMap<string, JSONValue>,
  receipt: near.ReceiptWithOutcome,
): void {
  let new_match = new Match(data.get("match_id")!.toString());
  new_match.game = data.get("game")!.toString();

  // Convert DD/MM/YYYY to Unix timestamp
  const dateStr = data.get("date")!.toString();
  new_match.date_string = dateStr; // Store the original date string

  const parts = dateStr.split("/");
  const day = parseInt(parts[0]) as i32;
  const month = parseInt(parts[1]) as i32;
  const year = parseInt(parts[2]) as i32;

  // Calculate Unix timestamp (seconds since epoch)
  const timestamp = BigInt.fromI32(
    (year - 1970) * 31536000 + month * 2592000 + day * 86400,
  );

  new_match.date_timestamp = timestamp; // Renamed from date to date_timestamp
  new_match.team_1 = data.get("team_1")!.toString();
  new_match.team_2 = data.get("team_2")!.toString();
  new_match.team_1_total_bets = BigInt.fromString(
    data.get("team_1_initial_pool")!.toString(),
  );
  new_match.team_2_total_bets = BigInt.fromString(
    data.get("team_2_initial_pool")!.toString(),
  );
  new_match.match_state = "Future";
  new_match.winner = null;
  new_match.created_at = BigInt.fromU64(receipt.block.header.timestampNanosec);
  new_match.save();
}

export function handleEndBetting(
  method: string,
  event: string,
  data: TypedMap<string, JSONValue>,
  receipt: near.ReceiptWithOutcome,
): void {
  let match = Match.load(data.get("match_id")!.toString());
  if (match) {
    match.match_state = "Current";
    match.save();
  }
}

export function handleFinishMatch(
  method: string,
  event: string,
  data: TypedMap<string, JSONValue>,
  receipt: near.ReceiptWithOutcome,
): void {
  let match = Match.load(data.get("match_id")!.toString());
  if (match) {
    match.match_state = "Finished";
    match.winner = data.get("winner")!.toString();
    match.save();
  }
}

export function handleCancelMatch(
  method: string,
  event: string,
  data: TypedMap<string, JSONValue>,
  receipt: near.ReceiptWithOutcome,
): void {
  let match = Match.load(data.get("match_id")!.toString());
  if (match) {
    match.match_state = "Error";
    match.save();
  }
}
