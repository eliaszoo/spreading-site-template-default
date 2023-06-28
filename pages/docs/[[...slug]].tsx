import { getMDXComponent } from "mdx-bundler/client";
import { useMemo } from "react";
import { getAllDocsInfo, getDocData, getFullTreeData } from "../../lib/docs";
import PreviewLayout from "../../components/preview-layout";

export const getStaticProps = async ({ params }) => {
  const fullTreeData = getFullTreeData();
  const postData = await getDocData(params.slug);
  return {
    props: {
      ...postData,
      fullTreeData,
    },
    revalidate: 10, // In seconds
  };
};

export async function getStaticPaths() {
  const allDocsInfo = getAllDocsInfo();
  const paths = allDocsInfo.mdxSlugs;
  return {
    paths,
    fallback: false,
  };
}

export default function DocPage({ code, frontmatter, slug, fullTreeData }) {
  const Component = useMemo(() => getMDXComponent(code), [code]);

  return (
    <div className="prose" style={{ maxWidth: "unset" }}>
        <h1>{frontmatter.title}</h1>
        <p>{frontmatter.description}</p>
        <p>{frontmatter.date}</p>
        <article>
          <Component />
        </article>
    </div>
  );
}

DocPage.getLayout = function getLayout(page, pageProps) {
  return (
    <PreviewLayout {...pageProps}>{page}</PreviewLayout>
  )
}