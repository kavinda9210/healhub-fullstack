from app import create_app


def test_slots_missing_params():
    app = create_app()
    client = app.test_client()
    rv = client.get('/api/appointment/slots')
    assert rv.status_code == 400


def test_book_requires_auth():
    app = create_app()
    client = app.test_client()
    rv = client.post('/api/appointment/book', json={})
    assert rv.status_code in (401, 403)
