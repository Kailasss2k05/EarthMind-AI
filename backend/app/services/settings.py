"""
services/settings.py
--------------------
Settings service — reads and writes in-memory workspace settings.

Note: Settings are stored in memory (no DB persistence). They reset on
server restart. Add a settings table or file-backed store to persist.
"""

_settings_store: dict = {
    "organisation": "EarthMind AI",
    "region": "Global",
    "notification_defaults": {
        "anomaly_alerts": False,
        "compliance_updates": True,
        "weekly_digest": False,
    },
    "configured": {
        "postgres": True,
        "chromadb": True,
        "redis": True,
        "groq": True,   # Groq is the configured LLM provider
    }
}


class SettingsService:
    def get_settings(self) -> dict:
        """
        Returns application settings safely without exposing API keys.
        """
        return dict(_settings_store)

    def update_settings(self, updates: dict) -> dict:
        """
        Update settings in memory (H-1: was missing, causing Save to always fail).
        Only allowed top-level keys are updated to prevent injection of arbitrary config.
        """
        allowed_keys = {"organisation", "region", "notification_defaults"}
        for key in allowed_keys:
            if key in updates:
                _settings_store[key] = updates[key]

        return dict(_settings_store)


settings_service = SettingsService()
