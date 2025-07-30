from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    MODE: str = "dev"

    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    # DB
    DATABASE_URL: str

    # Tappay
    PARTNER_KEY: str
    MERCHANT_ID: str

    REDIS_PASSWORD: str
    REDIS_HOST: str
    REDIS_PORT: int

    model_config = SettingsConfigDict(env_file="./env/.env")


settings = Settings()
