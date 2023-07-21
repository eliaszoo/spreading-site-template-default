#!/usr/bin/env python
# -*- coding: utf-8 -*-

import subprocess
import os

# 仓库地址和本地保存路径
repo_url = 'https://github.com/eliaszoo/spreading_1_1.git'
#repo_url = repo_url.replace("https://", "https://" + "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" + "@")
local_dir = 'spreading_1_1'

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

if __name__ == '__main__':
    clone_all_branch(repo_url, "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", local_dir)