import { near, JSONValue, TypedMap, BigInt } from '@graphprotocol/graph-ts';
import { Match } from "../../generated/schema"

export function handleFtOnTransfer(
    method: string,
    event: string,
    data: TypedMap<string, JSONValue>,
    receipt: near.ReceiptWithOutcome
  ): void {
  }