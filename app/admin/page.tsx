"use client";
import React, { useState, useEffect, useRef } from "react";
import styles from "./admin.module.css";
import axios from 'axios';

require('dotenv').config();

interface TableRow {
  id: number;
  originalVideo: string | null;
  generatedVideo: string | null;
  overallReview: string;
}

type TableData = {
  index: number;
  language: string;
  original_video_url: string;
  generated_video_url: string;
}[];

export default function AdminPage() {
  const [languages, setLanguages] = useState<{ _id: string; language: string }[]>([]);
  const [newLanguage, setNewLanguage] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [tableData1, setTableData1] = useState<TableData>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedOriginalVideo, setSelectedOriginalVideo] = useState<string | null>(null);
  const [selectedGeneratedVideo, setSelectedGeneratedVideo] = useState<string | null>(null);

  const handleOriginalVideoClick = (url: string) => {
    if (selectedOriginalVideo === url) {
      setSelectedOriginalVideo(null); 
    } else {
      setSelectedOriginalVideo(url); 
    }
  };

  const handleGeneratedVideoClick = (url: string) => {
    if (selectedGeneratedVideo === url) {
      setSelectedGeneratedVideo(null);
    } else {
      setSelectedGeneratedVideo(url); 
    }
  };

  useEffect
  const fetchLanguages = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/language");
      setLanguages(response.data.languages); 
    } catch (error) {
      console.error("Error fetching languages:", error);
    }
  };

  const handleLoadLanguages = () => {
    fetchLanguages(); 
  };

  const handleAddLanguageClick = () => {
    setIsAdding(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewLanguage(e.target.value);
  };  

  const handleAddLanguageSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    const trimmedLanguage = newLanguage; 
    setError(null);
    
    if (e.key === "Enter" && trimmedLanguage) {
      try {
        const response = await axios.post("http://localhost:5000/api/language", { language: trimmedLanguage });
        const addedLanguage = response.data.language;
        setLanguages([...languages, addedLanguage]);
        setSelectedLanguage(addedLanguage);
        setNewLanguage("");
        setIsAdding(false);
        setError(null);
      } catch (error: any) {
        if (error.response && error.response.data) {
          setError(error.response.data.message);
        } else {
          setError("Failed to add language. Please try again.");
        }
        console.error("Error adding language:", error);
      }
    }
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

  const handleClickOutside = (event: MouseEvent) => {
    if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
      setIsAdding(false);
    }
  };

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>, index: number, type: "originalVideo" | "generatedVideo") => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_NAME!);
    formData.append("cloud_name", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!);
    try {
      const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload`;
      const response = await axios.post(url, formData);
      const uploadedVideoUrl = response.data.secure_url;
      const updatedTableData1 = [...tableData1];
      if (type === "originalVideo") {
        updatedTableData1[index].original_video_url = uploadedVideoUrl;
      } else if (type == "generatedVideo") {
        updatedTableData1[index].generated_video_url = uploadedVideoUrl;
      }
      setTableData1(updatedTableData1);
    } catch (error) {
      alert("Video upload failed. Please try again.");
    }
  };

  const handleDbSubmit = async (index: number) => {
    try {
      const { original_video_url, generated_video_url } = tableData1[index];
      if (!selectedLanguage) {
        alert("Please select a language before submitting.");
        return;
      }
      if (!original_video_url || !generated_video_url) {
        alert("Both videos must be uploaded before submitting.");
        return;
      }
      const languageObj = languages.find(lang => lang.language === selectedLanguage);
      if (!languageObj || !languageObj._id) {
        alert("Selected language is invalid.");
        return;
      }
      const body = {
        language: languageObj._id,
        original_video_url: original_video_url,
        generated_video_url: generated_video_url,
      };
      console.log(body);
      const dburl = "http://localhost:5000/api/video";
      const response = await axios.post(dburl, body);
      if (response.status === 201) {
        alert("Video data submitted successfully.");
      } else {
        alert("Failed to submit video data.");
      }
    } catch (error) {
      console.error("Error submitting video data:", error);
      alert("An error occurred while submitting video data.");
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLanguageClick = async (language: string) => {
    setSelectedLanguage(language);

    const languageObj = languages.find((lang) => lang.language === language);
    if (!languageObj || !languageObj._id){
      setError("Selected language is invalid.");
      setTableData1([]);
      return;
    }
    const languageId = languageObj._id;
    try{
      const response = await axios.get("http://localhost:5000/api/video/", {
        params: {language: languageId},
      });
      if (response.data && Array.isArray(response.data)) {
        const formattedData: TableData = response.data.map((item, idx) => ({
          index: idx + 1,
          language: item.language,
          original_video_url: item.original_video_url,
          generated_video_url: item.generated_video_url,
        }));
        console.log(formattedData);
        setTableData1(formattedData);
        setError(null);
      } else {
        setError("Failed to fetch videos. Invalid response format.");
        setTableData1([]);
      }
    } catch (error)  {
      console.error("Error fetching videos:", error);
      setError("Failed to fetch videos. Please try again.");
      setTableData1([]);
    }
  };

  const handleAddRow = () => {
    const newRow = {
      index: tableData1.length + 1,
      language: selectedLanguage as string,
      original_video_url: "",
      generated_video_url: "",
    };
    console.log(newRow);
    setTableData1([...tableData1, newRow]);
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftContainer}>
        <h1 className={styles.header1}>Language</h1>
        <div className={styles.scrollableArea}>
          {languages.map((languageObj, index) => (
            <button key={index} className={styles.scrollButton} onClick={() => handleLanguageClick(languageObj.language)}>
              {languageObj.language}
            </button>
          ))}
        </div>

        <button className={styles.newlanguage} onClick={handleAddLanguageClick}>Add</button>
        {isAdding && (
          <div>
            <input ref={inputRef} type="text" className={styles.inputField} value={newLanguage} onChange={handleInputChange} onKeyDown={handleAddLanguageSubmit} placeholder="New Language"/>
            {error && <div className={styles.errorPopup}>{error}</div>}
          </div>
        )}
      </div>

      <div className={styles.rightContainer}>
        {!selectedLanguage ? (
          <div className={styles.initialText}>Upload and View Reviews</div>
        ) : (
          <>
            <div className={styles.selectedLanguage}>{selectedLanguage}</div>
            <div className={styles.videoContainer}>
              <div className={styles.originalVideo}>
                {selectedOriginalVideo ? (<video src={selectedOriginalVideo} controls/>) : (<p>No Original Video Selected</p>)}
              </div>
              <div className={styles.generatedVideo}>
                {selectedGeneratedVideo ? (<video src={selectedGeneratedVideo} controls/>) : (<p>No Generated Video Selected</p>)}
              </div>
            </div>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Index</th>
                    <th>Original Video URL</th>
                    <th>Generated Video URL</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData1.map((row, index) => (
                    <tr key={row.index}>
                      <td>{row.index}</td>
                      <td>{row.original_video_url ? (<div style={{ display: "flex", alignItems: "center", gap: "8px" }}><p>View Original Video</p><a href="#" onClick={(e) => {e.preventDefault(); handleOriginalVideoClick(row.original_video_url);}}>{selectedOriginalVideo === row.original_video_url ? "⬇️" : "⬆️"}</a></div>) : (<p><label htmlFor={`generatedVideo-${row.index}`}>Upload Generated Video</label> <input type="file" id={`generatedVideo-${row.index}`} accept="video/*" onChange={(e) => handleVideoUpload(e, index, "generatedVideo")}></input></p>)}</td>
                      <td>{row.generated_video_url ? (<div style={{ display: "flex", alignItems: "center", gap: "8px" }}><p>View Generated Video</p><a href="#" onClick={(e) => {e.preventDefault(); handleGeneratedVideoClick(row.generated_video_url);}}>{selectedGeneratedVideo === row.generated_video_url ? "⬇️" : "⬆️"}</a></div>) : (<p><label htmlFor={`generatedVideo-${row.index}`}>Upload Generated Video</label> <input type="file" id={`generatedVideo-${row.index}`} accept="video/*" onChange={(e) => handleVideoUpload(e, index, "generatedVideo")}></input></p>)}</td>
                      <td>{row.original_video_url && row.generated_video_url ? (<button className={styles.uploadButton} onClick={() => handleDbSubmit(index)}>✅</button>) : (<p>Missing Videos</p>)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className={styles.addButton} onClick={handleAddRow}>+</button>
          </>
        )}
      </div>
    </div>
  );
}
