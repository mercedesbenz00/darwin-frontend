import requests


api_key = "your-api-key"

json = {"name": "My Dataset"}
headers = {"Authorization": f"ApiKey {api_key}"}
url = "https://darwin.v7labs.com/api/datasets"

result = requests.post(url, json=json, headers=headers)
print(result.json())
