/**
 * Adapted from @codemirror/collab for websockets
 * 
 * Reference: https://codemirror.net/examples/collab/
 * 
 * TLDR:
 * Clients can pull updates (getting updates when they're available).
 * Clients can push updates (sending their own changes).
 * If a client requests updates and none are available, the request is stored and fulfilled when new updates are pushed * by other
 */
import { PeerPrepCode } from "@/types";
import { Update, rebaseUpdates } from "@codemirror/collab";
import { ChangeSet, Text } from "@codemirror/state";
import { Socket } from "socket.io";

/**
 * TODO
 * 
 * - How to allow different docs from different rooms?
 */
let updates: Update[] = []
let doc = Text.of(["Start document"])

/**
 * Stores callback functions that is executed when new updates are available
 */
let pending: ((value: any) => void)[] = []

export const handleConnection = (socket: Socket) => {
  socket.on("getDocument", () => {
    socket.emit("getDocumentResponse", getDocumentHandler())
  })

  socket.on("pushUpdates", (version, docUpdates) => {
    const ok = pushUpdateHandler(version, docUpdates)
    if (ok) {
      socket.emit("pushUpdateResponse", true);
    } else {
      socket.emit("pushUpdateResponse", false);
    }
  })

  socket.on("pullUpdates", (version) => {
    /**
     * Client is requesting updates starting from `version`
     * 
     * If the client is behind, send updates starting from client's version
     * Else, there are no new updates. Callback fn is stored in the pending array
     * - Callback fn is called in pushUpdateHandler
     */
    if (version < updates.length) {
      socket.emit("pullUpdateResponse", JSON.stringify(updates.slice(version)));
    } else {
      pending.push((updates) => {
        socket.emit("pullUpdateResponse", JSON.stringify(updates.slice(version)));
      })
    }
  })
}

/**
 * Client requests the current state of the document
 */
const getDocumentHandler = (): PeerPrepCode => {
  return {version: updates.length, doc: doc.toString()}
}

/**
 * Client is sending new updates. Received data is converted to ChangeSet.
 * If client's version is not in sync with the server, rebaseUpdates.
 * Changes are applied to the doc
 * 
 * Pending requests in `pending` are notified with new updates
 * @param version 
 * @param docUpdates 
 * @returns 
 */
const pushUpdateHandler = (version: number, docUpdates: any) => {
  try {

    let received = docUpdates.map((each: { clientID: any; changes: any; }) => ({
      clientId: each.clientID,
      changes: ChangeSet.fromJSON(each.changes)
    }))
    if (version !== updates.length) {
      received = rebaseUpdates(received, updates.slice(version))
    }

    for (let update of received) {
      updates.push(update)
      doc = update.changes.apply(doc)
    }

    if (received.length) {
      const json = received.map((update: { clientID: any; changes: { toJSON: () => any; }; }) => ({
        clientID: update.clientID,
        changes: update.changes.toJSON()
      }))
      while (pending.length) pending.pop()!(json)
      return true; // successful merge
    }

  } catch (error) {
      const { message } = error as Error;
      console.error("pushUpdateHandlerError: " + message)
      return false;
  }
}