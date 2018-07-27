import cheerio from 'cheerio';
import { fetchArticle } from './api/articleApi';
import { transform } from './transformers';

export async function transformArticle(article, lang, accessToken) {
  const articleContent = article.content.content
    ? cheerio.load(article.content.content)
    : undefined;
  const { html, embedMetaData } = articleContent
    ? await transform(articleContent, lang, accessToken, article.visualElement)
    : {};

  return {
    ...article,
    content: html || '',
    metaData: embedMetaData || '',
    title: article.title.title || '',
    tags: article.tags.tags,
    introduction: article.introduction ? article.introduction.introduction : '',
    metaDescription: article.metaDescription.metaDescription || '',
  };
}

export default async function fetchAndTransformArticle(
  articleId,
  lang,
  accessToken
) {
  const article = await fetchArticle(articleId, accessToken, lang);
  const transformedArticle = await transformArticle(article, accessToken, lang);
  return transformedArticle;
}
