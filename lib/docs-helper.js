import SiteConfig from "../site.json"

export async function getProjectNames() {
    const projects = SiteConfig.projects
    const projectNames = projects.map(project => project.name)
    return projectNames
}

export async function getVersions(projectName, isPreview) {
    const url = SiteConfig.doc_url + projectNameToProjectID(projectName) + getPreviewPrefix(isPreview) + '/versions.json'
    console.log("[Spreading][getVersions] URL: ", url)
    const resVersions = await fetch(url)
    return await resVersions.json()
}

export async function getStructure(projectName, version, isPreview) {
    const url = SiteConfig.doc_url + projectNameToProjectID(projectName) + getPreviewPrefix(isPreview) + '/' + version + '/structure.json'
    console.log("[Spreading][getStructure] URL: ", url)
    const resStructure = await fetch(url)
    return await resStructure.json()
}

export function getMdxContent(projectName, version, fileName, isPreview) {
    const url = SiteConfig.doc_url + projectNameToProjectID(projectName) + getPreviewPrefix(isPreview) + '/' + version + "/docs/" + fileName + ".mdx"
    console.log("[Spreading][getMdxContent] URL: ", url)
    return fetch(url)
        .then(res => res.text())
}

function projectNameToProjectID(projectName) {
    const projects = SiteConfig.projects
    for (const project of projects) {
        if (project.name === projectName) {
            return project.id
        }
    }
    return ""
}

function getPreviewPrefix(isPreview) {
    return isPreview ? "/preview" : "/public"
}