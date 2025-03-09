import json


if __name__ == "__main__":

    with open("./app/public/data/municipalities.json") as json_file:
        data = json.load(json_file)["features"]
        municipalities = [item["properties"]["ONIMI"] for item in data]
