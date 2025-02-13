import bcrypt
from fastapi import HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.security.utils import get_authorization_scheme_param


class OAuth2PasswordBearerWithAccount(OAuth2PasswordBearer):
    def __init__(self, tokenUrl: str):
        super().__init__(tokenUrl=tokenUrl)

    def __call__(self, request: Request) -> str | None:
        authorization: str = request.headers.get("Authorization")
        scheme, param = get_authorization_scheme_param(authorization)
        if not authorization or scheme.lower() != "bearer":
            if self.auto_error:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Not authenticated",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            else:
                return None
        return param


oauth2_scheme = OAuth2PasswordBearerWithAccount(tokenUrl="login")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """verify password

    Parameters
    ----------
    plain_password : str
        plain password
    hashed_password : str
        hashed password

    Returns
    -------
    bool
        True if password is correct, False otherwise
    """
    return bcrypt.checkpw(plain_password.encode(), hashed_password.encode())


def get_password_hash(password: str) -> str:
    """get password hash

    Parameters
    ----------
    password : str
        password

    Returns
    -------
    str
        hashed password
    """
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
