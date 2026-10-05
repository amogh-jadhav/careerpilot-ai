from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Reads values from environment variables or the .env file."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    llm_provider: str = "openai"  # "openai" or "huggingface"
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    hf_token: str = ""
    hf_model: str = "meta-llama/Llama-3.1-8B-Instruct"

    embedding_provider: str = "local"  # "local" or "api"
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"

    database_url: str = "sqlite:///./careerpilot.db"
    frontend_origins: str = "http://localhost:5173"


settings = Settings()
