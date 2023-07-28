#!/usr/bin/env python
# -*- coding: utf-8 -*-
import json
import subprocess
import os
import getopt, sys

def clone(location, token):
    location = location.replace("https://", "https://" + token + "@")
    print(location)
    subprocess.call(["git", "clone", location, "--recurse-submodules", "--depth", "1"])
    print("clone "+ location)

# clone所有分支到本地
def clone_all_branch(location, token, dir):
    print("dir:"+dir)
    location = location.replace("https://", "https://" + token+"@")
    subprocess.run(['git', 'clone', '--bare', location, dir], check=True)

    # 获取远程分支列表
    output = subprocess.check_output(['git', 'ls-remote', '--heads', location]).decode().strip()
    branch_list = [line.split('\t')[1].split('refs/heads/')[1] for line in output.split('\n')]
    print(branch_list)

    # 拉取每个分支到不同的目录
    for branch in branch_list:
        branch_dir = f'{branch}'
        print(branch_dir)
        subprocess.run(['git', 'worktree', 'add', branch_dir, branch], cwd=dir, check=True)

    return branch_list

def rename(site):
    with open("package.json", 'r') as file:
        data = json.load(file)
        data["name"] = site

    with open("package.json", 'w') as file:
        json.dump(data, file, indent=4)

def report_build_status(url, code, msg, workspace, site, api_id):
    body = '{"code":'+str(code)+',"msg":"'+msg+'","workspace":'+str(workspace)+',"site":'+str(site)+ ',"api_id":"' + api_id +'"}'
    print(body)
    subprocess.call(["curl", "-X", "POST", "-H", "Content-Type: application/json", "-d", body, url])

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
            i_ws = a
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
        projNames = []
        projBranchs = {}
        domain = ""
        for item in list:
            item["doc_url"] = "https://zego-spreading.s3.ap-southeast-1.amazonaws.com/" + workspace + "/docs/"
            if str(item["id"]) == site:
                domain = item["domain"]
                siteJson = item
                subprocess.call(["cp", "-r", workspace+"/sites/"+site+"/favicon.ico", "./public/favicon"])
                for proj in item["projects"]:
                    projNames.append(proj["name"])
                    proj = str(proj["id"])
                    name = workspace + "_" + proj
                    projList.append(proj)
                    branchs = clone_all_branch(base + name, token, "./"+name)
                    projBranchs[proj] = branchs
        if domain == "":
            report_build_status(callback_url, 500, "invalid domain", i_ws, site, "")
            sys.exit(2)
        
        # 写入本地site.json
        with open("site.json", 'w') as file:
            json.dump(siteJson, file, indent=4)

        print(projList)
        # 写projects.json
        subprocess.call(["mkdir", "-p", "docs"])
        with open("docs/projects.json", 'w') as file:
            json.dump(projNames, file, indent=4)

         # cp docs
        for proj in projList:
            name = proj
            for branch in projBranchs[name]:
                target = "docs/"+name+"/"
                subprocess.call(["mkdir", "-p", target+"public", target+"preview"])
                subprocess.call(["cp", "-r", workspace + "_" + name +"/" + branch, target+"public/"])
                subprocess.call(["cp", "-r", workspace + "_" + name +"/" + branch, target+"preview/"])
            # 写version
            with open("docs/"+name+"/public/versions.json", 'w') as file:
                json.dump(projBranchs[name], file, indent=4)
            subprocess.call(["cp", "docs/"+name+"/public/versions.json", "docs/"+name+"/preview/"])

            subprocess.call(["aws", "s3", "rm", "s3://zego-spreading/"+workspace+"/"+name, "--recursive"])
            subprocess.call(["aws", "s3", "cp", "./docs/"+name, "s3://zego-spreading/"+workspace+"/docs/"+name, "--recursive", "--acl", "public-read"])
            subprocess.call(["aws", "s3", "cp", "docs/projects.json", "s3://zego-spreading/"+workspace+"/docs/", "--acl", "public-read"])

        # rename
        rename(workspace+"_"+site)
        #rename_stack(workspace+"_"+site)

        # 制品目录，先清理下历史制品
        products_dir = workspace+"_products/"+site
        subprocess.call(["aws", "s3", "rm", "s3://zego-spreading/"+products_dir, "--recursive"])

        # build
        subprocess.call(["sam", "build"])
        stack = workspace.replace("_", "-")+"-"+site
        subprocess.call(["sam", "deploy", "--stack-name", stack, "--s3-bucket", "zego-spreading", "--s3-prefix", products_dir])

        # 读取api id
        api_id = subprocess.check_output(["aws", "cloudformation", "describe-stacks", "--stack-name", stack, "--query", "Stacks[0].Outputs[?OutputKey==`ApiId`].OutputValue", "--output", "text"])
        api_id = api_id.decode("utf-8").rstrip("\n\t\r")
        print("api_id:", api_id)

        report_build_status(callback_url, 0, "success", i_ws, site, api_id)
    except Exception as e:
        report_build_status(callback_url, 500, str(e), i_ws, site, "")
        sys.exit(2)