import fs from "fs";
import path from "path";
import { getProjectNames, getVersions, getStructure } from "../../lib/docs-helper"

const docDirectory = path.join(process.cwd(), "./_docs");

const getFullTreeDataRecursively = (dirPath, children) => {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const isDirectory = fs.statSync(filePath).isDirectory();
    const key = filePath.replace(docDirectory + '/', '').replace(/\.mdx$/, '');
    if (isDirectory) {
      const temp = {
        title: file,
        type: "folder",
        key,
        children: [],
      };
      children.push(temp);
      getFullTreeDataRecursively(filePath, temp.children);
    } else {
      if (file !== '_meta.json' && file !== '.DS_Store') {
        children.push({
          title: file.replace(/\.mdx$/, ''),
          type: "file",
          key,
        });
      }
    }
  });
}

const getFullTreeData = () => {
  const fullTreeData = [];
  getFullTreeDataRecursively(docDirectory, fullTreeData);
  return fullTreeData;
}

const getChildrenFromToc = (prefixKey: string, structureToc: any) => {
  const childs = []
  for (const item of structureToc) {
    if (item.toc) {
      const children = getChildrenFromToc(prefixKey + "/" + item.name, item.toc)
      childs.push({
        title: item.name,
        type: "folder",
        key: prefixKey + "/" + item.name,
        children
      })
    } else {
      var key = item.uri
      if (item.type === 'file') {
        key = prefixKey + "/" + item.uri.split('/').pop().replace(/\.[^/.]+$/, "")
        key = key + "/" + item.name
      }
      childs.push({
        title: item.name,
        type: item.type,
        key,
      })
    }

  }
  return childs
}

const getStructureFullTreeData = async () => {
  const tree = [];
  const projectNames = await getProjectNames();
  for (const projectName of projectNames) {
    const projectObj = {
      title: projectName,
      type: "folder",
      key: projectName,
      children: []
    }
    const versions = await getVersions(projectName);
    for (const version of versions) {
      const versionObj = {
        title: version,
        type: "folder",
        key: `${projectName}/${version}`,
        children: []
      }

      const structure = await getStructure(projectName, version);
      const collectionGroups = structure.collection_group
      for (const group of collectionGroups) {
        const languageObj = {
          title: group.name,
          type: "folder",
          key: `${projectName}/${version}/${group.key.toLowerCase()}`,
          children: []
        }
        // collection id list
        const platforms = group.values
        for (const platform of platforms) {
          // Don't show group name if there is only one
          const prefixGroupName = collectionGroups.length > 1 ? "/" + group.key.toLowerCase() : "";
          const collection = structure.collections.find((c: { id: string; }) => c.id === platform) || {};
          // Don't show collection name if there is only one
          const prefixCollectionName = structure.collections.length > 1 ? "/" + collection.name : "";
          const platformObj = {
            title: collection.name,
            type: "folder",
            key: `${projectName}/${version}/${group.key}/${collection.name}`,
            children: getChildrenFromToc(projectName + "/" + version + prefixGroupName + prefixCollectionName, collection.toc)
          }

          languageObj.children.push(platformObj)
        }

        versionObj.children.push(languageObj)
      }

      projectObj.children.push(versionObj)
    }

    tree.push(projectObj)
  }

  return tree;
}


export default async function handler(req, res) {
  try {
    const fullTreeData = await getStructureFullTreeData();
    res.status(200).send({ result: fullTreeData })
  } catch (err) {
    res.status(500).send({ error: 'failed to fetch data' })
  }
}