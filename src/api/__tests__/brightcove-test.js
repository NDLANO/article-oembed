import { getContributorGroups } from '../brightcove';

test('parses contributor string correctly', () => {
  const fields = {
    licenseinfo: 'Opphaver: Senter for nye medier, Høgskolen i Bergen',
    licenseinfo1: 'Opphaver:Adalia film & media',
    licenseinfo2: 'Leverandør:    Norsk Helseinformatikk',
    licenseinfo3: 'Distributør : ndla.no',
    yt_privacy_status: 'private',
    license: 'Navngivelse-Del på samme vilkår',
  };

  const authors = getContributorGroups(fields);
  expect(authors).toMatchSnapshot();
});

test('uses fallback if contributor string could not be parsed', () => {
  const fields = {
    licenseinfo: 'Opphaver: Senter for nye medier, Høgskolen i Bergen',
    licenseinfo1: 'Opphaver Adalia film & media',
    licenseinfo2: ' Opphaver: Adalia film & media',
    licenseinfo3: 'Produsent: Lucasfilm',
    yt_privacy_status: 'private',
    license: 'Navngivelse-Del på samme vilkår',
  };

  const authors = getContributorGroups(fields);
  expect(authors).toMatchSnapshot();
});
