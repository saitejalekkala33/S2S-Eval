"use client";
import React, { useState } from 'react'
import Link from 'next/link';
import styles from './client.module.css';

const languages = ['Hindi', 'Bengali', 'Assamese', 'Telugu', 'Tamil', 'Language 1', 'Language 2', 'Language 3', 'Language 4', 'Language 5', 'Language 6', 'Language 7'];

export default function ClientPage() {
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [tableData, setTableData] = useState<string[]>([]);

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const language = event.target.value;
    setSelectedLanguage(event.target.value);

    const rows = Array.from({ length: 10 }, (_, index) => `${language} ${index + 1}`);
    setTableData(rows);
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftContainer}>
        <h1 className={styles.header1}>Choose a Language</h1>
        <select className={styles.languageDropdown} onChange={handleLanguageChange} value={selectedLanguage}>
          <option value="">Select a language</option>
          {languages.map((language, index) => (<option key={index} value={language}>{language}</option>))}
        </select>
        {selectedLanguage && (
          <div className={styles.tableContainer}>
            <table className={styles.scrollableTable}>
              <tbody>
                {tableData.map((name, index) => (
                  <tr key={index} className={styles.tableRow}>
                    <td className={styles.nameCell}>{name}</td>
                    <td className={styles.checkboxCell}><input type="checkbox"/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className={styles.rightContainer}>
        {selectedLanguage && (
          <div className={styles.selectedLanguage}>{selectedLanguage}</div>
        )}
        <div className={styles.videoContainer}>
            <div className={styles.originalVideo}></div>
            <div className={styles.generatedVideo}></div>
          </div>
      </div>
    </div>
  );
}
