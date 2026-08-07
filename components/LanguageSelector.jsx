import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
      <span style={{ fontWeight: 'bold' }}>🌐</span>
      <button onClick={() => changeLanguage('es')} style={{ padding: '5px 10px', cursor: 'pointer' }}>🇪🇸 ES</button>
      <button onClick={() => changeLanguage('en')} style={{ padding: '5px 10px', cursor: 'pointer' }}>🇺🇸 EN</button>
      <button onClick={() => changeLanguage('fr')} style={{ padding: '5px 10px', cursor: 'pointer' }}>🇫🇷 FR</button>
    </div>
  );
};

export default LanguageSelector;