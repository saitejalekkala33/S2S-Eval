"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './client.module.css';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';

const getCookie = (cookieName: string) => {
  const cookies = document.cookie.split("; ");
  for (let cookie of cookies) {
    const [name, value] = cookie.split("=");
    if (name === cookieName) {
      return value;
    }
  }
  return null; 
};

type TableData = {
  index: number;
  vid_id: string;
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
  const [selectedVidId, setSelectedVidId] = useState<string | null>(null);
  const [ratings, setRatings] = useState<{ [key: number]: { lipSync: number; translation: number; audio: number; overall: number } }>({});
  const [inputValue, setInputValue] = useState<string>('');
  const searchParams = useSearchParams();
  const username = searchParams?.get('username');

  const handleLanguageChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const languageId = event.target.value;
    setSelectedLanguage(languageId);

    try {
      const response = await axios.get("http://localhost:5000/api/video", {
        params: { language: languageId },
      });
      console.log(response.data);
      if (response.data && Array.isArray(response.data)) {
        const formattedData: TableData = response.data.map((item, idx) => ({
          index: idx + 1,
          vid_id: item._id,
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

  const handleVideoToggle = (index: number, original: string, generated: string, vid_id: string) => {
    if (selectedRow === index) {
      setVideoUrls({ original: "", generated: "" });
      setSelectedRow(null);
      setSelectedIndex(null);
      setSelectedVidId(null);
    } else {
      setVideoUrls({ original, generated });
      setSelectedRow(index);
      setSelectedIndex(index);
      setSelectedVidId(vid_id);
      console.log(index+1);
      console.log(vid_id);
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
          <span key={star} className={styles.star} style={{ color: star <= currentRating ? "gold" : "gray", cursor: "pointer" }} onClick={() => updateRating(index, category, star)}>★</span>
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
  
  const handleReviewSubmit = async () => {
    if (selectedVidId === null){
      setError("Please select a video to submit a review.");
      return;
    }

    const currentRatings = ratings[selectedIndex!];
    if (!currentRatings || typeof currentRatings.lipSync !== 'number' || typeof currentRatings.translation !== 'number' || typeof currentRatings.audio !== 'number' || typeof currentRatings.overall !== 'number'){
      setError("Please provide all ratings before submitting.");
      return;
    }

    if (!inputValue || inputValue.trim().length === 0) {
      setError("Please provide a comment before submitting.");
      return;
    }

    const userId = getCookie('userId');
    const reviewData = {
      username: userId,
      videoId: selectedVidId,
      ratings: {
        lipSync: currentRatings.lipSync,
        translation: currentRatings.translation,
        audio: currentRatings.audio,
        overall: currentRatings.overall,
      },
      comment: inputValue,
    };
    console.log(reviewData);
    try {
      const response = await axios.post('http://localhost:5000/api/review', reviewData);
      if (response.data && response.data.status === 'success') {
        setInputValue('');
        setRatings({});
        setSelectedVidId(null);
        setSelectedRow(null);
        setSelectedIndex(null);
        setVideoUrls({ original: "", generated: "" });
        alert('Review submitted successfully!');
      } else {
        setError(response.data.message || 'Failed to submit review. Please try again.');
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      setError('An error occurred while submitting your review. Please try again later.');
    }
  };

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
                    <td className={styles.buttonCell}><button className={styles.smallButton} onClick={() => handleVideoToggle(index, item.original_video_url, item.generated_video_url, item.vid_id)}>{selectedRow === index ? "⬅️" : "➡️"}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className={styles.rightContainer}>
        <div className={styles.usernameDisplay}>{`${username}`}</div>
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
            <button className={styles.ReviewSubmit} onClick={handleReviewSubmit}>Submit✅</button>
          </>
        )}
      </div>
    </div>
  );
}
