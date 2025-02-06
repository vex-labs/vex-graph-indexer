import { near, JSONValue, TypedMap, BigInt } from "@graphprotocol/graph-ts";
import { User } from "../../generated/schema";

export function handleStake(
  method: string,
  event: string,
  data: TypedMap<string, JSONValue>,
  receipt: near.ReceiptWithOutcome,
): void {
  const account_id = data.get("account_id")!.toString();
  const amount = BigInt.fromString(data.get("amount")!.toString());

  let user = User.load(account_id);
  if (!user) {
    user = new User(account_id);
    user.total_winnings = BigInt.zero();
    user.stake_in = amount;
    user.unstaked = BigInt.zero();
    user.number_of_wins = 0;
  } else {
    user.stake_in = user.stake_in.plus(amount);
  }
  user.save();
}

export function handleUnstake(
  method: string,
  event: string,
  data: TypedMap<string, JSONValue>,
  receipt: near.ReceiptWithOutcome,
): void {
  const account_id = data.get("account_id")!.toString();
  const amount = BigInt.fromString(data.get("amount")!.toString());
  const new_total_staked = BigInt.fromString(
    data.get("new_total_staked")!.toString(),
  );

  let user = User.load(account_id);
  if (user) {
    user.unstaked = user.unstaked.plus(amount);
    user.stake_in = new_total_staked;
    user.save();
  }
}
