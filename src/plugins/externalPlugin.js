/**
 * Copyright (c) 2016-present, NDLA.
 *
 * This source code is licensed under the GPLv3 license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { fetchOembed } from '../api/oembedProxyApi';
import { wrapInFigureEmbedded } from './pluginHelpers';

export default function createExternalPlugin() {
  const fetchResource = (embed, headers) => fetchOembed(embed, headers);

  const embedToHTML = embed => wrapInFigureEmbedded(embed.oembed.html);

  return {
    resource: 'external',
    fetchResource,
    embedToHTML,
  };
}
