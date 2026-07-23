class SettingsService:
    def get_settings(self) -> dict:
        """
        Returns application settings safely without exposing API keys.
        """
        return {
            "organisation": "EarthMind AI",
            "region": "Global",
            "notification_defaults": {
                "email_alerts": True,
                "weekly_digest": False,
                "slack_integration": True
            },
            "configured": {
                "postgres": True,
                "chromadb": True,
                "redis": True,
                "watsonx": True
            }
        }

settings_service = SettingsService()
