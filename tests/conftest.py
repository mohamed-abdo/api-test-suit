
import pytest

def pytest_addoption(parser):
        parser.addoption(
            "--folder", action="store", default="api-response", help="folder name where to load postman response data"
        )

@pytest.fixture
def folder(request):
        return request.config.getoption("--folder")
