import { getProjectNames, getVersions, getStructure } from "../../lib/docs-helper"


const getChildrenFromToc = (prefixKey: string, structureToc: any, isPreview: Boolean) => {
  const childs = []
  for (const item of structureToc) {
    if (item.toc) {
      const children = getChildrenFromToc(prefixKey + "/" + item.name, item.toc, isPreview)
      if (children.length > 0) {
        childs.push({
          title: item.name,
          type: "folder",
          key: prefixKey + "/" + item.name,
          children
        })
      }

    } else {
      // Unpublished files will be ignored.
      if (item.attributes.status === "Draft" && !item.attributes.published_hash) continue;

      var key = item.uri
      if (item.type === 'file') {
        key = prefixKey + "/" + item.name + "/" + item.uri.split('/').pop().replace(/\.[^/.]+$/, "") + (isPreview ? "/preview" : "")
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

const getStructureFullTreeData = async (isPreview) => {
  const tree = [];
  const projectNames = await getProjectNames();
  for (const projectName of projectNames) {
    const projectObj = {
      title: projectName,
      type: "folder",
      key: projectName,
      children: []
    }
    let versions = []
    try {
      versions = await getVersions(projectName, isPreview)
    } catch (error) {
      console.log(`[${projectName}][${isPreview}] getStructureFullTreeData failed while getting versions: ${error}`)
    }
    for (const version of versions) {
      const versionObj = {
        title: version,
        type: "folder",
        key: `${projectName}/${version}`,
        children: []
      }

      const structure = await getStructure(projectName, version, isPreview);
      console.log("[Spreading][getStructureFullTreeData] structure: ", JSON.stringify(structure))
      
      const languageGroups = structure.collection_group
      for (const group of languageGroups) {
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
          const prefixlanguageName = languageGroups.length > 1 ? "/" + group.key.toLowerCase() : "";
          const collection = structure.collections.find((c: { id: string; }) => c.id === platform) || {};
          // Don't show collection name if there is only one
          const prefixPlatformName = structure.collections.length > 1 ? "/" + collection.name : "";
          const prefixKey = projectName + "/" + version + prefixlanguageName + prefixPlatformName
          const platformObj = {
            title: collection.name,
            type: "folder",
            key: `${projectName}/${version}/${group.key}/${collection.name}`,
            children: getChildrenFromToc(prefixKey, collection.toc, isPreview)
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
    const { isPreview } = req.query;
    const fullTreeData = await getStructureFullTreeData(isPreview === "true");
    res.status(200).send({ result: fullTreeData })
  } catch (err) {
    res.status(500).send({ error: 'failed to fetch data' })
  }
}