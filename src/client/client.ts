import type {
  Change,
  ClientMessage,
  PuzzleEntry,
  PuzzleEvent,
  ServerMessage,
} from "../components/puzzleTypes";
import "./styles.css";

import PartySocket from "partysocket";

declare const PARTYKIT_HOST: string;

// Let's append all the messages we get into this DOM element
const output = document.getElementById("app") as HTMLDivElement;

// Helper function to add a new line to the DOM
function add(text: string) {
  output.appendChild(document.createTextNode(text));
  output.appendChild(document.createElement("br"));
}

// A PartySocket is like a WebSocket, except it's a bit more magical.
// It handles reconnection logic, buffering messages while it's offline, and more.
console.log(PARTYKIT_HOST);
const conn = new PartySocket({
  host: PARTYKIT_HOST,
  room: "my-new-room",
});

let puzzleEntry: PuzzleEntry | null = null;
const alternatesSet = new Set<string>();
document.addEventListener("DOMContentLoaded", () => {
  const puzzleElement = document.querySelector(".puzzle-entry");
  puzzleElement?.setAttribute("data-team-id", conn.id);
  puzzleEntry = puzzleElement?.puzzleEntry;
  puzzleEntry!.prepareToReset();
});

document.addEventListener("puzzlechanged", (e: Event) => {
  const changes: Change[] = (e as PuzzleEvent).detail;
  changes.forEach((change) => {
    if (change.propertyKey === "class-small-text") {
      if (change.value === "small-text") {
        alternatesSet.add(change.locationKey);
      } else {
        alternatesSet.delete(change.locationKey);
      }
      return;
    }
    if (alternatesSet.has(change.locationKey)) {
      return;
    }
    const clientMessage: ClientMessage = {
      change,
    };
    conn.send(JSON.stringify(clientMessage));
  });
});

// You can even start sending messages before the connection is open!
conn.addEventListener("message", (event) => {
  // currently handling both revert and change messages the same
  const serverMessage: ServerMessage = JSON.parse(event.data);
  const changes = serverMessage.changes;
  if (alternatesSet.has(changes[0].locationKey)) {
    changes.unshift({
      puzzleId: changes[0].puzzleId,
      locationKey: changes[0].locationKey,
      propertyKey: "class-small-text",
      value: null,
      playerId: changes[0].playerId,
      teamId: changes[0].teamId,
    });
  }
  puzzleEntry!.changeWithoutUndo(changes);
});

// Let's listen for when the connection opens
// And send a ping every 2 seconds right after
conn.addEventListener("open", () => {
  add(`Connected! as ${conn.id}`);
  // add("Sending a ping every 2 seconds...");
  // TODO: make this more interesting / nice
  // clearInterval(pingInterval);
  // pingInterval = setInterval(() => {
  //   conn.send("ping");
  // }, 2000);
});
