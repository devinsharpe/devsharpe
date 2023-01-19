import type { GetStaticProps, NextPage } from "next";
import { PostData, getPosts, processMarkdownFile } from "../../utils/posts";

import Head from "next/head";
import Link from "next/link";
import { ParsedUrlQuery } from "querystring";
import React from "react";

interface NotePageProps {
  slug: string;
  posts: { slug: string; data: PostData }[];
  data: PostData;
  content: string;
}

export interface SlugParams extends ParsedUrlQuery {
  slug: string;
}

const NotePage: NextPage<NotePageProps> = ({ content, data }) => {
  return (
    <>
      <Head>
        <meta name="description" content={data.description} />
        <meta name="author" content="Devin Sharpe" />
        <title>{data.title}&nbsp;&ndash;&nbsp;DevSharpe</title>
      </Head>
      <main className="page-container">
        <article>
          <div className="max-w-4xl py-32 mx-auto">
            <h2 className="text-xl font-bold tracking-wide text-center md:text-3xl font-display text-zinc-600 dark:text-zinc-300">
              &iexcl;Hola!
            </h2>
            <h3 className="text-3xl font-bold text-center text-black md:text-6xl font-display dark:text-white">
              {data.title}
            </h3>
            <h3 className="mt-4 text-lg text-center md:text-xl text-zinc-600 dark:text-zinc-300">
              {data.description}
            </h3>
          </div>
          <div
            dangerouslySetInnerHTML={{ __html: content }}
            className="p-4 prose prose-zinc prose-pre:bg-zinc-100 prose-code:text-zinc-700 dark:prose-pre:bg-zinc-700 prose-pre:border-2 prose-pre:border-zinc-300/50 dark:prose-pre:border-zinc-600/50 dark:prose-code:text-zinc-300 dark:prose-invert lg:max-w-4xl lg:prose-lg xl:prose-xl"
          />
          <div className="px-4 space-y-2 text-sm">
            <p>
              Originally posted on&nbsp;
              {new Date(data.postedAt * 1000).toLocaleDateString()}
            </p>
            {data.postedAt !== data.updatedAt && (
              <p>
                Last updated on &nbsp;
                {new Date(data.updatedAt * 1000).toLocaleDateString()}
              </p>
            )}
            <div className="flex items-center space-x-2 text-zinc-600 dark:text-zinc-300">
              <Link href="/notes" passHref>
                <a className="underline text-zinc-">Notes</a>
              </Link>
              <span>&#47;</span>
              <p className="truncate">{data.title}</p>
            </div>
          </div>
        </article>
      </main>
    </>
  );
};

export const getStaticProps: GetStaticProps<
  NotePageProps,
  SlugParams
> = async ({ params }) => {
  const posts = await getPosts();
  return {
    props: {
      ...(await processMarkdownFile(params?.slug + ".md")),
      posts,
      slug: params?.slug || ""
    }
  };
};

export const getStaticPaths = async () => {
  const posts = await getPosts();
  return {
    paths: posts.map((post) => ({
      params: {
        slug: post.slug
      }
    })),
    fallback: false
  };
};

export default NotePage;
