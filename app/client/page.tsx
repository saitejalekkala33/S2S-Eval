"use client";
import React, { useState, useEffect } from 'react'
import Link from 'next/link';
import styles from './client.module.css';
import axios from 'axios';

const languages = ['Hindi', 'Bengali', 'Assamese', 'Telugu', 'Tamil', 'Language 1', 'Language 2', 'Language 3', 'Language 4', 'Language 5', 'Language 6', 'Language 7'];

export default function ClientPage() {
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [languages, setLanguages] = useState<{ language: string }[]>([]);
  const [tableData, setTableData] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const language = event.target.value;
    setSelectedLanguage(event.target.value);

    const rows = Array.from({ length: 10 }, (_, index) => `${language} ${index + 1}`);
    setTableData(rows);
  };

  useEffect(() => {
    const displayLanguages = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/language");
        if (response.data && Array.isArray(response.data)) {
          setLanguages(response.data); 
          setError(null); 
        } else {
          setError("Failed to fetch languages. Invalid response format.");
        }
      } catch (error: any) {
        console.error("Error fetching languages:", error);
        setError("Failed to fetch languages. Please try again.");
      }
    };

    displayLanguages(); 
  }, []); 

  return (
    <div className={styles.container}>
      <div className={styles.leftContainer}>
        <h1 className={styles.header1}>Choose a Language</h1>
        <select className={styles.languageDropdown} onChange={handleLanguageChange} value={selectedLanguage}>
          <option value="">Select a language</option>
          {languages.map((languageObj, index) => (<option key={index} value={languageObj.language}>{languageObj.language}</option>))}
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
