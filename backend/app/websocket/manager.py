"""
ConnectionManager — manages all active WebSocket connections.

Responsibilities:
- Track connected clients in a list.
- Accept and register new connections (connect).
- Remove connections on disconnect.
- Broadcast a message to every connected client.
- Send a message to a single specific client.
"""

from fastapi import WebSocket
from app.core.logger import logger


class ConnectionManager:
    def __init__(self) -> None:
        # Holds all currently active WebSocket connections
        self.active_connections: list[WebSocket] = []
        # Reference to the main event loop, set during startup lifespan
        self.loop = None

    async def connect(self, websocket: WebSocket) -> None:
        """Accept the WebSocket handshake and register the client."""
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(
            "WebSocket client connected. Total active: %d",
            len(self.active_connections),
        )

    def disconnect(self, websocket: WebSocket) -> None:
        """Remove a client from the active connections list."""
        self.active_connections.remove(websocket)
        logger.info(
            "WebSocket client disconnected. Total active: %d",
            len(self.active_connections),
        )

    async def broadcast(self, message: dict) -> None:
        """Send a JSON message to every connected client."""
        logger.info(
            "Broadcasting to %d client(s): %s",
            len(self.active_connections),
            message,
        )
        for connection in self.active_connections:
            await connection.send_json(message)

    async def send_personal(self, message: dict, websocket: WebSocket) -> None:
        """Send a JSON message to a single specific client."""
        await websocket.send_json(message)


# Singleton instance shared across the application.
# Import `manager` directly in routes instead of instantiating a new object.
manager = ConnectionManager()
