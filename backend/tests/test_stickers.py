from fastapi.testclient import TestClient
from PIL import Image

from io import BytesIO


def register(
    client: TestClient,
) -> None:
    response = client.post(
        "/api/auth/register",
        json={
            "email": "alice@example.com",
            "password": "testing12345",
            "display_name": "Alice",
        },
    )

    assert response.status_code == 201


def create_png() -> bytes:
    buffer = BytesIO()

    image = Image.new(
        "RGBA",
        (32, 32),
        (255, 0, 0, 255),
    )

    image.save(
        buffer,
        format="PNG",
    )

    return buffer.getvalue()


def test_upload_sticker(
    client: TestClient,
    monkeypatch,
):
    register(client)

    uploaded: dict[str, object] = {}

    def fake_upload_object(
        *,
        key: str,
        data: bytes,
        content_type: str,
    ) -> None:
        uploaded["key"] = key
        uploaded["data"] = data
        uploaded["content_type"] = (
            content_type
        )

    monkeypatch.setattr(
        "app.api.routes.stickers.upload_object",
        fake_upload_object,
    )

    monkeypatch.setattr(
        "app.api.routes.stickers.get_public_url",
        lambda *, key: (
            f"https://example.test/{key}"
        ),
    )

    response = client.post(
        "/api/stickers",
        data={
            "name": "Red Sticker",
        },
        files={
            "file": (
                "red.png",
                create_png(),
                "image/png",
            ),
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["name"] == "Red Sticker"
    assert (
        data["image_url"].startswith(
            "https://example.test/"
        )
    )

    assert (
        uploaded["content_type"]
        == "image/png"
    )


def test_list_stickers(
    client: TestClient,
    monkeypatch,
):
    register(client)

    monkeypatch.setattr(
        "app.api.routes.stickers.upload_object",
        lambda **_kwargs: None,
    )

    monkeypatch.setattr(
        "app.api.routes.stickers.get_public_url",
        lambda *, key: (
            f"https://example.test/{key}"
        ),
    )

    response = client.post(
        "/api/stickers",
        data={
            "name": "Sticker",
        },
        files={
            "file": (
                "sticker.png",
                create_png(),
                "image/png",
            ),
        },
    )

    assert response.status_code == 201

    response = client.get(
        "/api/stickers"
    )

    assert response.status_code == 200
    assert len(response.json()) == 1


def test_invalid_image_rejected(
    client: TestClient,
    monkeypatch,
):
    register(client)

    def should_not_upload(
        **_kwargs,
    ) -> None:
        raise AssertionError(
            "Invalid image reached storage"
        )

    monkeypatch.setattr(
        "app.api.routes.stickers.upload_object",
        should_not_upload,
    )

    response = client.post(
        "/api/stickers",
        data={
            "name": "Fake",
        },
        files={
            "file": (
                "fake.png",
                b"this is not an image",
                "image/png",
            ),
        },
    )

    assert response.status_code == 415


def test_delete_sticker(
    client: TestClient,
    monkeypatch,
):
    register(client)

    monkeypatch.setattr(
        "app.api.routes.stickers.upload_object",
        lambda **_kwargs: None,
    )

    monkeypatch.setattr(
        "app.api.routes.stickers.get_public_url",
        lambda *, key: (
            f"https://example.test/{key}"
        ),
    )

    deleted_keys: list[str] = []

    def fake_delete_object(
        *,
        key: str,
    ) -> None:
        deleted_keys.append(key)

    monkeypatch.setattr(
        "app.api.routes.stickers.delete_object",
        fake_delete_object,
    )

    upload_response = client.post(
        "/api/stickers",
        data={
            "name": "Temporary",
        },
        files={
            "file": (
                "temporary.png",
                create_png(),
                "image/png",
            ),
        },
    )

    sticker = upload_response.json()

    response = client.delete(
        f"/api/stickers/{sticker['id']}"
    )

    assert response.status_code == 204

    assert deleted_keys == [
        sticker["storage_key"]
    ]


def test_stickers_require_authentication(
    client: TestClient,
):
    response = client.get(
        "/api/stickers"
    )

    assert response.status_code == 401