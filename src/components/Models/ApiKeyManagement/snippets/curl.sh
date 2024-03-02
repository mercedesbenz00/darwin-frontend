apiKey="your-api-key"
image_data=$(base64 /path/to/image)

curl \
  -X POST "{url}" \
  -b "{image: { base64: '$image_data'} }" \
  -H "Authorization: ApiKey '$apiKey'"
