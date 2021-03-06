/**
 * Copyright (c) 2016-present, NDLA.
 *
 * This source code is licensed under the GPLv3 license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import cheerio from 'cheerio';
import { prettify } from './testHelpers';
import { replaceEmbedsInHtml } from '../replacer';
import getEmbedMetaData from '../getEmbedMetaData';
import {
  createH5pPlugin,
  createImagePlugin,
  createBrightcovePlugin,
  createNRKPlugin,
  createAudioPlugin,
  createIframePlugin,
  createFootnotePlugin,
} from '../plugins';

test('replacer/replaceEmbedsInHtml replace various emdeds in html', async () => {
  const articleContent = cheerio.load(
    `<section>
      <embed data-resource="image" data-id="6" data-url="https://api.test.ndla.no/images/1326" data-size="hovedspalte">
      <p>SomeText1</p>
      <embed data-resource="h5p" data-id="8" data-url="https://ndlah5p.joubel.com/node/4">
    </section>
    <section>
      <p>SomeText2</p>
    </section>
    <section>
      <embed data-resource="brightcove" data-id="2" data-videoid="ref:46012" data-account="4806596774001" data-player="BkLm8fT"/>
      <p>SomeText3</p>
    </section>`
  );

  const embeds = [
    {
      embed: articleContent('embed[data-resource="h5p"]'),
      data: articleContent('embed[data-resource="h5p"]').data(),
      plugin: createH5pPlugin(),
      oembed: {
        html: '<iframe src="https://ndlah5p.joubel.com/h5p/embed/4"></iframe>',
      },
    },
    {
      embed: articleContent('embed[data-resource="image"]'),
      data: articleContent('embed[data-resource="image"]').data(),
      plugin: createImagePlugin(),
      image: {
        id: '1326',
        title: {
          title: 'image title',
        },
        metaUrl: 'http://api.test.ndla.no/images/1326',
        alttext: { alttext: 'alt' },
        caption: { caption: '' },
        imageUrl: 'http://api.test.ndla.no/images/1.jpg',
        copyright: {
          creators: [],
          rightsholders: [],
          processors: [],
          license: {
            license: 'CC-BY-NC-4.0',
          },
        },
      },
    },
    {
      embed: articleContent('embed[data-resource="brightcove"]'),
      data: articleContent('embed[data-resource="brightcove"]').data(),
      plugin: createBrightcovePlugin(),
      brightcove: {
        name: 'brightcove video',
        id: '46012',
        copyright: {
          creators: [],
          rightsholders: [],
          processors: [],
          license: {
            license: 'CC-BY-NC-4.0',
          },
        },
        sources: [{ height: 768, width: 1024 }],
      },
    },
  ];

  await replaceEmbedsInHtml(embeds, 'nb');
  const replaced = articleContent('body').html();

  expect(prettify(replaced)).toMatchSnapshot();
});

test('replacer/replaceEmbedsInHtml replace image embeds', async () => {
  const articleContent = cheerio.load(
    `<section>
      <embed data-resource="image" data-id="1" data-align="left" data-url="http://api.test.ndla.no/images/1326" data-size="full">
      <embed data-resource="image" data-id="2" data-align="" data-url="http://api.test.ndla.no/images/1326" data-size="full">
    </section>`
  );

  const embeds = [
    {
      embed: articleContent('embed[data-resource="image"]').first(),
      data: articleContent('embed[data-resource="image"]')
        .first()
        .data(),
      plugin: createImagePlugin(),
      resource: 'image',
      align: '',
      image: {
        id: '1',
        title: {
          title: 'image title 1',
        },
        alttext: { alttext: 'alt' },
        caption: { caption: '' },
        imageUrl: 'http://ndla.no/images/1.jpg',
        copyright: {
          creators: [
            {
              type: 'Writer',
              name: 'Ola Foton',
            },
            {
              type: 'Artist',
              name: 'Kari Maler',
            },
          ],
          rightsholders: [
            {
              type: 'Supplier',
              name: 'Scanpix',
            },
          ],
          processors: [],

          license: {
            license: 'CC-BY-NC-4.0',
          },
        },
      },
    },
    {
      embed: articleContent('embed[data-resource="image"]').last(),
      data: articleContent('embed[data-resource="image"]')
        .last()
        .data(),
      plugin: createImagePlugin(),
      resource: 'image',
      align: 'left',
      image: {
        id: '2',
        title: {
          title: 'image title 2',
        },
        alttext: { alttext: 'alt' },
        caption: { caption: '' },
        imageUrl: 'http://ndla.no/images/2.jpg',
        copyright: {
          creators: [],
          rightsholders: [],
          processors: [],
          license: {
            license: 'CC-BY-NC-4.0',
          },
        },
      },
    },
  ];

  await replaceEmbedsInHtml(embeds, 'nb');
  const replaced = articleContent('body').html();

  expect(prettify(replaced)).toMatchSnapshot();
});

test('replacer/replaceEmbedsInHtml replace brightcove embeds', async () => {
  const articleContent = cheerio.load(
    `<section>
      <embed data-resource="brightcove" data-account=1337 data-player="BkLm8fT" data-videoid="ref:1" data-caption="Brightcove caption" data-id="1" >
      <embed data-resource="brightcove" data-account=1337 data-player="BkLm8fT" data-videoid="ref:2" data-caption="Another caption" data-id="2" >
    </section>`
  );

  const embeds = [
    {
      embed: articleContent('embed[data-resource="brightcove"]').first(),
      data: articleContent('embed[data-resource="brightcove"]')
        .first()
        .data(),
      plugin: createBrightcovePlugin(),
      brightcove: {
        id: '1',
        copyright: {
          creators: [],
          rightsholders: [],
          processors: [],
          license: {
            license: 'CC-BY-SA-4.0',
          },
        },
        sources: [{ height: 768, width: 1024 }],
      },
    },
    {
      embed: articleContent('embed[data-resource="brightcove"]').last(),
      data: articleContent('embed[data-resource="brightcove"]')
        .last()
        .data(),
      plugin: createBrightcovePlugin(),
      brightcove: {
        id: '2',
        copyright: {
          creators: [],
          rightsholders: [],
          processors: [],
          license: {
            license: 'CC-BY-SA-4.0',
          },
        },
        sources: [{ height: 768, width: 1024 }],
      },
    },
  ];

  await replaceEmbedsInHtml(embeds, 'nb');
  const replaced = articleContent('body').html();

  expect(prettify(replaced)).toMatchSnapshot();
});

test('replacer/replaceEmbedsInHtml replace nrk embeds', async () => {
  const articleContent = cheerio.load(
    `<section>
      <embed data-id="1" data-nrk-video-id="94605" data-resource="nrk" data-url="http://nrk.no/skole/klippdetalj?topic=urn%3Ax-mediadb%3A18745" />
      <embed data-id="2" data-nrk-video-id="94606" data-resource="nrk" data-url="http://nrk.no/skole/klippdetalj?topic=urn%3Ax-mediadb%3A18746" />
    </section>`
  );

  const embeds = [
    {
      embed: articleContent('embed[data-resource="nrk"]').first(),
      data: articleContent('embed[data-resource="nrk"]')
        .first()
        .data(),
      plugin: createNRKPlugin(),
    },
    {
      embed: articleContent('embed[data-resource="nrk"]').last(),
      data: articleContent('embed[data-resource="nrk"]')
        .last()
        .data(),
      plugin: createNRKPlugin(),
    },
  ];

  await replaceEmbedsInHtml(embeds, 'nb');
  const replaced = articleContent.html();

  expect(replaced).toMatch('<div class="nrk-video" data-nrk-id="94605"></div>');
  expect(replaced).toMatch('<div class="nrk-video" data-nrk-id="94606"></div>');
});

test('replacer/replaceEmbedsInHtml replace audio embeds', async () => {
  const articleContent = cheerio.load(
    `<section>
      <embed data-resource="audio" data-type="standard" data-caption="Caption 1" data-id="1"/>
      <embed data-resource="audio" data-type="minimal" data-caption="Caption 2" data-id="2"/>
    </section>`
  ); // Strip new lines
  const embeds = [
    {
      embed: articleContent('embed[data-resource="audio"]').first(),
      data: articleContent('embed[data-resource="audio"]')
        .first()
        .data(),
      plugin: createAudioPlugin(),
      audio: {
        id: 1,
        title: { title: 'Tittel', language: 'Unknown' },
        audioFile: {
          url: 'http://audio.no/file/voof.mp3',
          mimeType: 'audio/mpeg',
        },
        copyright: {
          license: {
            license: 'CC-BY-SA-4.0',
            description: 'Creative Commons Attribution-ShareAlike 2.0 Generic',
            url: 'https://creativecommons.org/licenses/by-sa/2.0/',
          },
          creators: [{ type: 'writer', name: 'name' }],
          rightsholders: [{ type: 'processor', name: 'name' }],
          processors: [{ type: 'publisher', name: 'name' }],
        },
      },
    },
    {
      embed: articleContent('embed[data-resource="audio"]').last(),
      data: articleContent('embed[data-resource="audio"]')
        .last()
        .data(),
      plugin: createAudioPlugin(),
      audio: {
        id: 2,
        title: { title: 'Tittel', language: 'Unknown' },
        audioFile: {
          url: 'http://audio.no/file/voof.mp3',
          mimeType: 'audio/mpeg',
        },
        copyright: {
          license: {
            license: 'CC-BY-SA-4.0',
            description: 'Creative Commons Attribution-ShareAlike 2.0 Generic',
            url: 'https://creativecommons.org/licenses/by-sa/2.0/',
          },
          creators: [{ type: 'writer', name: 'name' }],
          rightsholders: [{ type: 'processor', name: 'name' }],
          processors: [{ type: 'publisher', name: 'name' }],
        },
      },
    },
  ];

  await replaceEmbedsInHtml(embeds, 'nb');
  const replaced = articleContent('body').html();

  expect(prettify(replaced)).toMatchSnapshot();
});

test('replacer/replaceEmbedsInHtml replace iframe embeds', async () => {
  const articleContent = cheerio.load(
    '<section><embed data-resource="iframe" data-url="http://prezi.com" data-width="1" data-height="2"/></section>'
  );
  const embeds = [
    {
      embed: articleContent('embed[data-resource="iframe"]'),
      data: articleContent('embed[data-resource="iframe"]').data(),
      plugin: createIframePlugin(),
    },
  ];

  await replaceEmbedsInHtml(embeds, 'nb');
  const replaced = articleContent('body').html();

  expect(prettify(replaced)).toMatchSnapshot();
});

test('replacer/replaceEmbedsInHtml replace commoncraft embeds', async () => {
  const articleContent = cheerio.load(
    '<section><embed data-resource="iframe" data-url="http://common.craft" data-width="1" data-height="2"/></section>'
  );

  const embeds = [
    {
      embed: articleContent('embed[data-resource="iframe"]'),
      data: articleContent('embed[data-resource="iframe"]').data(),
      plugin: createIframePlugin(),
    },
  ];

  await replaceEmbedsInHtml(embeds, 'nb');
  const replaced = articleContent('body').html();

  expect(prettify(replaced)).toMatchSnapshot();
});

test('replacer/replaceEmbedsInHtml replace ndla-filmiundervisning embeds', async () => {
  const articleContent = cheerio.load(
    '<section><embed data-resource="iframe" data-url="http://ndla.filmiundervisning.no/" data-width="1" data-height="2"/></section>'
  );

  const embeds = [
    {
      embed: articleContent('embed[data-resource="iframe"]'),
      data: articleContent('embed[data-resource="iframe"]').data(),
      plugin: createIframePlugin(),
    },
  ];

  await replaceEmbedsInHtml(embeds, 'nb');
  const replaced = articleContent('body').html();

  expect(prettify(replaced)).toMatchSnapshot();
});

test('replacer/replaceEmbedsInHtml replace kahoot embeds', async () => {
  const articleContent = cheerio.load(
    '<section><embed data-resource="iframe" data-url="https://embed.kahoot.it/e577f7e9-59ff-4a80-89a1-c95acf04815d" data-width="1" data-height="2"/></section>'
  );

  const embeds = [
    {
      embed: articleContent('embed[data-resource="iframe"]'),
      data: articleContent('embed[data-resource="iframe"]').data(),
      plugin: createIframePlugin(),
    },
  ];

  await replaceEmbedsInHtml(embeds, 'nb');
  const replaced = articleContent('body').html();

  expect(prettify(replaced)).toMatchSnapshot();
});

test('replacer/replaceEmbedsInHtml replace footnote embeds', async () => {
  const plugin = createFootnotePlugin();
  const articleContent = cheerio.load(
    '<section>' +
      '<embed data-authors="regjeringen.no" data-edition="" data-publisher="Barne-, likestillings- og inkluderingsdepartmentet" data-resource="footnote" data-title="Likestilling kommer ikke av seg selv" data-type="Report" data-year="2013">' +
      '<embed data-authors="Me;You" data-edition="2" data-publisher="test" data-resource="footnote" data-title="test" data-type="Book" data-year="2022">' +
      '</section>'
  );

  const embeds = [
    {
      embed: articleContent('embed[data-resource="footnote"]').first(),
      data: articleContent('embed[data-resource="footnote"]')
        .first()
        .data(),
      plugin,
    },
    {
      embed: articleContent('embed[data-resource="footnote"]').last(),
      data: articleContent('embed[data-resource="footnote"]')
        .last()
        .data(),
      plugin,
    },
  ];

  await replaceEmbedsInHtml(embeds, 'nb');
  const replaced = articleContent('body').html();

  expect(getEmbedMetaData(embeds)).toMatchSnapshot();
  expect(prettify(replaced)).toMatchSnapshot();
});
