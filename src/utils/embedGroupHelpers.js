/**
 * Copyright (c) 2018-present, NDLA.
 *
 * This source code is licensed under the GPLv3 license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import RelatedArticleList from 'ndla-ui/lib/RelatedArticleList';
import t from '../locale/i18n';

export function RelatedArticleCounter(initialCount = 0) {
  this.count = initialCount;

  RelatedArticleCounter.prototype.getNextCount = function getNextCount() {
    this.count = this.count + 1;
    return this.count;
  };
}

export function createRelatedArticleList(props, children) {
  return renderToStaticMarkup(
    <RelatedArticleList
      {...props}
      messages={{
        title: t(props.locale, 'related.title'),
        showMore: t(props.locale, 'showMore'),
        showLess: t(props.locale, 'showLess'),
      }}
      dangerouslySetInnerHTML={{
        __html: children,
      }}
    />
  );
}