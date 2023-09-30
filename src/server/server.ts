import type * as Party from "partykit/server";
import type { Change } from "../components/puzzleTypes";

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
      conn.send(JSON.stringify(this.changes));
    }
  }

  onMessage(message: string, sender: Party.Connection) {
    // let's log the message
    console.log(`connection ${sender.id} sent message: ${message}`);

    const proposedChanges: Change[] = JSON.parse(message);
    const value = proposedChanges[0].value;
    const location = proposedChanges[0].locationKey;
    if (keys[location] !== value) {
      console.log("INVALID VALUE");
      proposedChanges[0].value = null;
      sender.send(JSON.stringify(proposedChanges));
      return;
    }

    this.changes.push(...proposedChanges);
    console.log(this.changes);

    // as well as broadcast it to all the other connections in the room...
    this.party.broadcast(
      message,
      // `${sender.id}: ${message}`,
      // ...except for the connection it came from
      [sender.id]
    );
  }
}

Server satisfies Party.Worker;
