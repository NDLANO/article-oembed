/**
 * Copyright (c) 2016-present, NDLA.
 *
 * This source code is licensed under the GPLv3 license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import log from './utils/logger';
import Brightcove from './markup/Brightcove';
import Image from './markup/Image';
import H5P from './markup/H5P';
import { ndlaFrontendUrl } from './config';

function createEmbedMarkup(embed, lang) {
  switch (embed.resource) {
    case 'image':
      return renderToStaticMarkup(<Image align={embed.align} caption={embed.caption} image={embed.image} lang={lang} />);
    case 'brightcove':
      return renderToStaticMarkup(<Brightcove video={embed} />);
    case 'h5p':
      return renderToStaticMarkup(<H5P h5p={embed} />);
    case 'content-link':
      return `<a href="${ndlaFrontendUrl}/${lang}/article/${embed.contentId}">${embed.linkText}</a>`;
    default:
      log.warn(embed, 'Do not create markup for unknown/external resource');
      return undefined;
  }
}
export function replaceEmbedsInHtml(embeds, html, lang, requiredLibraries) {
  const reEmbeds = new RegExp(/<embed.*?\/>/g);
  const reDataId = new RegExp(/data-id="(.*?)"/);

  const markup = html.replace(reEmbeds, (embedHtml) => {
    const id = embedHtml.match(reDataId)[1];
    const embed = embeds.find(f => f.id.toString() === id);
    return createEmbedMarkup(embed, lang) || '';
  });

  const scripts = requiredLibraries.map(library =>
        `<script type="${library.mediaType}" src="${library.url}"></script>`
      ).join();

  return markup + scripts;
}
