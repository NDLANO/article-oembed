/**
 * Copyright (c) 2016-present, NDLA.
 *
 * This source code is licensed under the GPLv3 license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { replaceEmbedsInHtml, addClassToTag, replaceStartAndEndTag } from './replacer';
import { getEmbedsFromHtml } from './parser';
import { extractCopyrightInfoFromEmbeds } from './extractCopyrightInfo';
import plugins from './plugins';

// Changes aside tags to accommodate frontend styling
export const asideReplacers = [
  replaceStartAndEndTag('aside', '<aside><div class="c-aside__content">', '</div><button class="c-button c-aside__button"></button></aside>'),
  addClassToTag('aside', 'c-aside u-1/3@desktop'),
];

export async function transformContentAndExtractCopyrightInfo(content, lang, requiredLibraries) {
  const embeds = await getEmbedsFromHtml(content, plugins);
  const embedsWithResources = await Promise.all(embeds.map((embed) => {
    const plugin = plugins.find(p => p.resource === embed.resource);
    if (plugin && plugin.fetchResource) {
      return plugin.fetchResource(embed);
    }
    return embed;
  }));

  const replacers = [
    ...asideReplacers,
    replaceEmbedsInHtml(embedsWithResources, lang, requiredLibraries, plugins),
  ];


  return {
    html: replacers.reduce((html, f) => f(html), content),
    copyrights: extractCopyrightInfoFromEmbeds(embedsWithResources),
  };
}
