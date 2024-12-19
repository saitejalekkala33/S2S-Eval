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

export default function AdminPage() {
  const [languages, setLanguages] = useState<{ language: string }[]>([]);
  const [newLanguage, setNewLanguage] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

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
  
      const updatedTableData = [...tableData];
      updatedTableData[index][type] = uploadedVideoUrl;
      setTableData(updatedTableData);
    } catch (error) {
      alert("Video upload failed. Please try again.");
    }
  };

  const handleDbSubmit = async(index: number) => {
    try{
      const { originalVideo, generatedVideo } = tableData[index];
      const language = selectedLanguage;
      if (!originalVideo || !generatedVideo) {
        alert("Both videos must be uploaded before submitting.");
        return;
      }
      const body = {
        language,
        original_video_url: originalVideo,
        generated_video_url: generatedVideo,
      };
      console.log(body); 
      const dburl = 'http://localhost:5000/api/video';
      const response = await axios.post(dburl, body);
      console.log(response);
      if (response.status === 201) {
        alert("Video data submitted successfully.");
      }
    } catch(error){
      alert("Failed to submit video data. Please try again.");
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLanguageClick = (language: string) => {
    setSelectedLanguage(language);
  };

  const handleAddRow = () => {
    const newRow: TableRow = {
      id: tableData.length + 1,
      originalVideo: null,
      generatedVideo: null,
      overallReview: `Review ${tableData.length + 1}`,
    };
    setTableData([...tableData, newRow]);
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
                {tableData.map((row, index) =>row.originalVideo ? (<video key={index} src={row.originalVideo} controls />) : (<p key={index}>No Original Video Uploaded</p>))}
              </div>
              <div className={styles.generatedVideo}>
                {tableData.map((row, index) =>
                  row.generatedVideo ? (<video key={index} src={row.generatedVideo} controls />) : (<p key={index}>No Generated Video Uploaded</p>)
                )}
              </div>
            </div>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <tbody>
                  {tableData.map((row, index) => (
                    <tr key={row.id}>
                      <td>
                        {row.originalVideo ? (<p>Original Video Uploaded</p>) : (
                          <p>
                            <label  htmlFor={`originalVideo-${row.id}`}>Upload Original Video</label>
                            <input type="file" id={`originalVideo-${row.id}`} accept="video/*" onChange={(e) => handleVideoUpload(e, index, "originalVideo")}/>
                          </p>
                        )}
                      </td>
                      <td>
                        {row.generatedVideo ? (<p>Original Video Uploaded</p>) : (
                          <p>
                            <label htmlFor={`generatedVideo-${row.id}`}>Upload Generated Video</label>
                            <input type="file" id={`generatedVideo-${row.id}`} accept="video/*" onChange={(e) => handleVideoUpload(e, index, "generatedVideo")}/>
                          </p>
                        )}
                      </td>
                      <td>
                        {row.originalVideo && row.generatedVideo ? (<button className={styles.uploadButton} onClick={() => handleDbSubmit(index)}>✅</button>) : (<p>Missing Videos</p>)}
                      </td>
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
