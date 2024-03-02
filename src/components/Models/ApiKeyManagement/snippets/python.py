import base64
import requests


api_key = "your-api-key"

image_path = "/path/to/image"
with open(image_path, "rb") as f:
    image_data = base64.b64encode(f.read())

url = "{url}"
json = {"image": {"base64": image_data.decode("utf-8")}}
headers = {"Authorization": f"ApiKey {api_key}"}

result = requests.post(url, json=json, headers=headers)
print(result.json())
