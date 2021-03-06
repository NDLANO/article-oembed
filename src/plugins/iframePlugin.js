/**
 * Copyright (c) 2018-present, NDLA.
 *
 * This source code is licensed under the GPLv3 license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { makeIframe } from './pluginHelpers';

export default function createIframePlugin() {
  const embedToHTML = embed => {
    const { url, width, height } = embed.data;
    return makeIframe(url, width, height);
  };

  return {
    resource: 'iframe',
    embedToHTML,
  };
}
