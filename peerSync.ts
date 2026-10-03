
import { useEffect, useRef, useState } from 'react';
import { Peer, type DataConnection } from 'peerjs';
import type { GameState } from './types';
import { parseGameState } from './gameReducer';

// The host sends the full game state on every change and as a heartbeat, so a
// viewer can spot a dead connection even when WebRTC never reports it closed.
const HEARTBEAT_MS = 4000;
const STALE_AFTER_MS = 15000;
// PeerJS gives up after losing the server or a connection, so both sides check
// on this interval and reconnect when needed.
const RETRY_MS = 3000;

export type HostStatus = 'connecting' | 'online' | 'offline' | 'link-in-use';
export type ViewerStatus = 'connecting' | 'connected' | 'waiting-for-host' | 'reconnecting';

export interface ConnectionIndicator {
  tone: 'good' | 'warn' | 'bad';
  label: string;
}

export const describeHostStatus = (status: HostStatus, viewers: number): ConnectionIndicator => {
  switch (status) {
    case 'online':
      return { tone: 'good', label: viewers === 1 ? 'Live: 1 viewer connected' : `Live: ${viewers} viewers connected` };
    case 'connecting':
      return { tone: 'warn', label: 'Connecting to the stream server…' };
    case 'offline':
      return { tone: 'warn', label: 'Stream server unreachable, retrying…' };
    case 'link-in-use':
      return { tone: 'bad', label: 'Stream link in use by another scoreboard tab, retrying…' };
  }
};

export const describeViewerStatus = (status: ViewerStatus): ConnectionIndicator => {
  switch (status) {
    case 'connected':
      return { tone: 'good', label: 'Connected' };
    case 'connecting':
      return { tone: 'warn', label: 'Connecting…' };
    case 'waiting-for-host':
      return { tone: 'warn', label: 'Waiting for the scoreboard…' };
    case 'reconnecting':
      return { tone: 'bad', label: 'Connection lost, reconnecting…' };
  }
};

// Host side: registers `hostId` with the PeerJS server and streams the game
// state to every viewer. Does nothing when `hostId` is null.
export const useHostBroadcast = (hostId: string | null, gameState: GameState) => {
  const [status, setStatus] = useState<HostStatus>('connecting');
  const [viewers, setViewers] = useState(0);
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;
  const connectionsRef = useRef<DataConnection[]>([]);

  const sendToViewers = (state: GameState) => {
    connectionsRef.current = connectionsRef.current.filter(conn => conn.open);
    connectionsRef.current.forEach(conn => conn.send(state));
    setViewers(connectionsRef.current.length);
  };

  useEffect(() => {
    if (!hostId) return;
    let peer: Peer | null = null;
    // A new ID (new links) starts over: nobody is connected to it yet.
    setStatus('connecting');
    setViewers(0);

    const start = () => {
      const p = new Peer(hostId);
      peer = p;
      p.on('open', () => setStatus('online'));
      p.on('disconnected', () => setStatus(s => (s === 'link-in-use' ? s : 'offline')));
      p.on('error', (err) => {
        if (err.type === 'unavailable-id') {
          setStatus('link-in-use');
        }
      });
      p.on('connection', (conn) => {
        conn.on('open', () => {
          connectionsRef.current.push(conn);
          conn.send(gameStateRef.current);
          setViewers(connectionsRef.current.filter(c => c.open).length);
        });
        const drop = () => {
          connectionsRef.current = connectionsRef.current.filter(c => c !== conn);
          setViewers(connectionsRef.current.length);
        };
        conn.on('close', drop);
        conn.on('error', drop);
      });
    };

    start();
    const timer = window.setInterval(() => {
      if (!peer || peer.destroyed) {
        start();
      } else if (peer.disconnected) {
        peer.reconnect();
      }
      sendToViewers(gameStateRef.current);
    }, HEARTBEAT_MS);

    // Close connections when the page goes away, so viewers find out right away
    // instead of waiting for missed heartbeats.
    const closeOnExit = () => peer?.destroy();
    window.addEventListener('pagehide', closeOnExit);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener('pagehide', closeOnExit);
      peer?.destroy();
      connectionsRef.current = [];
    };
  }, [hostId]);

  useEffect(() => {
    if (hostId) sendToViewers(gameState);
  }, [hostId, gameState]);

  return { status, viewers };
};

// Viewer side: connects to the host `watchId` and passes every game state it
// receives to `onState`. Does nothing when `watchId` is null.
export const useViewerSync = (watchId: string | null, onState: (state: GameState) => void): ViewerStatus => {
  const [status, setStatus] = useState<ViewerStatus>('connecting');
  const onStateRef = useRef(onState);
  onStateRef.current = onState;

  useEffect(() => {
    if (!watchId) return;
    let peer: Peer | null = null;
    let conn: DataConnection | null = null;
    let lastHeardAt = 0;

    const connect = () => {
      if (!peer?.open) return;
      conn?.close();
      const c = peer.connect(watchId, { reliable: true });
      conn = c;
      lastHeardAt = Date.now();
      c.on('data', (data) => {
        if (conn !== c) return;
        lastHeardAt = Date.now();
        setStatus('connected');
        const state = parseGameState(data);
        if (state) {
          onStateRef.current(state);
        } else {
          console.warn('Ignoring game state from an incompatible scoreboard version');
        }
      });
      c.on('close', () => {
        if (conn !== c) return;
        conn = null;
        setStatus('reconnecting');
      });
    };

    const start = () => {
      const p = new Peer();
      peer = p;
      p.on('open', connect);
      p.on('error', (err) => {
        if (err.type === 'peer-unavailable') {
          // The host isn't registered right now (closed, or reloading).
          conn?.close();
          conn = null;
          setStatus('waiting-for-host');
        }
      });
    };

    start();
    const timer = window.setInterval(() => {
      if (!peer || peer.destroyed) {
        start();
      } else if (peer.disconnected) {
        peer.reconnect(); // Reconnecting emits 'open', which reconnects to the host.
      } else if (peer.open && (!conn || Date.now() - lastHeardAt > STALE_AFTER_MS)) {
        if (conn) setStatus('reconnecting');
        connect();
      }
    }, RETRY_MS);

    return () => {
      window.clearInterval(timer);
      conn?.close();
      peer?.destroy();
    };
  }, [watchId]);

  return status;
};
