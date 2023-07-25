#!/usr/bin/env python
# -*- coding: utf-8 -*-
import json

def get_toc(structure, toc_id):
    for file in structure:
        print(file)
        if "toc" in file and file["id"] == toc_id:
            return file
    return {}

def remove_node(structure, toc):
    print("s:", structure)
    #print("t:", toc)
    for file in toc:
        if "toc" in file:
            remove_node(get_toc(structure, file["id"])["toc"], file["toc"])
        else:
            for item in structure:
                if item["uri"] == file["uri"]:
                    structure.remove(item)

if __name__ == '__main__':
    # 处理structure文件
    structure_copy_list = '{"v1.0":[{"id":"fejwao99fh","name":"iOS","toc":[{"type":"link","name":"FAQs","id":"fewajoefwa","attributes":{"status":"Draft"},"uri":"https://www.zegocloud.com/docs/video-call/faqs?platform=android&language=java"},{"name":"Get Started","id":"fewajoefwa","attributes":{"status":"Published"},"toc":[{"type":"file","name":"Quick Start","id":"kvnw3kvla","status":"Draft","uri":"docs/kvnw3kvla.mdx"}]}]}]}'
    structure_list = json.loads(structure_copy_list)
    for version, data in structure_list.items():
        structure_file = "structure.collections"
        with open(structure_file, 'r') as file:
            structure = json.load(file)

        remove_node(structure, data)
        with open(structure_file, 'w') as file:
            json.dump(structure, file, indent=4)