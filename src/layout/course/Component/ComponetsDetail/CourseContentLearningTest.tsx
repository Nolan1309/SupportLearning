import React, { useEffect, useState } from "react";
import "./CourseContent.css";
import axios from "axios";
import Modal from "react-modal";
import "./CourseContentLearning.css";
import CustomPopup from "./CustomPopup";
export interface VideoViewer {
  id: number;
  title: string;
  url: string;
  documentShort: string;
  documentUrl: string;
  duration: number;
  lesson_id: number;
}

export interface Video {
  videoId: number; // ID của video
  videoTitle: string; // Tiêu đề video
  videoDuration: number;
  viewTest: boolean;
}

// Interface cho Lesson (Bài học)
export interface Chapter {
  chapterId: number;
  chapterTitle: string;
  lessonCount: number;
  videoDTOUserViewList: Video[];
}

// Interface cho toàn bộ dữ liệu trả về từ API
export interface CourseContent {
  chapters: Chapter[]; // Danh sách các bài học trong khóa học
}
const CourseContentLearningTest: React.FC<CourseContent> = ({ chapters }) => {
  // Lưu trữ danh sách các chương đang mở
  const [expandedSections, setExpandedSections] = useState<Set<number>>(
    new Set()
  );
  const [videoViewer, setVideoViewer] = useState<VideoViewer | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const handleNameClick = async (id: number) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_HOST}/api/videos/view-user/${id}`
      );
      setVideoViewer(response.data);
      setIsPopupOpen(true);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const toggleSection = (sectionId: number) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  return (
    <div className="course-content">
      <h2>Nội dung khóa học</h2>
      <p>{`${chapters.length} phần - ${chapters.reduce(
        (acc, sec) => acc + sec.videoDTOUserViewList.length,
        0
      )} bài giảng`}</p>
      <div className="sections">
        {chapters.map((section) => (
          <div key={section.chapterId} className="section">
            <div
              className={`section-header ${expandedSections.has(section.chapterId) ? "expanded" : ""
                }`}
              onClick={() => toggleSection(section.chapterId)}
            >
              <h3>CHƯƠNG {section.chapterTitle}</h3>
              <span>{section.lessonCount}</span>
            </div>
            {expandedSections.has(section.chapterId) && (
              <ul className="lessons">
                {section.videoDTOUserViewList.map((video) => (
                  <li key={video.videoId} className="lesson">
                    <span>{video.videoTitle}</span>
                    <span >
                      <span>
                        {video.viewTest ? (
                          <a
                            href=""
                            onClick={(e) => {
                              e.preventDefault();
                              handleNameClick(video.videoId);
                            }}
                          >
                            Học thử
                          </a>
                        ) : (
                          <span></span>
                        )}
                      </span>
                      <span style={{ marginLeft: "20px" }}>{video.videoDuration}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
      <CustomPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        title={videoViewer?.title || "Loading..."}
      >
        {videoViewer ? (
          <div style={{ width: "100%", height: "100%" }}>
            <video
              src={videoViewer.url}
              controls
              width="100%"
              height="100%"
              style={{ marginBottom: "10px" }}
            ></video>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </CustomPopup>
    </div>
  );
};

export default CourseContentLearningTest;
