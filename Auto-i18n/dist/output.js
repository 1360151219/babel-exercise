import _i18n from 'i18n';
import intl from 'intl2';
/**
 * App
 */

function App() {
  const title = _i18n.t('i18n1');

  const desc = _i18n.t('i18n2');

  const desc2 = `desc`;

  const desc3 = _i18n.t('i18n3', title + desc, desc2);

  return <div className={_i18n.t('i18n4')} title={_i18n.t('i18n5')}>
            <img src={Logo} />
            <h1>${title}</h1>
            <p>${desc}</p>
            <div>
                {'中文'}
            </div>
        </div>;
}