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

def report_build_status(url, code, msg):
    print("code: " + str(code) + ", msg: " + msg)
    subprocess.call(["curl", "-X", "POST", "-H", "Content-Type: application/json", "-d", '{"code":'+str(code)+',"msg":"'+msg+'"}', url])

if __name__ == '__main__':
    try:
        opts, args = getopt.getopt(sys.argv[1:], "w:s:b:t:c:", ["workspace=", "site=", "base-domain=", "token=", "callback-url="])
    except getopt.GetoptError as err:
        print("usage -w <workspace> -s <site> -b <base-domain> -t <token> -c <callback-url>")
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
        elif o in ("-c", "--callback-url"):
            callback_url = a
        else:
            assert False, "unhandled option"


    try:
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
        report_build_status(callback_url, 0, "success")
    except Exception as e:
        report_build_status(callback_url, 500, str(e))
        sys.exit(2)