/**
 * Copyright (c) 2018-present, NDLA.
 *
 * This source code is licensed under the GPLv3 license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import cheerio from 'cheerio';
import { createAside, createFactbox, createTable } from './utils/asideHelpers';

export const moveReactPortals = content => {
  const dialog = cheerio.html(content(`[data-react-universal-portal='true']`));
  content(`[data-react-universal-portal='true']`).remove();
  content('body').append(dialog);
};

export const transformAsides = content => {
  content('aside').each((_, aside) => {
    const isFactAside =
      aside.attribs && aside.attribs['data-type'] === 'factAside';
    if (isFactAside) {
      const factbox = createFactbox(
        {},
        content(aside)
          .children()
          .toString()
      );
      content(aside).after(factbox);
    } else {
      const narrowAside = createAside(
        { narrowScreen: true },
        content(aside)
          .children()
          .toString()
      );

      const wideAside = createAside(
        { wideScreen: true },
        content(aside)
          .children()
          .toString()
      );

      const parent = aside.parent;
      content(aside).after(wideAside);
      if (parent.name === 'section') {
        // Only append duplicate if we are in a section
        content(parent).append(narrowAside);
      }
    }
    content(aside).remove();
  });
};

export const htmlTransforms = [
  transformAsides,
  content => {
    content('math').attr('display', 'block');
  },
  content =>
    content('ol[data-type="letters"]')
      .removeAttr('data-type')
      .addClass('ol-list--roman'),
  content =>
    content('ul[data-type="two-column"]')
      .removeAttr('data-type')
      .addClass('o-list--two-columns'),
  content =>
    content('p[data-align="center"]')
      .removeAttr('data-align')
      .addClass('u-text-center'),
  moveReactPortals,
  content =>
    content('span[data-size="large"]')
      .removeAttr('data-size')
      .addClass('u-large-body-text'),
  (content, lang) =>
    content('table').each(table =>
      createTable(
        {},
        content(table)
          .children()
          .toString(),
        lang
      )
    ),
];
