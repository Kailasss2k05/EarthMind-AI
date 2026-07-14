from dotenv import load_dotenv
import os

load_dotenv()


class Settings:

    MODEL_PROVIDER = os.getenv(
        "MODEL_PROVIDER",
        "ollama"
    )

    MODEL_NAME = os.getenv(
        "MODEL_NAME",
        "llama3.2:3b"
    )

    TEMPERATURE = float(

        os.getenv(

            "TEMPERATURE",

            0.3

        )

    )

    OLLAMA_BASE_URL = os.getenv(

        "OLLAMA_BASE_URL",

        "http://localhost:11434"

    )


settings = Settings()