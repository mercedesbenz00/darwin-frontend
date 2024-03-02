{:ok, content} = "/path/to/image" |> File.read()
base64 = Base.encode64(content)
body = %{image: %{base64: base64}}

token = "your-api-key"
url = "{url}"
headers = [{"Authorization", "ApiKey #{token}"}]

HTTPoison.start()
HTTPoison.post(url, body, headers)
