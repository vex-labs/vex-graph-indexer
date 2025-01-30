import { near, JSONValue, TypedMap, BigInt } from "@graphprotocol/graph-ts";
import { Match, Bet } from "../../generated/schema";

export function handleFtOnTransfer(
  method: string,
  event: string,
  data: TypedMap<string, JSONValue>,
  receipt: near.ReceiptWithOutcome,
): void {
  if (event == "bet") {
    // Create a new bet
    let new_bet = new Bet(data.get("bet_id")!.toString());
    new_bet.account_id = data.get("account_id")!.toString();
    new_bet.amount = BigInt.fromString(data.get("amount")!.toString());
    new_bet.match_id = data.get("match_id")!.toString();
    new_bet.team = data.get("team")!.toString();
    new_bet.potential_winnings = BigInt.fromString(
      data.get("potential_winnings")!.toString(),
    );
    new_bet.pay_state = null;
    new_bet.created_at = BigInt.fromU64(receipt.block.header.timestampNanosec);
    new_bet.save();

    // Update the match pool size
    const match_id = data.get("match_id")!.toString();
    const match = Match.load(match_id);
    if (match) {
      const team = data.get("team")!.toString();
      if (team == "Team1") {
        match.team_1_total_bets = BigInt.fromString(
          data.get("new_team_1_pool_size")!.toString(),
        );
      } else {
        match.team_2_total_bets = BigInt.fromString(
          data.get("new_team_2_pool_size")!.toString(),
        );
      }
      match.save();
    }
  }
}

export function handleClaimBet(
  method: string,
  event: string,
  data: TypedMap<string, JSONValue>,
  receipt: near.ReceiptWithOutcome,
): void {
  if (event == "claim_winnings") {
    const bet_id = data.get("bet_id")!.toString();
    const bet = Bet.load(bet_id);
    if (bet) {
      bet.pay_state = "Paid";
      bet.save();
    }
  } else if (event == "claim_refund") {
    const bet_id = data.get("bet_id")!.toString();
    const bet = Bet.load(bet_id);
    if (bet) {
      bet.pay_state = "RefundPaid";
      bet.save();
    }
  }
}
