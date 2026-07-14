"""
WebSocket routes for EarthMind AI.

Endpoint: GET /ws  (mounted under /api/v1 → final path: /api/v1/ws)

Lifecycle:
1. Client connects  → send a welcome JSON message.
2. Receive message  → echo it back (testing / ping-pong).
3. Client disconnects / error → clean disconnect from ConnectionManager.

LangGraph integration will be added in a future iteration;
this file intentionally contains only infrastructure wiring.
"""

import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websocket.manager import manager
from app.core.logger import logger

# Router for WebSocket endpoints.
# The "/ws" prefix here, combined with the v1_router prefix "/api/v1",
# produces the final path: /api/v1/ws
ws_router = APIRouter()


@ws_router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket) -> None:
    """
    Main WebSocket endpoint.

    Flow:
    - accept connection via ConnectionManager.
    - send a welcome connected message.
    - enter receive loop: echo any message back to the sender.
    - on disconnect: cleanly remove the client.
    """
    # Step 1: Accept and register the client
    await manager.connect(websocket)

    try:
        # Step 2: Send a welcome message immediately upon connection
        await manager.send_personal(
            {
                "type": "connected",
                "message": "Connected to EarthMind AI",
            },
            websocket,
        )

        # Step 3: Receive loop — keep listening until the client disconnects
        while True:
            # Receive raw text data from the client
            data = await websocket.receive_text()

            logger.info("WebSocket message received: %s", data)

            # Echo the received message back for testing purposes.
            # Attempt to parse as JSON for a richer echo; fall back to plain text.
            try:
                payload = json.loads(data)
            except (json.JSONDecodeError, ValueError):
                payload = {"raw": data}

            await manager.send_personal(
                {
                    "type": "echo",
                    "message": payload,
                },
                websocket,
            )

    except WebSocketDisconnect:
        # Client closed the connection gracefully
        manager.disconnect(websocket)

    except Exception:
        # Unexpected error — log and ensure the client is removed
        logger.exception("WebSocket error")
        manager.disconnect(websocket)
