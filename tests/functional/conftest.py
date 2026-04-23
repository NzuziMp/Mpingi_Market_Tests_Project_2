import os
import shutil
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options

BASE_URL = os.environ.get("APP_BASE_URL", "http://localhost:5173")
HEADLESS = os.environ.get("HEADLESS", "true").lower() == "true"

TEST_USER_EMAIL = os.environ.get("TEST_USER_EMAIL", "testuser@mpingimarket.test")
TEST_USER_PASSWORD = os.environ.get("TEST_USER_PASSWORD", "TestPassword123!")
TEST_USER_NAME = "Test User"


def _find_chrome_binary() -> str | None:
    path = os.environ.get("CHROME_BINARY_PATH") or os.environ.get("GOOGLE_CHROME_BIN")
    if path and os.path.exists(path):
        return path

    windows_candidates = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files\Chromium\Application\chrome.exe",
        r"C:\Program Files (x86)\Chromium\Application\chrome.exe",
    ]

    for candidate in windows_candidates:
        if os.path.exists(candidate):
            return candidate

    for candidate in ["google-chrome-stable", "google-chrome", "chromium-browser", "chromium"]:
        found = shutil.which(candidate)
        if found:
            return found

    return None


@pytest.fixture(scope="session")
def driver():
    """Create a single browser session shared across all tests in the session."""
    options = Options()

    if HEADLESS:
        options.add_argument("--headless=new")

    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1440,900")
    options.add_argument("--disable-extensions")

    chrome_binary = _find_chrome_binary()
    if chrome_binary:
        options.binary_location = chrome_binary
    else:
        raise RuntimeError(
            "No Chrome or Chromium browser binary was found. "
            "Set CHROME_BINARY_PATH to your browser path."
        )

    chromedriver_path = os.environ.get("CHROMEDRIVER_PATH")

    if not chromedriver_path or not os.path.exists(chromedriver_path):
        raise RuntimeError(
            "CHROMEDRIVER_PATH is not defined or invalid. "
            "Example: C:\\WebDrivers\\chromedriver.exe"
        )

    service = Service(executable_path=chromedriver_path)

    browser = webdriver.Chrome(service=service, options=options)
    browser.implicitly_wait(10)

    yield browser

    browser.quit()


@pytest.fixture(autouse=True)
def reset_page(driver):
    """Navigate back to the base URL before each test."""
    driver.get(BASE_URL)