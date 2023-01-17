import fs from "fs/promises";
import html from "remark-html";
import matter from "gray-matter";
import path from "path";
import { remark } from "remark";

export interface PostData {
  title: string;
  category: string;
  description: string;
  postedAt: number;
  updatedAt: number;
}

const POSTS_DIR = "posts";

export const getPostFrontMatter = (filename: string) => {
  const { data } = matter(filename);
  Object.keys(data).forEach((key) => {
    if (data[key] instanceof Date) {
      data[key] = data[key].getTime() / 1000;
    }
  });
  return data as PostData;
};

export const processFileSlug = (filename: string) => {
  return filename.replace(".md", "");
};

export const getPosts = async () => {
  const filenames = (await fs.readdir("posts")) as [string, ...string[]];
  const files: string[] = [];
  for (const filename of filenames) {
    files.push(await fs.readFile(path.join(POSTS_DIR, filename), "utf-8"));
  }
  const fileData = files.map((file, index) => ({
    slug: processFileSlug(filenames[index]),
    data: {
      ...getPostFrontMatter(file)
    }
  }));
  fileData.sort((a, b) => b.data.postedAt - a.data.postedAt);
  return fileData;
};

export const processMarkdownFile = async (filename: string) => {
  const file = await fs.readFile(path.join(POSTS_DIR, filename), "utf-8");
  const { content, data } = matter(file);
  const processedContent = await remark().use(html).process(content);
  return {
    content: processedContent.toString(),
    data
  } as {
    content: string;
    data: PostData;
  };
};
