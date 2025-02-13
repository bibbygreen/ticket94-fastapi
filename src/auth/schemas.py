from pydantic import BaseModel


class CreateUserRequest(BaseModel):
    name: str
    account: str
    phone: str
    password: str


class Token(BaseModel):
    access_token: str

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMSIs....",
                },
            ]
        }
    }


class UserLogin(BaseModel):
    account: str
    password: str


class UserUpdatePhone(BaseModel):
    phone: str


class UserUpdatePassword(BaseModel):
    current_password: str
    new_password: str
