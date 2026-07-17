import os
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select
from app.database import get_session
from app.models.user import User

SUPABASE_JWT_SECRET = os.environ.get("SUPABASE_JWT_SECRET", "")
security = HTTPBearer()

credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session),
):
    token = credentials.credentials

    try:
        if SUPABASE_JWT_SECRET:
            payload = jwt.decode(
                token, SUPABASE_JWT_SECRET, algorithms=["HS256"], options={"verify_exp": True}
            )
        else:
            payload = jwt.decode(
                token, options={"verify_signature": False, "verify_exp": False}
            )

        email: str | None = payload.get("email")
        if not email:
            raise credentials_exception

        user = session.exec(select(User).where(User.email == email)).first()
        if not user:
            username = email
            sub = payload.get("sub", "")
            user_meta = payload.get("user_metadata") or {}
            role = user_meta.get("role", "user")
            if not role or role not in ("user", "admin"):
                role = "user"

            user = User(username=username, email=email, role=role)
            session.add(user)
            session.commit()
            session.refresh(user)

        return user

    except jwt.PyJWTError:
        raise credentials_exception
    except Exception:
        raise credentials_exception


def get_current_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough privileges",
        )
    return current_user


def get_current_kader(current_user: User = Depends(get_current_user)):
    if current_user.role not in ("user", "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough privileges",
        )
    return current_user
