import {
  near,
  JSONValue,
  TypedMap,
  BigInt,
  log,
} from "@graphprotocol/graph-ts";
import { Match, Bet, User, WinningEvent } from "../../generated/schema";

export function handleBet(
  method: string,
  event: string,
  data: TypedMap<string, JSONValue>,
  receipt: near.ReceiptWithOutcome,
): void {
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

export function handleClaimBet(
  method: string,
  event: string,
  data: TypedMap<string, JSONValue>,
  receipt: near.ReceiptWithOutcome,
): void {
  log.warning("event {}", [event]);
  if (event == "claim_winnings") {
    log.warning("Claiming winnings", []);
    const bet_id = data.get("bet_id")!.toString();
    log.warning("bet_id {}", [bet_id]);
    const bet = Bet.load(bet_id);
    if (bet) {
      log.warning("Bet found", []);
      bet.pay_state = "Paid";

      // Handle user winnings
      const account_id = data.get("account_id")!.toString();
      const amount_received = BigInt.fromString(
        data.get("amount_received")!.toString(),
      );

      // Create winning event
      let winningEvent = new WinningEvent(bet_id);
      winningEvent.user = account_id;
      winningEvent.amount = amount_received;
      winningEvent.save();

      // Update user total (existing logic)
      let user = User.load(account_id);
      if (!user) {
        user = new User(account_id);
        user.total_winnings = amount_received;
        user.stake_in = BigInt.zero();
        user.unstaked = BigInt.zero();
        user.number_of_wins = 1; // Initialize wins counter
      } else {
        user.total_winnings = user.total_winnings.plus(amount_received);
        user.number_of_wins = user.number_of_wins + 1; // Increment wins counter
      }
      user.save();

      bet.save();
    }
  } else if (event == "claim_refund") {
    log.info("Claiming refund", []);
    const bet_id = data.get("bet_id")!.toString();
    const bet = Bet.load(bet_id);
    if (bet) {
      log.info("Bet found", []);
      bet.pay_state = "RefundPaid";
      bet.save();
    }
  }
}
