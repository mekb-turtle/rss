# rss
A simple RSS client

### Get started
- Clone or download the repository
- Create `list.json` and edit it
- Create an object in the root object, name it whatever you like
- Create a string named `url` in that object, and set it to the URL of the RSS feed in XML 

Example:

    {
      "reddit": {
        "url": "https://reddit.com/.rss"
      }
    }

- Run `node .` to fetch the URLs and send a notification to you every time something is new
- You can set up a system timer to run the script every so often
