#!/usr/bin/env python
# -*- coding: utf-8 -*-
import json
import subprocess
import os
import getopt, sys

def clone(location, token):
    location = location.replace("https://", "https://" + token + "@")
    subprocess.call(["git", "clone", location, "--recurse-submodules", "--depth", "1"])

def report_build_status(url, code, msg, workspace, site):
    print("code: " + str(code) + ", msg: " + msg)
    body = '{"code":'+str(code)+',"msg":"'+msg+'","workspace":'+str(workspace)+',"site":'+str(site)+'}'
    subprocess.call(["curl", "-X", "POST", "-H", "Content-Type: application/json", "-d", body, url])   

if __name__ == '__main__':
    try:
        opts, args = getopt.getopt(sys.argv[1:], "w:s:p:b:t:f:o:c:l:", 
                                   ["workspace=", "site=", "project=", "base-domain=", "token=", "files=", "output-folder=", "callback-url=", "structure-copy-list="])
    except getopt.GetoptError as err:
        print("usage -w <workspace> -s <site> -p <project> -b <base-domain> -t <token> -f <files> -o <output-folder> -c <callback-url> -l <structure-copy-list>")
        print(err)
        sys.exit(2)
    
    #print(opts)
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
        elif o in ("-p", "--project"):
            project = a
        elif o in ("-f", "--files"):
            files = a
        elif o in ("-o", "--output-folder"):
            output_folder = a
        elif o in ("-c", "--callback-url"):
            callback_url = a
        elif o in ("-l", "--structure-copy-list"):
            structure_copy_list = a

    print(files)

    try:
        # clone project
        clone(base + workspace + "_" + project, token)

        update_files = json.loads(files)
        print(update_files)
        # copy files 2 s3
        for version, files in update_files.items():
            s_path = workspace + "_" + project + "/docs/"+version+"/"
            t_path = workspace+"/"+workspace + "_" + project + "/"+"/"+version+"/"
            for file in files:
                subprocess.call(["aws", "s3", "cp", s_path + file, "s3://zego-spreading/"+t_path+file])

        # 处理structure文件
        structure_list = json.loads(structure_copy_list)
        for version, data in structure_list.items():
            structure_file = workspace + "_" + project + "/docs/"+version+"/structure.collections"
            for toc in data:
                



        report_build_status(callback_url, 0, "success", i_ws, site)
    except Exception as e:
        report_build_status(callback_url, 500, str(e), i_ws, site)
        sys.exit(2)