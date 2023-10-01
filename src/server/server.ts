import type * as Party from "partykit/server";
import type {
  Change,
  ClientMessage,
  ServerChangeMessage,
  ServerRevertMessage,
} from "../components/puzzleTypes";

const puzzle = ["PYLA", "ALYP", "YPAL", "LAPY"];
const keys: Record<string, string> = {};
puzzle.forEach((row, index) => {
  for (let c = 0; c < row.length; c++) {
    keys[`cell-${index}-${c}`] = row[c];
  }
});

export default class Server implements Party.Server {
  changes: Change[];
  constructor(readonly party: Party.Party) {
    this.changes = [];
  }

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    // A websocket just connected!
    console.log(
      `Connected:
  id: ${conn.id}
  room: ${this.party.id}
  url: ${new URL(ctx.request.url).pathname}`
    );

    // let's send a message to the connection
    if (this.changes.length > 0) {
      const changeMessage: ServerChangeMessage = {
        type: "change",
        changes: this.changes,
      };
      conn.send(JSON.stringify(changeMessage));
    }
  }

  onMessage(message: string, sender: Party.Connection) {
    // let's log the message
    console.log(`connection ${sender.id} sent message: ${message}`);

    const { change }: ClientMessage = JSON.parse(message);
    const value = change.value;
    const location = change.locationKey;
    if (keys[location] !== value) {
      console.log("INVALID VALUE");
      change.value = null;
      const revertMessage: ServerRevertMessage = {
        type: "revert",
        changes: [change],
      };
      sender.send(JSON.stringify(revertMessage));
      return;
    }

    // Add to our list changes
    this.changes.push(change);

    const changeMessage: ServerChangeMessage = {
      type: "change",
      changes: [change],
    };

    // as well as broadcast it to all the other connections in the room...
    this.party.broadcast(
      JSON.stringify(changeMessage),
      // `${sender.id}: ${message}`,
      // ...except for the connection it came from
      [sender.id]
    );
  }
}

Server satisfies Party.Worker;
