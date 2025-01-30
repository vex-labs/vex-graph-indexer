import { near, json, JSONValue, TypedMap, BigInt, log } from '@graphprotocol/graph-ts';
import { handleCreateMatch, handleEndBetting, handleFinishMatch, handleCancelMatch } from "./event-handlers/match-handlers"
import { handleClaimBet, handleFtOnTransfer } from "./event-handlers/bet-handlers"

function handleEvent(
  method: string,
  event: string,
  data: TypedMap<string, JSONValue>,
  receipt: near.ReceiptWithOutcome
): void {
  if (method == 'create_match') { 
    handleCreateMatch(method, event, data, receipt);
  } else if (method == 'end_betting') {
    handleEndBetting(method, event, data, receipt);
  } else if (method == 'finish_match') {
    handleFinishMatch(method, event, data, receipt);
  } else if (method == 'cancel_match') {
    handleCancelMatch(method, event, data, receipt);
  } else if (method == 'ft_on_transfer') {
    handleFtOnTransfer(method, event, data, receipt);
  } else if (method == 'claim_bet') {
    handleClaimBet(method, event, data, receipt);
  }
}

function handleAction(
  action: near.ActionValue,
  receipt: near.ReceiptWithOutcome
): void {
  if (action.kind != near.ActionKind.FUNCTION_CALL) {
    return;
  }
  const outcome = receipt.outcome;
  const methodName = action.toFunctionCall().methodName;
  for (let logIndex = 0; logIndex < outcome.logs.length; logIndex++) {
    let outcomeLog = outcome.logs[logIndex].toString();
    if (outcomeLog.startsWith('EVENT_JSON:')) {
      outcomeLog = outcomeLog.replace('EVENT_JSON:', '');
      const jsonData = json.try_fromString(outcomeLog);
      const jsonObject = jsonData.value.toObject();
      const event = jsonObject.get('event')!;
      const dataArr = jsonObject.get('data')!.toArray();
      const dataObj: TypedMap<string, JSONValue> = dataArr[0].toObject();

      handleEvent(methodName, event.toString(), dataObj, receipt);
    }
  }
}

export function handleReceipt(receipt: near.ReceiptWithOutcome): void {
  const actions = receipt.receipt.actions;
  for (let i = 0; i < actions.length; i++) {
    handleAction(actions[i], receipt);
  }
}