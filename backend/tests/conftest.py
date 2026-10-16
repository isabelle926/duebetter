import os
from collections.abc import Callable, Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

import app.models  # noqa: F401
from app.api.dependencies import get_db
from app.db.base import Base
from app.main import app


TEST_DATABASE_URL = os.environ["TEST_DATABASE_URL"]


test_engine = create_engine(
    TEST_DATABASE_URL,
    pool_pre_ping=True,
)


TestingSessionLocal = sessionmaker(
    bind=test_engine,
    autoflush=False,
    expire_on_commit=False,
)


@pytest.fixture(
    scope="session",
    autouse=True,
)
def setup_test_database() -> Generator[
    None,
    None,
    None,
]:
    Base.metadata.drop_all(
        bind=test_engine,
    )

    Base.metadata.create_all(
        bind=test_engine,
    )

    yield

    Base.metadata.drop_all(
        bind=test_engine,
    )


@pytest.fixture
def db() -> Generator[
    Session,
    None,
    None,
]:
    connection = test_engine.connect()
    transaction = connection.begin()

    session = TestingSessionLocal(
        bind=connection,
    )

    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()


@pytest.fixture
def client(
    db: Session,
) -> Generator[
    TestClient,
    None,
    None,
]:
    def override_get_db() -> Generator[
        Session,
        None,
        None,
    ]:
        yield db

    app.dependency_overrides[
        get_db
    ] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture
def register_user(
    client: TestClient,
) -> Callable[..., object]:
    def _register_user(
        *,
        email: str = "test@example.com",
        password: str = "testing12345",
        display_name: str = "Test User",
    ):
        return client.post(
            "/api/auth/register",
            json={
                "email": email,
                "password": password,
                "display_name": display_name,
            },
        )

    return _register_user


@pytest.fixture
def client_factory(
    db: Session,
) -> Generator[
    Callable[[], TestClient],
    None,
    None,
]:
    clients: list[TestClient] = []

    def override_get_db() -> Generator[
        Session,
        None,
        None,
    ]:
        yield db

    app.dependency_overrides[
        get_db
    ] = override_get_db

    def _create_client() -> TestClient:
        test_client = TestClient(app)

        clients.append(test_client)

        return test_client

    yield _create_client

    for test_client in clients:
        test_client.close()

    app.dependency_overrides.clear()