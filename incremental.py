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


if __name__ == '__main__':
    try:
        opts, args = getopt.getopt(sys.argv[1:], "w:s:p:b:t:f:o:", 
                                   ["workspace=", "site=", "project=", "base-domain=", "token=", "files=", "output-folder="])
    except getopt.GetoptError as err:
        print("usage -w <workspace> -s <site> -p <project> -b <base-domain> -t <token>, -f <files>, -o <output-folder>")
        print(err)
        sys.exit(2)
    
    print(opts)
    for o, a in opts:
        if o in ("-w", "--workspace"):
            workspace = "spreading_"+a
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

    print(files)

    # clone project
    clone(base + workspace + "_" + project, token)

    update_files = json.loads(files)
    print(update_files)
    for file in update_files:
        subprocess.call(["aws", "s3", "cp", workspace + "_" + project + file["path"], "s3://spreading-test/"+workspace+"/"+workspace + "_" + project+file["path"]])