/**
 * Copyright (c) 2017-present, NDLA.
 *
 * This source code is licensed under the GPLv3 license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import fetch from 'isomorphic-fetch';
import { resolveJsonOrRejectWithError } from '../utils/apiHelpers';
import { brightcoveClientId, brightcoveClientSecret } from '../config';

const getHeaders = accessToken => ({
  headers: {
    'content-type': 'Content-Type: application/json',
    Authorization: `Bearer ${accessToken.access_token}`,
  },
});

async function fetchVideoSources(videoId, accountId, accessToken) {
  const url = `https://cms.api.brightcove.com/v1/accounts/${accountId}/videos/${
    videoId
  }/sources`;
  const response = await fetch(url, {
    method: 'GET',
    ...getHeaders(accessToken),
  });
  return resolveJsonOrRejectWithError(response);
}

async function fetchVideo(videoId, accountId, accessToken) {
  const url = `https://cms.api.brightcove.com/v1/accounts/${accountId}/videos/${
    videoId
  }`;

  const response = await fetch(url, {
    method: 'GET',
    ...getHeaders(accessToken),
  });
  return resolveJsonOrRejectWithError(response);
}

const expiresIn = accessToken => accessToken.expires_in - 10;

const storeAccessToken = accessToken => {
  const expiresAt = expiresIn(accessToken) * 1000 + new Date().getTime();
  global.access_token = accessToken;
  global.access_token_expires_at = expiresAt;
};

async function fetchAccessToken() {
  const base64Encode = str => new Buffer(str).toString('base64');
  const url =
    'https://oauth.brightcove.com/v4/access_token?grant_type=client_credentials';
  const clientIdSecret = `${brightcoveClientId}:${brightcoveClientSecret}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${base64Encode(clientIdSecret)}`,
    },
  });
  const accessToken = await resolveJsonOrRejectWithError(response);

  storeAccessToken(accessToken);
  return accessToken;
}

const getAccessToken = async () => {
  if (
    global.access_token &&
    new Date().getTime() < global.access_token_expires_at
  ) {
    return global.access_token;
  }
  return fetchAccessToken();
};

const getLicenseByNBTitle = title => {
  switch (title.replace(/\s/g, '').toLowerCase()) {
    case 'navngivelse-ikkekommersiell-ingenbearbeidelse':
      return 'by-nc-nd';
    case 'navngivelse-ikkekommersiell-delpåsammevilkår':
      return 'by-nc-sa';
    case 'navngivelse-ikkekommersiell':
      return 'by-nc';
    case 'navngivelse-ingenbearbeidelse':
      return 'by-nd';
    case 'navngivelse-delpåsammevilkår':
      return 'by-sa';
    case 'navngivelse':
      return 'by';
    default:
      return title;
  }
};

export const getAuthors = fields => {
  const parseAuthorString = authorString => {
    const authorFields = authorString.split(/: */);
    if (authorFields.length !== 2) return { type: '', name: authorFields[0] };

    const [type, name] = authorFields;
    return { type, name };
  };
  const licenseInfoKeys = Object.keys(fields).filter(key =>
    key.startsWith('licenseinfo')
  );
  return licenseInfoKeys.map(key => parseAuthorString(fields[key]));
};

export const fetchVideoMeta = async embed => {
  const { videoid, account } = embed.data;
  const accessToken = await getAccessToken();
  const [video, sources] = await Promise.all([
    fetchVideo(videoid, account, accessToken),
    fetchVideoSources(videoid, account, accessToken),
  ]);

  const copyright = {
    license: {
      license: getLicenseByNBTitle(video.custom_fields.license),
    },
    authors: getAuthors(video.custom_fields),
  };
  return { ...embed, brightcove: { ...video, copyright, sources } };
};
