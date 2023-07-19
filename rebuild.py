#!/usr/bin/env python
# -*- coding: utf-8 -*-
import json
import subprocess
import os
import getopt, sys
import toml

def clone(location, token):
    location = location.replace("https://", "https://" + token + "@")
    print(location)
    subprocess.call(["git", "clone", location, "--recurse-submodules", "--depth", "1"])
    print("clone "+ location)

def rename(site):
    with open("package.json", 'r') as file:
        data = json.load(file)
        data["name"] = site

    with open("package.json", 'w') as file:
        json.dump(data, file, indent=4)

def rename_stack(site):
    stack = site.replace("_", "-")
    with open('samconfig.toml', 'r') as f:
        data = toml.load(f)

    # 修改内容
    print(data)
    #data['default.deploy.parameters.stack_name'] = site
    data['default']['deploy']['parameters']['stack_name'] = stack
    print(data)

    # 保存修改后的Toml文件
    with open('samconfig.toml', 'w') as f:
        toml.dump(data, f)

if __name__ == '__main__':
    try:
        opts, args = getopt.getopt(sys.argv[1:], "w:s:b:t:", ["workspace=", "site=", "base-domain=", "token="])
    except getopt.GetoptError as err:
        print("usage -w <workspace> -s <site> -b <base-domain> -t <token>")
        print(err)
        sys.exit(2)
    
    for o, a in opts:
        if o in ("-w", "--workspace"):
            workspace = "spreading_"+a
        elif o in ("-s", "--site"):
            site = a
        elif o in ("-b", "--base-domain"):
            base = a
        elif o in ("-t", "--token"):
            token = a
        else:
            assert False, "unhandled option"


    clone(base + workspace, token)
    with open(workspace+"/sites/site.json", encoding="utf-8") as f:
        list = json.load(f)

    print(list)
    # clone projects
    projList = []
    for item in list:
        if item["id"] == site:
            for proj in item["projects"]:
                name = workspace + "_" + proj
                projList.append(name)
                clone(base + name, token)
    
    # cp docs
    for proj in projList:
        name = proj
        subprocess.call(["mkdir", "-p", "docs/"+name])
        subprocess.call(["cp", "-r", name + "/docs", "docs/" + name])
        subprocess.call(["aws", "s3", "cp", name + "/docs", "s3://spreading-test/"+workspace+"/"+name+"/docs", "--recursive"])
        
    # rename
    rename(workspace+"_"+site)
    rename_stack(workspace+"_"+site)

    # build
    subprocess.call(["sam", "build"])
    subprocess.call(["sam", "deploy"])