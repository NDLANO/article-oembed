/**
 * Copyright (c) 2016-present, NDLA.
 *
 * This source code is licensed under the GPLv3 license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { fetchOembed } from '../api/oembedProxyApi';
import { wrapInFigure } from './pluginHelpers';

export default function createH5pPlugin() {
  const fetchResource = (embed, accessToken) =>
    embed.data.url.startsWith('https://ndlah5p.joubel.com')
      ? fetchOembed(embed, accessToken)
      : embed;

  const embedToHTML = h5p => {
    if (h5p.oembed) {
      return wrapInFigure(h5p.oembed.html, false);
    }
    return wrapInFigure(
      `<iframe title="${h5p.data.url}" aria-label="${h5p.data.url}" src="${
        h5p.data.url
      }"></iframe>`,
      false
    );
  };

  return {
    resource: 'h5p',
    fetchResource,
    embedToHTML,
  };
}
