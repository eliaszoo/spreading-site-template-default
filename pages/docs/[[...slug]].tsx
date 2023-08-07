import { getMDXComponent } from "mdx-bundler/client";
import { useMemo } from "react";
import { getAllSlugs, readDoc } from "../../lib/docs";
import PreviewLayout from "../../components/preview-layout";

export const getStaticProps = async ({ params }) => {
  console.log('[Spreading] getStaticProps:', params)
  const postData = await readDoc(params.slug);
  return {
    props: {
      ...postData,
    },
    revalidate: 10, // In seconds
  };
};

export async function getStaticPaths() {
  console.log('[Spreading] getStaticPaths...')
  const paths = await getAllSlugs();
  return {
    paths,
    fallback: false,
  };
}

export default function DocPage({ code, frontmatter, slug }) {
  console.log('[Spreading] DocPage: ', slug, frontmatter)
  const Component = useMemo(() => getMDXComponent(code), [code]);

  return (
    <div className="prose" style={{ maxWidth: "unset" }}>
      <h1>{frontmatter.title}</h1>
      <p>{frontmatter.description}</p>
      <p>{frontmatter.date}</p>
      <article className="editor-wrapper">
        <Component />
      </article>
    </div>
  );
}

DocPage.getLayout = function getLayout(page, pageProps) {
  return <PreviewLayout {...pageProps}>{page}</PreviewLayout>;
};
