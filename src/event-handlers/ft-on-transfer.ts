import { near, JSONValue, TypedMap, BigInt } from '@graphprotocol/graph-ts';
import { Match } from "../../generated/schema"

export function handleFtOnTransfer(
    method: string,
    event: string,
    data: TypedMap<string, JSONValue>,
    receipt: near.ReceiptWithOutcome
  ): void {
    if (event == 'bet') {
      const match_id = data.get('match_id')!.toString();
      const match = Match.load(match_id);
      if (match) {
        const team = data.get('team')!.toString();
        if (team == 'Team1') {
          match.team_1_total_bets = BigInt.fromString(data.get('new_team_1_pool_size')!.toString());
        } else {
          match.team_2_total_bets = BigInt.fromString(data.get('new_team_2_pool_size')!.toString());
        }
        match.save();
      }
    }
  }