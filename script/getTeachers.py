from selenium import webdriver
from selenium.webdriver.common.by import By
import time

teachers = []
driver = webdriver.Chrome("./chromedriver")
driver.get("https://www.lfanet.org/about-us/faculty-staff-directory")
# Scrape teachers
for j in range(1, 10):
    driver.find_element(
        By.CSS_SELECTOR, "a[data-page='" + str(j) + "']").click()
    time.sleep(2)
    all_t = driver.find_elements(
        By.CSS_SELECTOR, "h3.fsFullName > a.fsConstituentProfileLink")
    all_d = driver.find_elements(By.CSS_SELECTOR, "div.fsTitles")
    for i in range(0, len(all_t)):
        teachers.append([all_t[i].text, all_d[i].text])

teacherDict = dict(teachers)
print(teacherDict)
