/**
 * @codemirror/collab Extension implmentation with websocket
 * 
 * Reference: https://github.com/codemirror/website/blob/master/site/examples/collab/collab.ts
 * 
 * Socket.once is for event listeners only - when you only want to be notified of the next time an event occurs, not
 * for the subsequent times it occurs.
 * 
 * So, socket.once fires the next time the event occurs. socket.on fires every time event occurs
 * 
 * TODO:
 * - Emit by room
 */

import { collab, getSyncedVersion, receiveUpdates, sendableUpdates } from "@codemirror/collab";
import { ChangeSet, Text } from "@codemirror/state";
import { ViewPlugin } from "@codemirror/view";

const pushUpdates = (
	socket,
	version,
	allUpdates,
  room_token
) => {
	const updates = allUpdates.map(u => ({
		clientID: u.clientID,
		changes: u.changes.toJSON(),
	}))
	return new Promise(function(resolve) {
		socket.emit('pushUpdates', room_token, version, JSON.stringify(updates));
		socket.once('pushUpdateResponse', (status) => {
			resolve(status);
		});
	});
}

const pullUpdates = async (
	socket,
	version,
  room_token
) => {
	return new Promise(function(resolve) {
		socket.emit('pullUpdates', room_token, version);
		socket.once('pullUpdateResponse', (updates) => {
			resolve(JSON.parse(updates));
		});
	}).then((updates) => updates.map((u) => ({
		changes: ChangeSet.fromJSON(u.changes),
		clientID: u.clientID
	})));
}

export const getDocument = (socket, room_token) => {
	return new Promise(function(resolve) {
		socket.emit('getDocument', room_token);

		socket.once('getDocumentResponse', (version, doc) => {
			resolve({
				version,
				doc: Text.of(doc.split("\n"))
			});
		});
	});
}

export function peerExtension(startVersion, connection, room_token, me) {
  const plugin = ViewPlugin.fromClass(class {
    constructor(view) {
      this.view = view
      this.pushing = false
      this.done = false
      this.pull()
    }

    update(update) {
      if (update.docChanged) this.push()
    }

    async push() {
      const updates = sendableUpdates(this.view.state)
      if (this.pushing || !updates.length) return
      this.pushing = true
      const version = getSyncedVersion(this.view.state)
      await pushUpdates(connection, version, updates, room_token)
      this.pushing = false
      // Regardless of whether the push failed or new updates came in
      // while it was running, try again if there's updates remaining
      if (sendableUpdates(this.view.state).length)
        setTimeout(() => this.push(), 100)
    }

    async pull() {
      while (!this.done) {
        const version = getSyncedVersion(this.view.state)
        const updates = await pullUpdates(connection, version, room_token)
        this.view.dispatch(receiveUpdates(this.view.state, updates))
      }
    }

    destroy() {
      this.done = true
    }
  })
  
  return [collab({ startVersion, clientID: me }), plugin]
}
