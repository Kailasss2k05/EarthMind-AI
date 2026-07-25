/**
 * services/websocket.service.ts
 *
 * WebSocket client for the EarthMind AI real-time agent event stream.
 *
 * Backend endpoint: ws://localhost:8000/api/v1/ws
 * Backend source:   app/websocket/routes.py, app/websocket/events.py
 *
 * ── Server-sent event types ─────────────────────────────────────────────────
 *
 *   { type: "connected",        message: string }
 *   { type: "agent_started",    agent: string, timestamp: string }
 *   { type: "agent_completed",  agent: string, timestamp: string }
 *   { type: "agent_failed",     agent: string, reason: string, timestamp: string }
 *   { type: "echo",             message: any }
 *
 * ── Usage ────────────────────────────────────────────────────────────────────
 *
 *   // Raw class usage:
 *   const ws = new EarthMindWebSocket();
 *   ws.onMessage((event) => console.log(event));
 *   ws.connect();
 *   // later:
 *   ws.disconnect();
 *
 *   // React hook (preferred):
 *   const { events, agentStatuses, isConnected } = useAgentWebSocket();
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { WS_BASE_URL } from "./api";
import type { AgentEvent, AgentName, AgentState, ToolExecutionRecord } from "./types";

// ─── The 9 agents in pipeline order (matches orchestrator/nodes.py) ──────────

export const PIPELINE_AGENTS: AgentName[] = [
  "Planner",
  "Research",
  "SDG",
  "Policy",
  "Environmental",
  "Finance",
  "Risk",
  "Timeline",
  "Report",
];

const WS_ENDPOINT = `${WS_BASE_URL}/api/v1/ws`;

// ─── EarthMindWebSocket class ─────────────────────────────────────────────────

type MessageHandler = (event: AgentEvent) => void;
type StateChangeHandler = (connected: boolean) => void;

export class EarthMindWebSocket {
  private ws: WebSocket | null = null;
  private messageHandlers: MessageHandler[] = [];
  private stateHandlers: StateChangeHandler[] = [];
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectDelay = 1000; // ms, doubles on each failure
  private maxReconnectDelay = 30_000;
  private shouldReconnect = true;

  /** Register a handler for incoming events */
  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
    };
  }

  /** Register a handler for connection state changes */
  onStateChange(handler: StateChangeHandler): () => void {
    this.stateHandlers.push(handler);
    return () => {
      this.stateHandlers = this.stateHandlers.filter((h) => h !== handler);
    };
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  connect(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

    this.shouldReconnect = true;
    this._open();
  }

  disconnect(): void {
    this.shouldReconnect = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.ws?.close(1000, "Client disconnected");
    this.ws = null;
  }

  /** Send a raw message to the server (used for ping/echo testing) */
  send(data: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  private _open(): void {
    try {
      this.ws = new WebSocket(WS_ENDPOINT);
    } catch (err) {
      console.error("[EarthMindWebSocket] Failed to open:", err);
      this._scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      console.info("[EarthMindWebSocket] Connected to", WS_ENDPOINT);
      this.reconnectDelay = 1000; // reset backoff
      this.stateHandlers.forEach((h) => h(true));
    };

    this.ws.onmessage = (ev: MessageEvent<string>) => {
      let parsed: AgentEvent;
      try {
        parsed = JSON.parse(ev.data) as AgentEvent;
      } catch {
        console.warn("[EarthMindWebSocket] Non-JSON message:", ev.data);
        return;
      }
      this.messageHandlers.forEach((h) => h(parsed));
    };

    this.ws.onclose = (ev) => {
      console.info(
        "[EarthMindWebSocket] Closed — code:",
        ev.code,
        "reason:",
        ev.reason,
      );
      this.stateHandlers.forEach((h) => h(false));
      if (this.shouldReconnect && ev.code !== 1000) {
        this._scheduleReconnect();
      }
    };

    this.ws.onerror = (ev) => {
      console.error("[EarthMindWebSocket] Error:", ev);
      // onclose will fire after onerror, which will schedule reconnect
    };
  }

  private _scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    console.info(
      `[EarthMindWebSocket] Reconnecting in ${this.reconnectDelay}ms…`,
    );
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.shouldReconnect) this._open();
    }, this.reconnectDelay);
    this.reconnectDelay = Math.min(
      this.reconnectDelay * 2,
      this.maxReconnectDelay,
    );
  }
}

