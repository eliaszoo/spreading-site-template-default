#!/usr/bin/python
import json
import subprocess
import os
import getopt, sys

def clone(location):
    print("clone")

def rename(site):
    with open("package.json", 'r') as file:
        data = json.load(file)
        data["name"] = site

    with open("package.json", 'w') as file:
        json.dump(data, file, indent=4)



if __name__ == '__main__':
    try:
        opts, args = getopt.getopt(sys.argv[1:], "s:b:", ["site=", "base-domain="])
    except getopt.GetoptError as err:
        print("usage -s <site> -b <base-domain>")
        print(err)
        sys.exit(2)
    
    for o, a in opts:
        if o in ("-s", "--site"):
            site = a
        elif o in ("-b", "--base-domain"):
            base = a
        else:
            assert False, "unhandled option"

    with open("site.json", encoding="utf-8") as f:
        list = json.load(f)

    print(list)
    # clone projects
    projList = []
    for item in list:
        if item["id"] == site:
            for proj in item["projects"]:
                name = site + "_" + proj
                projList.append(name)
                clone(base + name)
    
    # cp docs
    for proj in projList:
        subprocess.call(["cp", "-r", base + proj + "/docs", base + "docs/" + proj])
        subprocess.call("aws s3 cp myDir s3://mybucket/ --recursive")
        
    # build