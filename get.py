import requests
import csv

# Endpoint
url = "https://www.pff.com/api/college/big_board"
params = {
    "season": "2026",
    "version": "3"
}

# Headers
headers = {
    "accept": "application/json, text/plain, */*",
    "sec-ch-ua": '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "accept-language": "en-US,en;q=0.9",
    "referer": "https://www.pff.com/draft/big-board?season=2026",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"
}


# Make the request
response = requests.get(url, headers=headers, params=params, timeout=30)

data = response.json()

players = [
    {
        "rank": idx + 1,                # 1-based rank (list order)
        "name": p["name"],
        "college": p["college"],
        "height": p["height"],
        "weight": p["weight"]
    }
    for idx, p in enumerate(data["players"])
]