// ─── React hook ───────────────────────────────────────────────────────────────

function buildInitialAgentStates(): AgentState[] {
  return PIPELINE_AGENTS.map((name) => ({ name, status: "queued" as const }));
}

export interface UseAgentWebSocketResult {
  /** All raw events received this session */
  events: AgentEvent[];
  /** Per-agent status derived from events */
  agentStatuses: AgentState[];
  /** Per-agent tool executions derived from events */
  toolExecutions: ToolExecutionRecord[];
  /** Whether the WebSocket is currently connected */
  isConnected: boolean;
  /** Clear accumulated events and reset agent states */
  reset: () => void;
}

/**
 * React hook that opens a persistent WebSocket connection to the EarthMind
 * backend and derives per-agent execution status from the event stream.
 *
 * Opens on mount, closes on unmount. Auto-reconnects with exponential backoff.
 *
 * @example
 * const { events, agentStatuses, isConnected } = useAgentWebSocket();
 */
export function useAgentWebSocket(): UseAgentWebSocketResult {
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [agentStatuses, setAgentStatuses] = useState<AgentState[]>(
    buildInitialAgentStates,
  );
  const [toolExecutions, setToolExecutions] = useState<ToolExecutionRecord[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Stable WS instance across re-renders
  const wsRef = useRef<EarthMindWebSocket | null>(null);

  const reset = useCallback(() => {
    setEvents([]);
    setAgentStatuses(buildInitialAgentStates());
    setToolExecutions([]);
  }, []);

  useEffect(() => {
    const ws = new EarthMindWebSocket();
    wsRef.current = ws;

    // Connection state
    const unsubState = ws.onStateChange(setIsConnected);

    // Event handler — updates both the raw event log and agent status map
    const unsubMsg = ws.onMessage((event) => {
      setEvents((prev) => [...prev, event]);

      if (
        event.type === "agent_started" ||
        event.type === "agent_completed" ||
        event.type === "agent_failed"
      ) {
        const agentName = event.agent as AgentName;

        setAgentStatuses((prev) =>
          prev.map((a) => {
            if (a.name !== agentName) return a;

            if (event.type === "agent_started") {
              return { ...a, status: "running", startedAt: event.timestamp };
            }
            if (event.type === "agent_completed") {
              return { ...a, status: "done", completedAt: event.timestamp };
            }
            if (event.type === "agent_failed") {
              return {
                ...a,
                status: "error",
                completedAt: event.timestamp,
                errorReason: event.reason,
              };
            }
            return a;
          }),
        );
      }

      if (
        event.type === "tool_started" ||
        event.type === "tool_completed" ||
        event.type === "tool_failed"
      ) {
        const tName = event.tool_name;
        const aName = event.agent_name;
        setToolExecutions((prev) => {
          if (event.type === "tool_started") {
            const existingIdx = prev.findIndex((t) => t.tool_name === tName && t.agent_name === aName && t.status === "Running");
            if (existingIdx !== -1) return prev;
            return [
              ...prev,
              {
                tool_name: tName,
                agent_name: aName,
                status: "Running",
                execution_time_ms: 0,
                summary: event.summary,
              },
            ];
          }
          return prev.map((t) => {
            if (t.tool_name === tName && t.agent_name === aName && t.status === "Running") {
              if (event.type === "tool_completed") {
                return {
                  ...t,
                  status: "Completed",
                  execution_time_ms: event.execution_time_ms || 0,
                  summary: event.summary || t.summary,
                };
              }
              if (event.type === "tool_failed") {
                return {
                  ...t,
                  status: "Failed",
                  execution_time_ms: event.execution_time_ms || 0,
                  summary: event.summary || t.summary,
                  error: event.error || event.summary,
                };
              }
            }
            return t;
          });
        });
      }
    });

    ws.connect();

    return () => {
      unsubState();
      unsubMsg();
      ws.disconnect();
      wsRef.current = null;
    };
  }, []);

  return { events, agentStatuses, toolExecutions, isConnected, reset };
}
