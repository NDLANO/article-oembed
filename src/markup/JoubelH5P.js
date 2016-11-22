/**
 * Copyright (c) 2016-present, NDLA.
 *
 * This source code is licensed under the GPLv3 license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { PropTypes } from 'react';

const H5P = ({ h5p }) => <figure dangerouslySetInnerHTML={{ __html: h5p.oembed.html }} />;

H5P.propTypes = {
  h5p: PropTypes.object.isRequired,
};

export default H5P;