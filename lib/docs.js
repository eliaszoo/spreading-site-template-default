import fs from "fs";
import path from "path";
import { bundleMDX } from "mdx-bundler";

const docDirectory = path.join(process.cwd(), "./_docs");

function traverseDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  const result = [];

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const isDirectory = fs.statSync(filePath).isDirectory();

    if (isDirectory) {
      result.push(...traverseDirectory(filePath));
    }

    result.push({
      path: filePath.replace(docDirectory + '/', ''),
      isDirectory: isDirectory
    });
  });

  return result;
}

function getFullTreeDataRecursively(dirPath, children) {
  console.log('getFullTreeDataRecursively', dirPath);
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
      if (file !== '_meta.json') {
        children.push({
          title: file.replace(/\.mdx$/, ''),
          type: "file",
          key,
        });
      }
    }
  });
}

export function getAllDocsInfo() {
  const files = traverseDirectory(docDirectory);
  console.log('files: ', files)
  const mdxNames = files.filter((fileObj) => fileObj.path.endsWith(".mdx"));
  const mdxSlugs = mdxNames.map((fileObj) => {
    return {
      params: {
        slug: fileObj.path.replace(/\.mdx$/, '').split('/'),
      },
    };
  });

  return {
    mdxSlugs,
    files
  }
}

export async function getDocData(slug) {
  const fullPath = path.join(docDirectory, `${slug.join('/')}.mdx`);
  const content = fs.readFileSync(fullPath, "utf8");

  const { code, frontmatter } = await bundleMDX({
    source: content,
  });

  return {
    slug,
    frontmatter,
    code,
  };
}

export function getFullTreeData() {
  const fullTreeData = [];
  getFullTreeDataRecursively(docDirectory, fullTreeData);
  return fullTreeData;
}