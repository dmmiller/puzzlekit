import type { Change, PuzzleEntry } from "../components/puzzleTypes";
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
  puzzleEntry = document.querySelector(".puzzle-entry")?.puzzleEntry;
  puzzleEntry!.prepareToReset();
  puzzleEntry!.registerForCoop(conn.id, (changes: Change[]) => {
    console.log(changes);
    if (changes[0].propertyKey === "class-small-text") {
      if (changes[0].value === "small-text") {
        alternatesSet.add(changes[0].locationKey);
      } else {
        alternatesSet.delete(changes[0].locationKey);
      }
      return;
    }
    if (alternatesSet.has(changes[0].locationKey)) {
      return;
    }
    const changesString = JSON.stringify(changes);
    conn.send(changesString);
  });
});

// You can even start sending messages before the connection is open!
conn.addEventListener("message", (event) => {
  // add(`Received -> ${event.data}`);
  const changes: Change[] = JSON.parse(event.data);
  if (alternatesSet.has(changes[0].locationKey)) {
    changes.unshift({
      locationKey: changes[0].locationKey,
      propertyKey: "class-small-text",
      value: null,
      playerId: changes[0].playerId,
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
