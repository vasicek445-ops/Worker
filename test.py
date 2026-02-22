import requests
response = requests.get("https://arbeitnow.com/api/job-board-api")
print(response.status_code)
print(response.text[:500])



