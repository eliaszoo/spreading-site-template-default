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