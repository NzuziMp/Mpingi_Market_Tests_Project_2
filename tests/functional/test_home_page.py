"""
Functional Test Suite 1 — Home Page

Scenarios:
  1. Home page loads and displays the hero section with a search bar
  2. Category cards are displayed on the home page
  3. The search bar accepts input and navigates to the listings page
"""

import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from conftest import BASE_URL


class TestHomePage:

    def test_home_page_loads_with_hero_section(self, driver):
        """
        Nominal case: The home page loads successfully and the hero heading
        is visible with the brand name 'MpingiMarket' or the hero text.
        """
        driver.get(BASE_URL)
        wait = WebDriverWait(driver, 15)

        body = wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))
        assert body is not None, "Page body should be present"

        heading = wait.until(
            EC.presence_of_element_located((By.TAG_NAME, "h1"))
        )
        assert heading is not None, "H1 heading should be present on the home page"
        assert len(heading.text) > 0, "H1 heading should have text content"

    def test_search_bar_is_present_and_accepts_input(self, driver):
        """
        Nominal case: The search bar is visible, accepts text input,
        and retains the typed value.
        """
        driver.get(BASE_URL)
        wait = WebDriverWait(driver, 15)

        search_input = wait.until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, "input[placeholder*='Search']")
            )
        )
        assert search_input is not None, "Search input should be present"
        assert search_input.is_displayed(), "Search input should be visible"

        search_input.clear()
        search_input.send_keys("iPhone")
        assert search_input.get_attribute("value") == "iPhone", \
            "Search input should retain the typed value"

    def test_search_navigates_to_listings_page(self, driver):
        """
        Nominal case: Submitting a search query from the home page navigates
        to the listings page and shows search results.
        """
        driver.get(BASE_URL)
        wait = WebDriverWait(driver, 15)

        search_inputs = driver.find_elements(By.CSS_SELECTOR, "input[placeholder*='Search']")
        assert len(search_inputs) > 0, "At least one search input should be present"

        search_input = search_inputs[0]
        search_input.clear()
        search_input.send_keys("car")
        search_input.send_keys(Keys.RETURN)

        wait.until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "button[class*='filter'], select"))
        )

        page_source = driver.page_source
        assert "car" in page_source.lower() or "listing" in page_source.lower(), \
            "Listings page should show results related to the search term"

    def test_empty_search_does_not_crash_page(self, driver):
        """
        Limit/error case: Submitting an empty search should either stay on home
        or navigate to listings without error — no crash or error page.
        """
        driver.get(BASE_URL)
        wait = WebDriverWait(driver, 15)

        search_inputs = driver.find_elements(By.CSS_SELECTOR, "input[placeholder*='Search']")
        if search_inputs:
            search_inputs[0].clear()
            search_inputs[0].send_keys(Keys.RETURN)

        wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))

        assert "Error" not in driver.title, "Page should not show an error after empty search"
        assert driver.find_element(By.TAG_NAME, "body") is not None, \
            "Page body should still be present after empty search"

    def test_category_cards_are_displayed(self, driver):
        """
        Nominal case: Category cards are rendered on the home page,
        each with a visible label.
        """
        driver.get(BASE_URL)
        wait = WebDriverWait(driver, 20)

        wait.until(EC.presence_of_element_located((By.TAG_NAME, "h1")))
        import time
        time.sleep(2)

        category_keywords = ["Vehicles", "Electronics", "Fashion", "Real Estate", "Jobs", "Services"]
        page_source = driver.page_source
        found = [kw for kw in category_keywords if kw in page_source]
        assert len(found) >= 3, \
            f"At least 3 category names should appear on the home page, found: {found}"
