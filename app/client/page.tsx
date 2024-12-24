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
  const [videoUrls, setVideoUrls] = useState({ original: "", generated: "" });
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [ratings, setRatings] = useState<{ [key: number]: { lipSync: number; translation: number; audio: number; overall: number } }>({});
  const [inputValue, setInputValue] = useState<string>('');

  const handleLanguageChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const languageId = event.target.value;
    setSelectedLanguage(languageId);

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

  const handleVideoToggle = (index: number, original: string, generated: string) => {
    if (selectedRow === index) {
      setVideoUrls({ original: "", generated: "" });
      setSelectedRow(null);
      setSelectedIndex(null);
    } else {
      setVideoUrls({ original, generated });
      setSelectedRow(index);
      setSelectedIndex(index);
      console.log(index+1);
    }
  };

  const updateRating = (index: number, category: keyof typeof ratings[0], value: number) => {
    setRatings((prevRatings) => ({
      ...prevRatings,
      [index]: {
        ...prevRatings[index],
        [category]: value,
      },
    }));
  };
  

  const StarRating = ({ index, category }: { index: number; category: keyof typeof ratings[0] }) => {
    const currentRating = ratings[index]?.[category] || 0;
  
    return (
      <div className={styles.starRating}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={styles.star}
            style={{ color: star <= currentRating ? "gold" : "gray", cursor: "pointer" }}
            onClick={() => updateRating(index, category, star)}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
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

  // const handleReviewSubmit

  return (
    <div className={styles.container}>
      <div className={styles.leftContainer}>
        <h1 className={styles.header1}>Choose a Language</h1>
        <select className={styles.languageDropdown} onChange={handleLanguageChange} value={selectedLanguage}>
          <option value="">Select a language</option>
          {languages.map((languageObj) => (<option key={languageObj._id} value={languageObj._id}>{languageObj.language}</option>))}
        </select>
        {tableData.length > 0 && (
          <div className={styles.tableContainer}>
            <table className={styles.scrollableTable}>
              <tbody>
                {tableData.map((item, index) => (
                  <tr key={index} className={styles.tableRow}>
                    <td className={styles.nameCell}>{`${languages.find((lang) => lang._id === selectedLanguage)?.language || "Unknown Language"} ${item.index}`}</td>
                    <td className={styles.checkboxCell}><input type="checkbox" /></td>
                    <td className={styles.buttonCell}><button className={styles.smallButton} onClick={() => handleVideoToggle(index, item.original_video_url, item.generated_video_url)}>{selectedRow === index ? "⬅️" : "➡️"}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className={styles.rightContainer}>
        {selectedLanguage && <div className={styles.selectedLanguage}>{languages.find((lang) => lang._id === selectedLanguage)?.language || "Unknown Language"}</div>}
            <div className={styles.videoContainer}>
              <div className={styles.originalVideo}>{videoUrls.original && <video src={videoUrls.original} controls/>}</div>
              <div className={styles.generatedVideo}>{videoUrls.generated && <video src={videoUrls.generated} controls />}</div>
            </div>
        {selectedIndex !== null && (
          <>
            <div className={styles.ratingContainer}>
              <div className={styles.selectedIndex}>Index: {selectedIndex + 1}</div>
              <div className={styles.ratingItem}>
                <h2>Lip Sync Quality</h2>
                <StarRating index={selectedIndex} category="lipSync" />
              </div>
              <div className={styles.ratingItem}>
                <h2>Translation Quality</h2>
                <StarRating index={selectedIndex} category="translation" />
              </div>
              <div className={styles.ratingItem}>
                <h2>Audio Quality</h2>
                <StarRating index={selectedIndex} category="audio" />
              </div>
              <div className={styles.ratingItem}>
                <h2>Overall Quality</h2>
                <StarRating index={selectedIndex} category="overall" />
              </div>
            </div>
            <div className={styles.CommentSection}><input type="text" className={styles.inputField} placeholder="Enter Comments here" value={inputValue} onChange={handleInputChange}/></div>
            {/* <button className={styles.ReviewSubmit} onClick={handleReviewSubmit}>✅</button> */}
          </>
        )}
      </div>
    </div>
  );
}
