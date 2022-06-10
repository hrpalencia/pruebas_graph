import { near, JSONValue, json, log, BigInt, TypedMap } from "@graphprotocol/graph-ts"
import { Token } from "../generated/schema"

export function handleReceipt(receipt: near.ReceiptWithOutcome): void {
  const actions = receipt.receipt.actions;
  for (let i = 0; i < actions.length; i++) {
    handleAction(
      actions[i], 
      receipt.receipt, 
      receipt.outcome,
      receipt.block.header
    );
  }
}

function parseEvent(logData: string): TypedMap<string, JSONValue> {
  let outcomeLog = logData.toString();
  // log.info('outcomeLog {}', [outcomeLog]);

  let jsonData = json.try_fromString(outcomeLog);
  const jsonObject = jsonData.value.toObject();

  return jsonObject;
}

function handleAction(
  action: near.ActionValue,
  receipt: near.ActionReceipt,
  outcome: near.ExecutionOutcome,
  blockHeader: near.BlockHeader
): void {
  if (action.kind != near.ActionKind.FUNCTION_CALL) return;

  const methodName = action.toFunctionCall().methodName;

  for (let i = 0; i < outcome.logs.length; i++) {
    const logParsed = parseEvent(outcome.logs[i]);

    if (methodName == 'nft_mint') {
      const logJson = logParsed.get('nft_mint');
      if (!logJson) return;
      const data = logJson.toObject();

      const owner = data.get('owner_id');
      const tokenId = data.get('token_ids');
      const contract = "freehorsesspartans.freehorses.near";
     

      if (owner == null || tokenId == null || contract == null) { 
        log.error("[data] don't exist", []); return; 
      }

      const id = contract + "-" + tokenId.toString();
      
      let token = new Token(id.toString());
      token.id = id.toString();
      token.owner = owner.toString();
      token.tokenId = tokenId.toString();
      token.contract = contract.toString();

      token.save();
    }

    /*else if (methodName == 'buy_service') {
      const logJson = logParsed.get('service_buy');
      if (!logJson) return;
      const data = logJson.toObject();

      const id = data.get('id');
      if (id == null) return;

      let service = Service.load(id.toString());
      if (!service) return;

      const new_owner = data.get('buyer_id');
      if (new_owner == null) return;
      service.owner = new_owner.toString();

      service.save();
    }

    else if (methodName == 'reclaim_service') {
      const logJson = logParsed.get('service_reclaim');
      if (!logJson) return;
      const data = logJson.toObject();

      const id = data.get('id');
      if (id == null) return;

      let service = Service.load(id.toString());
      if (!service) return;

      const new_owner = data.get('sender_id');
      if (new_owner == null) return;
      service.owner = new_owner.toString();

      service.save();
    }*/


  }
}