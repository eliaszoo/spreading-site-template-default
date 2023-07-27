import Post from "../interfaces/post";
import { useEffect } from "react";
import Router from "next/router";

export default function Index(props) {

  useEffect(() => {
    const isPreview = window.location.href.endsWith("/preview") || window.location.href.includes('/preview/');
    const url = new URL('/api/tree', window.location.href);
    url.searchParams.append("isPreview",isPreview ? "true" : "false")

    const findFirstFileKey = (node) => {
      if (node.children) {
        return findFirstFileKey(node.children[0]);
      } else if (node) {
        return node.key
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
            const firstFileKey = firstPlatform && findFirstFileKey(firstPlatform.children[0])
            if (firstFileKey) {
              Router.push("docs/" + firstFileKey);
            }
        });
    });
}, []);
  
  return (
    <div/>
  );
}
