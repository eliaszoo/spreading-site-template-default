import { getMDXComponent } from "mdx-bundler/client";
import { useMemo } from "react";
import { getAllDocsInfo, getDocData } from "../../lib/docs";

export const getStaticProps = async ({ params }) => {
  const postData = await getDocData(params.slug);
  return {
    props: {
      ...postData,
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

export default function DocPage({ code, frontmatter }) {
  const Component = useMemo(() => getMDXComponent(code), [code]);

  return (
    <div className="prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none">
      <h1>{frontmatter.title}</h1>
      <p>{frontmatter.description}</p>
      <p>{frontmatter.date}</p>
      <article>
        <Component />
      </article>
    </div>
  );
}
