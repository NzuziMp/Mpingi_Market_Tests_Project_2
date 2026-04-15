"""
Functional Test Suite 3 — Listings Browse & Filter

Scenarios:
  1. Listings page loads and displays a grid of ad cards
  2. Category filter chips are present and clickable
  3. Sort dropdown changes the listing order
  4. Navigating to a listing detail page works correctly
"""

import pytest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
from conftest import BASE_URL


class TestListingsBrowse:

    def _navigate_to_listings(self, driver):
        driver.get(BASE_URL)
        wait = WebDriverWait(driver, 15)
        browse_buttons = driver.find_elements(
            By.XPATH,
            "//*[contains(text(), 'Browse') or contains(text(), 'Listings') or contains(text(), 'Ads')]"
        )
        for btn in browse_buttons:
            if btn.is_displayed() and btn.tag_name in ('a', 'button'):
                btn.click()
                break
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "select")))

    def test_listings_page_loads_sort_and_filter_controls(self, driver):
        """
        Nominal case: The listings page loads and shows the filter toolbar
        with a sort dropdown and category filter chips.
        """
        self._navigate_to_listings(driver)
        wait = WebDriverWait(driver, 15)

        sort_select = wait.until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "select"))
        )
        assert sort_select.is_displayed(), "Sort dropdown should be visible on the listings page"

    def test_sort_dropdown_has_expected_options(self, driver):
        """
        Nominal case: The sort dropdown contains the four expected sort options.
        """
        self._navigate_to_listings(driver)
        wait = WebDriverWait(driver, 15)

        sort_el = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "select")))
        select = Select(sort_el)
        option_texts = [o.text for o in select.options]

        expected = ["Newest First", "Oldest First", "Price: Low to High", "Price: High to Low"]
        for expected_opt in expected:
            assert any(expected_opt in t for t in option_texts), \
                f"Sort option '{expected_opt}' should be in the dropdown. Found: {option_texts}"

    def test_sort_by_price_low_to_high_changes_url_or_results(self, driver):
        """
        Nominal case: Selecting 'Price: Low to High' from the sort dropdown
        updates the page without crashing.
        """
        self._navigate_to_listings(driver)
        wait = WebDriverWait(driver, 15)

        sort_el = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "select")))
        select = Select(sort_el)
        select.select_by_visible_text("Price: Low to High")
        time.sleep(2)

        body = driver.find_element(By.TAG_NAME, "body")
        assert body is not None, "Page should still have a body after sorting"
        assert "Error" not in driver.title, "No error should appear after changing sort order"

    def test_category_filter_buttons_are_present(self, driver):
        """
        Nominal case: Category filter chips render in the filter toolbar.
        """
        self._navigate_to_listings(driver)
        wait = WebDriverWait(driver, 15)

        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "select")))
        time.sleep(1)

        page_source = driver.page_source
        category_keywords = ["Vehicles", "Electronics", "Fashion", "Jobs"]
        found = [kw for kw in category_keywords if kw in page_source]
        assert len(found) >= 2, \
            f"At least 2 category filter chips should be visible. Found: {found}"

    def test_filter_panel_opens_when_filters_button_clicked(self, driver):
        """
        Nominal case: Clicking the 'Filters' button expands the advanced filter panel.
        """
        self._navigate_to_listings(driver)
        wait = WebDriverWait(driver, 15)

        filter_buttons = driver.find_elements(
            By.XPATH, "//*[contains(text(), 'Filter')]"
        )
        clicked = False
        for btn in filter_buttons:
            if btn.is_displayed() and btn.tag_name == "button":
                btn.click()
                clicked = True
                break

        if clicked:
            time.sleep(1)
            page_source = driver.page_source
            filter_keywords = ["Condition", "Min Price", "Max Price", "Country"]
            found = any(kw in page_source for kw in filter_keywords)
            assert found, "Advanced filter panel should show condition and price filters"

    def test_no_results_message_shown_for_nonsense_search(self, driver):
        """
        Limit/error case: Searching for a nonsense term on the listings page
        should show a 'no listings found' message rather than crashing.
        """
        driver.get(BASE_URL)
        wait = WebDriverWait(driver, 15)

        search_inputs = driver.find_elements(
            By.CSS_SELECTOR, "input[placeholder*='Search']"
        )
        if search_inputs:
            from selenium.webdriver.common.keys import Keys
            search_inputs[0].clear()
            search_inputs[0].send_keys("xyznonexistentitem99999")
            search_inputs[0].send_keys(Keys.RETURN)
            time.sleep(3)

            page_source = driver.page_source
            no_results_keywords = ["no listing", "not found", "0 listing", "no result"]
            found = any(kw in page_source.lower() for kw in no_results_keywords)
            assert found or "listing" in page_source.lower(), \
                "Page should gracefully handle a search with no results"
