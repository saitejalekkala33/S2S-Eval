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
  const [languages, setLanguages] = useState<string[]>([]);
  const [newLanguage, setNewLanguage] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleAddLanguageClick = () => {
    setIsAdding(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewLanguage(e.target.value);
  };

  const handleAddLanguageSubmit = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter" && newLanguage.trim() !== "") {
      if (languages.includes(newLanguage.trim())) {
        setError("This language is already added.");
        setNewLanguage("");
        return;
      }
      setLanguages([...languages, newLanguage]);
      setSelectedLanguage(newLanguage);
      setNewLanguage("");
      setIsAdding(false);
      setError(null);
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
      setIsAdding(false);
    }
  };
  //@ts-ignore
  const handleOriginalVideo = async (event, index) => {
    const file = event.target.files[0]; 
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_NAME!); 
    formData.append("cloud_name", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!); 
    try {
      const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload`;
      console.log(url);
      const response = await axios.post(url, formData);
      console.log("Uploaded Successfully:", response.data);
      const uploadedVideoUrl = response.data.secure_url;
      console.log("Uploaded Video URL:", uploadedVideoUrl);
      const updatedTableData = [...tableData];
      updatedTableData[index].originalVideo = uploadedVideoUrl;
      setTableData(updatedTableData);
    } catch (error) {
      console.error("Error uploading video:", error);
      alert("Video upload failed. Please try again.");
    }
  };
  // const handleOriginalVideo = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
  //   if (e.target.files && e.target.files[0]) {
  //     const file = e.target.files[0];
  //     const fileURL = URL.createObjectURL(file);
  //     const updatedTableData = [...tableData];
  //     updatedTableData[index].originalVideo = fileURL;
  //     setTableData(updatedTableData);
  //   }
  // };

  //@ts-ignore
  const handleGeneratedVideo = async (event, index) => {
    const file = event.target.files[0]; 
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_NAME!); 
    formData.append("cloud_name", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!); 
    try {
      const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload`;
      console.log(url);
      const response = await axios.post(url, formData);
      console.log("Uploaded Successfully:", response.data);
      const uploadedVideoUrl = response.data.secure_url;
      console.log("Uploaded Video URL:", uploadedVideoUrl);
      const updatedTableData = [...tableData];
      updatedTableData[index].generatedVideo = uploadedVideoUrl;
      setTableData(updatedTableData);
    } catch (error) {
      console.error("Error uploading video:", error);
      alert("Video upload failed. Please try again.");
    }
  };

  // const handleGeneratedVideo = (
  //   e: React.ChangeEvent<HTMLInputElement>,
  //   index: number
  // ) => {
  //   if (e.target.files && e.target.files[0]) {
  //     const file = e.target.files[0];
  //     const fileURL = URL.createObjectURL(file);

  //     const updatedTableData = [...tableData];
  //     updatedTableData[index].generatedVideo = fileURL; // Store video URL
  //     setTableData(updatedTableData);
  //   }
  // };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLanguageClick = (language: string) => {
    setSelectedLanguage(language);
  };

  // const handleAddRow = () => {
  //   const newRow: TableRow = {
  //     id: tableData.length + 1,
  //     originalVideo: `Video ${tableData.length + 1}`,
  //     generatedVideo: `Generated ${tableData.length + 1}`,
  //     overallReview: `Review ${tableData.length + 1}`,
  //   };
  //   setTableData([...tableData, newRow]);
  // };
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
          {languages.map((language, index) => (
            <button key={index} className={styles.scrollButton} onClick={() => handleLanguageClick(language)}>{language}</button>
          ))}
        </div>

        <button className={styles.newlanguage} onClick={handleAddLanguageClick}>Add Language</button>
        {isAdding && (
          <div>
            <input ref={inputRef} type="text" className={styles.inputField} value={newLanguage} onChange={handleInputChange} onKeyDown={handleAddLanguageSubmit} placeholder="Enter language name"/>
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
                      <td>{index+1}</td>
                      <td>
                        <p>
                          <label htmlFor={`originalVideo-${row.id}`}>Upload Original Video</label>
                          <input type="file" id={`originalVideo-${row.id}`} onChange={(e) => handleOriginalVideo(e, index)}/>
                        </p>
                      </td>
                      <td>
                        <p>
                          <label htmlFor={`generatedVideo-${row.id}`}>Upload Generated Video</label>
                          <input type="file" id={`generatedVideo-${row.id}`} onChange={(e) => handleGeneratedVideo(e, index)}/>
                        </p>
                      </td>
                      <td>{row.overallReview}</td>
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
