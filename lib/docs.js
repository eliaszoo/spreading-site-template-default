import fs from "fs";
import path from "path";
import { bundleMDX } from "mdx-bundler";
import {getMdxContent, getMdxURL, getProjectNames, getStructure, getVersions} from "./docs-helper"

function traverseToc(toc, preSlug, projectID, version) {
  const result = []
  for (const item of toc) {
    if (item.toc) {
      result.push(...traverseToc(item.toc, preSlug.concat(item.name), projectID, version))
    } else if (item.type == "file") {
      const itemSlug = item.uri.replace(/\.mdx$/, '').split('/')
      itemSlug.shift()
      const fileID = itemSlug.pop()
      const slug = [...preSlug, ...itemSlug, fileID, item.name]//preSlug.concat(itemSlug)
      result.push({
        params: {
          slug,
          projectID,
          version
        }
      })
    }
  }
  return result
}

export async function getAllSlugs() {
  var slugs = []
  
  const projects = await getProjectNames()
  for (const project of projects) {
    const versions = await getVersions(project)
    for (const version of versions) {
      const structure = await getStructure(project, version)
      const projectName = structure.name
      const collectionGroups = structure.collection_group
      const collections = structure.collections
      for (const collectionGroup of collectionGroups) {
        const groupKey = collectionGroup.key
        const groupCollectionIDs = collectionGroup.values
        const groupCollections = []
        for (const collection of collections) {
          if (groupCollectionIDs.includes(collection.id)) {
            groupCollections.push(collection)
          }
        }
        // console.log("collectionGroup:", collectionGroup, 'groupCollections: ', groupCollections)
        // 开始将分组下的uri进行组合
        const slug = [projectName, version]
        const languageSlug = collectionGroups.length > 1 ? [groupKey.toLowerCase()] : []
        for (const collection of groupCollections) {
          const platformSlug = groupCollections.length > 1 ? [collection.name] : []
          slugs = slugs.concat(traverseToc(collection.toc, [...slug, ...languageSlug, ...platformSlug], structure.id, version))
        }
      }
    }
  }

  // console.log(">>>>>>>>>>>>>>>>>>>>>>>>> slugs: ", JSON.stringify(slugs))
  return slugs
}

export async function readDoc(slug) {
  const projectName = slug[0]
  const version = slug[1]
  const mdxContent = await getMdxContent(projectName, version, slug[slug.length - 2])
  const { code, frontmatter } = await bundleMDX({
    source: mdxContent,
  });

  return {
    slug,
    frontmatter,
    code,
  };
}