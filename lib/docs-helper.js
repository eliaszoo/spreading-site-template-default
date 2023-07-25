import SiteConfig from "../site.json"

export async function getProjectNames() {
    const resProjects = await fetch(SiteConfig.doc_url + "projects.json")
    return await resProjects.json()
}

export async function getVersions(projectName, isPreview) {
    const resVersions = await fetch(SiteConfig.doc_url  + projectNameToProjectID(projectName) + getPreviewPrefix(isPreview) + '/versions.json')
    return await resVersions.json()
}

export async function getStructure(projectName, version, isPreview) {
    const resStructure = await fetch(SiteConfig.doc_url + projectNameToProjectID(projectName) + getPreviewPrefix(isPreview) + '/' + version + '/structure.json')
    return await resStructure.json()
}

export function getMdxURL(projectName, version, fileName, isPreview) {
    return SiteConfig.doc_url + projectNameToProjectID(projectName) + getPreviewPrefix(isPreview) + '/' + version + "/docs/" + fileName + ".mdx"
}

export function getMdxContent(projectName, version, fileName, isPreview) {
    return fetch(getMdxURL(projectName, version, fileName, isPreview))
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