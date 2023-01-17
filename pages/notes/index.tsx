import { Listbox } from "@headlessui/react";
import { UilAngleDown } from "@iconscout/react-unicons";
import type { GetServerSideProps, GetStaticProps, NextPage } from "next";
import Link from "next/link";
import React, { useState } from "react";
import { getPosts, type PostData } from "../../utils/posts";

const NotesIndexPage: NextPage<{
  posts: {
    slug: string;
    data: PostData;
  }[];
}> = ({ posts }) => {
  return (
    <main className="page-container">
      <div className="max-w-4xl py-32 mx-auto">
        <h2 className="text-xl font-bold tracking-wide text-center md:text-3xl font-display text-zinc-600 dark:text-zinc-300">
          Bonjour!
        </h2>
        <h3 className="text-3xl font-bold text-center text-black md:text-6xl font-display dark:text-white">
          Notes &amp; Things
        </h3>
      </div>

      <section>
        <div className="section-body">
          {posts.map((post) => (
            <article className="px-6 py-4 space-y-2 border-2 rounded-lg hover:border-emerald-600/50 dark:hover:border-emerald-400/50 bg-zinc-100 dark:bg-zinc-700 dark:border-zinc-600/50 border-zinc-300/50 group">
              <Link href={`/notes/${post.slug}`} passHref>
                <a className="text-2xl font-bold tracking-wide group-hover:underline group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                  <h3>{post.data.title}</h3>
                </a>
              </Link>
              <p
                style={{
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 3,
                  overflow: "hidden"
                }}
              >
                {post.data.description}
              </p>
              <div className="flex items-center justify-between">
                <p className="text-zinc-600 dark:text-zinc-300">
                  {new Date(post.data.postedAt * 1000).toLocaleDateString()}
                </p>

                <p className="px-4 py-1 mt-2 mr-2 rounded-full bg-zinc-200/50 dark:bg-zinc-600">
                  {post.data.category}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const posts = await getPosts();
  return {
    props: {
      posts
    }
  };
};

export default NotesIndexPage;
