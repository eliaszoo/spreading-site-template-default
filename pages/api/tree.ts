import fs from "fs";
import path from "path";

const docDirectory = path.join(process.cwd(), "./_docs");

const getFullTreeDataRecursively = (dirPath, children)  => {
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

export default function handler(req, res) {
  try {
    const fullTreeData = getFullTreeData();
    res.status(200).send({ result: fullTreeData })
  } catch (err) {
    res.status(500).send({ error: 'failed to fetch data' })
  }
}