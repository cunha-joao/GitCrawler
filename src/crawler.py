import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.by import By
import time
import re

# Configure Selenium
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))


# Function to perform the search on GitHub and scrape the results
def github_search(query, pages=10):
    url = f"https://github.com/search?q={query}&type=code"
    driver.get(url)

    results = []

    for _ in range(pages):
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        code_results = soup.find_all('div', class_='f4 text-normal')

        for code in code_results:
            file_url = code.find('a')['href']
            file_url = f"https://github.com{file_url}"
            results.append(file_url)

        next_button = driver.find_element(By.CLASS_NAME, 'next_page')
        if 'disabled' in next_button.get_attribute('class'):
            break
        else:
            next_button.click()
            time.sleep(2)  # wait for the next page to load

    return results


# Function to scrape and analyze the content of each file for sensitive information
def analyze_file(url):
    driver.get(url)
    soup = BeautifulSoup(driver.page_source, 'html.parser')
    file_content = soup.find('table', class_='highlight').get_text()

    # Define regex patterns for sensitive data
    patterns = [
        r'DB_HOST\s*=\s*.+',
        r'DB_PASSWORD\s*=\s*.+',
        r'PASSWORD\s*=\s*.+',
        r'API_KEY\s*=\s*.+',
        r'ACCESS_KEY\s*=\s*.+',
        r'SECRET_KEY\s*=\s*.+',
        r'\b(?:'
        r'(?!10(?:\.\d{1,3}){3})'
        r'(?!127(?:\.\d{1,3}){3})'
        r'(?!169\.254(?:\.\d{1,3}){2})'
        r'(?!172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})'
        r'(?!192\.168(?:\.\d{1,3}){2})'
        r'(?!0(?:\.\d{1,3}){3})'
        r'(?!255\.255\.255\.255)'
        r'(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.'
        r'(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.'
        r'(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.'
        r'(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)'
        r')\b'
    ]

    sensitive_data = []

    for pattern in patterns:
        matches = re.findall(pattern, file_content)
        if matches:
            sensitive_data.append({
                'url': url,
                'matches': matches
            })

    return sensitive_data


# Run the Crawler
query = ".env db_host db_password"
search_results = github_search(query, pages=2)  # scrape the first 2 pages

sensitive_files = []

for result in search_results:
    sensitive_data = analyze_file(result)
    if sensitive_data:
        sensitive_files.extend(sensitive_data)

# Output the results
for file in sensitive_files:
    print(f"URL: {file['url']}")
    for match in file['matches']:
        print(f"Match: {match}")
    print("\n")

# Save Results to a File (Optional)
import csv

with open('sensitive_files.csv', 'w', newline='') as csvfile:
    fieldnames = ['url', 'matches']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

    writer.writeheader()
    for file in sensitive_files:
        for match in file['matches']:
            writer.writerow({'url': file['url'], 'matches': match})