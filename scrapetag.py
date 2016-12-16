#!/usr/bin/env python

from selenium import webdriver
from BeautifulSoup import BeautifulSoup
import random
import json
import re
from time import sleep


class Scraper(object):
    def __init__(self):
        print("Scraper initialized")
        self.driver = webdriver.PhantomJS()

    def __del__(self):
        print("Scraper destroyed")
        self.driver.quit()

    def scrape(self,url):
        self.driver.get(url)
        print("Retrieval done")
        self.soup = BeautifulSoup(self.driver.page_source)

        try:
            with open('imgs.json', 'r') as f:
                srcs = json.load(f)
                if len(srcs) > 500:
                    f.truncate()
                    srcs = []
                    print("Resetting image db")
                else:
                    print("Loaded %i images from db on file" % len(srcs))
        except:
            srcs = []

        # retrieves all img tags under "most recent"
        imgs = self.soup.find(lambda t: t.text.lower() == "most recent").nextSibling.findAll("img")

        added = 0
        for i in imgs:
            src = re.sub('s[0-9x]+/|c[0-9.]+/','',dict(i.attrs)['src'])
            if src not in srcs:
                srcs.append(src)
                added += 1

        print("Added %i images from scraping instagram" % added)

        with open('imgs.json', 'w') as f:
            f.write(json.dumps(srcs))


if __name__ == "__main__":        
    tags = [
        "cats"
#         "meow",
#         "dogs",
#         "pupper",
#         "doggo"
    ]
    while(True):
        scraper = Scraper()
        tag = random.choice(tags)
        print("Choosing from tag #%s" % tag)
        scraper.scrape("https://www.instagram.com/explore/tags/" + tag)
        del(scraper)
        sleep(30)
