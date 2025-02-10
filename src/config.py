from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    DEBUG_MODE: bool = False

    model_config = SettingsConfigDict(env_file="./env/.env")

settings = Settings()