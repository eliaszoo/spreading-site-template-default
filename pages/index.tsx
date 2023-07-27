import Post from "../interfaces/post";
import { useEffect } from "react";
import Router from "next/router";

export default function Index(props) {

  useEffect(() => {
    const url = new URL('/api/tree', window.location.href);
    url.searchParams.append("isPreview", "false")

    const findFirstFileKey = (node) => {
      if (node && node.children && node.children.length > 0) {
        for (const child of node.children) {
          if (child.type === "file") {
            return child.key
          } else if (child.type === "folder") {
            const firstFileKey = findFirstFileKey(child)
            if (firstFileKey) {
              return firstFileKey
            }
          }
        }

      }
      return undefined;
    }
    fetch(url).then((response) => {
      response.json().then(({ result }) => {
        console.log('fetch fullTreeData', result);
        const firstProject = result[0]
        const firstVersion = firstProject.children[0]
        const firstLanguage = firstVersion && firstVersion.children[0]
        const firstPlatform = firstLanguage && firstLanguage.children[0]
        const firstFileKey = firstPlatform && findFirstFileKey(firstPlatform)
        console.log('firstFileKey', firstFileKey);
        if (firstFileKey) {
          Router.push("docs/" + firstFileKey);
        }
      });
    });
  }, []);

  return (
    <div />
  );
}
