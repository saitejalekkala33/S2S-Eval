"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './client.module.css';
import axios from 'axios';

type TableData = {
  index: number;
  language: string;
  original_video_url: string;
  generated_video_url: string;
}[];

export default function ClientPage() {
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [languages, setLanguages] = useState<{ _id: string; language: string }[]>([]);
  const [tableData, setTableData] = useState<TableData>([]);
  const [error, setError] = useState<string | null>(null);
  const [originalVideo, setOriginalVideo] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);

  const handleLanguageChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const languageId = event.target.value;
    const selectedLangObj = languages.find((lang) => lang._id === languageId);
    if (!selectedLangObj) {
      setError("Invalid language selection.");
      return;
    }
    setSelectedLanguage(selectedLangObj.language);

    try {
      const response = await axios.get("http://localhost:5000/api/video", {
        params: { language: languageId },
      });
      if (response.data && Array.isArray(response.data)) {
        const formattedData: TableData = response.data.map((item, idx) => ({
          index: idx + 1,
          language: item.language,
          original_video_url: item.original_video_url,
          generated_video_url: item.generated_video_url,
        }));

        setTableData(formattedData); 
        setError(null); 
      } else {
        setError("Failed to fetch videos. Invalid response format.");
        setTableData([]);
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
      setError("Failed to fetch videos. Please try again.");
      setTableData([]);
    }
  };

  const handleVideoVisual = (originalUrl: string, generatedUrl: string) => {
    setOriginalVideo(originalUrl);
    setGeneratedVideo(generatedUrl);
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
        <select
          className={styles.languageDropdown}
          onChange={handleLanguageChange}
          value={selectedLanguage}
        >
          <option value="">Select a language</option>
          {languages.map((languageObj) => (
            <option key={languageObj._id} value={languageObj._id}>
              {languageObj.language}
            </option>
          ))}
        </select>
        {selectedLanguage && (
          <div className={styles.tableContainer}>
            <table className={styles.scrollableTable}>
              <tbody>
                {tableData.map((item, index) => (
                  <tr key={index} className={styles.tableRow}>
                    <td className={styles.nameCell} onClick={() => handleVideoVisual(item.original_video_url, item.generated_video_url)}>{`${item.language} ${item.index}`}</td>
                    {/* <td className={styles.buttonCell}><button className={styles.smallButton} onClick={() => handleVideoVisual(item.original_video_url, item.generated_video_url)}>➡️</button></td> */}
                    <td className={styles.checkboxCell}><input type="checkbox" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className={styles.rightContainer}>
        {selectedLanguage && <div className={styles.selectedLanguage}>{selectedLanguage}</div>}
        <div className={styles.videoContainer}>
          <div className={styles.originalVideo}>
            {originalVideo && (
              <video src={originalVideo} controls className={styles.videoPlayer}></video>
            )}
          </div>
          <div className={styles.generatedVideo}>
            {generatedVideo && (
              <video src={generatedVideo} controls className={styles.videoPlayer}></video>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
