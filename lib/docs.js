import { bundleMDX } from "mdx-bundler";
import { getMdxContent, getProjectNames, getStructure, getVersions } from "./docs-helper"

const PREVIEW_KEY = "preview"

// e.g. https://diggingking123.spreading.io/docs/123/main/en_us/android/Untitled/FAQ/9047c002/preview
function traverseToc(toc, preSlug, projectID, version, isPreview) {
  const result = []
  for (const item of toc) {
    if (item.toc) {
      result.push(...traverseToc(item.toc, preSlug.concat(item.name), projectID, version, isPreview))
    } else if (item.type == "file") {
      // Unpublished files will be ignored.
      if (item.attributes.status === "Draft" && !item.attributes.published_hash) continue;

      const itemSlug = item.uri.replace(/\.mdx$/, '').split('/')
      itemSlug.shift()
      const fileID = itemSlug.pop()
      const previewSlug = isPreview? [PREVIEW_KEY] : []
      const slug = [...preSlug, ...itemSlug, item.name, fileID, ...previewSlug]//preSlug.concat(itemSlug)
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

async function getSlugs(project, isPreview) {
  let slugs = []

  let versions = []
  try {
    versions = await getVersions(project, isPreview)
  } catch (error) {
    console.log(`[${project}][${isPreview}] getSlugs failed while getting versions: ${error}`)
  }
  for (const version of versions) {
    const structure = await getStructure(project, version, isPreview)
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
      const languageSlug = collectionGroups.length > 1 ? [groupKey.toLowerCase()] : []
      for (const collection of groupCollections) {
        const platformSlug = groupCollections.length > 1 ? [collection.name] : []
        slugs = slugs.concat(traverseToc(collection.toc, [projectName, version, ...languageSlug, ...platformSlug], structure.id, version, isPreview))
      }
    }
  }

  return slugs
}
export async function getAllSlugs() {
  var slugs = []

  const projects = await getProjectNames()
  for (const project of projects) {
    const publicSlugs = await getSlugs(project, false)
    const previewSlugs = await getSlugs(project, true)
    slugs = slugs.concat(publicSlugs)
    slugs = slugs.concat(previewSlugs)
  }

  console.log(">>>>>>>>>>>>>>>>>>>>>>>>> slugs: ", JSON.stringify(slugs))
  return slugs
}

export async function readDoc(slug) {
  const projectName = slug[0]
  const isPreview = slug[slug.length - 1] === PREVIEW_KEY
  const version = slug[1]
  const mdxFileName = isPreview ? slug[slug.length - 2] : slug[slug.length - 1]
  const mdxContent = await getMdxContent(projectName, version, mdxFileName, isPreview)
  const { code, frontmatter } = await bundleMDX({
    source: mdxContent,
  });

  return {
    slug,
    frontmatter,
    code,
  };
}