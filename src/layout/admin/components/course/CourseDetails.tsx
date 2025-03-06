import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./courseDetails.scss";

interface Lesson {
  id: number;
  title: string;
}

interface Chapter {
  id: number;
  title: string;
  lessons: Lesson[];
}

interface Course {
  id: number;
  name: string;
  description: string;
  status: "completed" | "in-progress";
  numberOfStudents: number;
  chapters: Chapter[];
}

// Sample static course data
const initialCourseData: Course = {
  id: 1,
  name: "Course 1",
  description: "This is a sample course description.",
  status: "completed",
  numberOfStudents: 20,
  chapters: Array.from({ length: 5 }, (_, index) => ({
    id: index + 1,
    title: `Chapter ${index + 1}`,
    lessons: [
      { id: index * 2 + 1, title: `Lesson ${index * 2 + 1}` },
      { id: index * 2 + 2, title: `Lesson ${index * 2 + 2}` },
    ],
  })),
};

const CourseDetails: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate(); // Get the navigate function from useNavigate
  const [courseData, setCourseData] = useState<Course>(initialCourseData);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = () => {
    const chapter = courseData.chapters.find((chapter) =>
      chapter.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSelectedChapter(chapter || null);
  };

  const handleAddChapter = () => {
    const newChapterId = courseData.chapters.length + 1;
    const newChapter: Chapter = {
      id: newChapterId,
      title: `Chapter ${newChapterId}`,
      lessons: [],
    };

    setCourseData((prevCourseData) => ({
      ...prevCourseData,
      chapters: [...prevCourseData.chapters, newChapter],
    }));
  };

  const handleAddLesson = () => {
    if (selectedChapter) {
      const newLessonId = selectedChapter.lessons.length + 1;
      const newLesson: Lesson = {
        id: newLessonId,
        title: `Lesson ${newLessonId}`,
      };

      const updatedChapters = courseData.chapters.map((chapter) =>
        chapter.id === selectedChapter.id
          ? { ...chapter, lessons: [...chapter.lessons, newLesson] }
          : chapter
      );

      setCourseData({ ...courseData, chapters: updatedChapters });
      setSelectedChapter({
        ...selectedChapter,
        lessons: [...selectedChapter.lessons, newLesson],
      });
    }
  };

  const handleEditLesson = () => {
    navigate("/admin/chi-tiet-bai-hoc");
  };

  const handleDeleteLesson = (lessonId: number) => {
    if (selectedChapter) {
      const updatedLessons = selectedChapter.lessons.filter(
        (lesson) => lesson.id !== lessonId
      );

      const updatedChapters = courseData.chapters.map((chapter) =>
        chapter.id === selectedChapter.id
          ? { ...chapter, lessons: updatedLessons }
          : chapter
      );

      setCourseData({ ...courseData, chapters: updatedChapters });
      setSelectedChapter({ ...selectedChapter, lessons: updatedLessons });
    }
  };

  const hasCourseId = location.pathname.includes("chi-tiet-khoa-hoc");

  return (
    <div className="course-details">
      {hasCourseId ? (
        <div className="course-container">
          <div className="course-header">
            <div className="title-course-detail">
              <h1>{courseData.name}</h1>
              <p>{courseData.description}</p>
            </div>

            <div className="action-course-detail">
              <button className="btn btn-primary">Danh sách sinh viên</button>
              <button className="btn btn-primary">Tài Liệu</button>
              <button className="btn btn-primary" ><a href="/admin/chi-tiet-khoa-hoc/ket-qua-khoa-hoc">Kết quả học tập</a></button>
            </div>
          </div>
          <div className="main-content">
            <div className="chapters">
              <div className="search-add-container">
                <input
                  type="text"
                  placeholder="Search chapters..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                <button onClick={handleAddChapter}>Add Chapter</button>
              </div>
              {courseData.chapters.map((chapter) => (
                <div
                  key={chapter.id}
                  className="chapter-item"
                  onClick={() => setSelectedChapter(chapter)}
                >
                  {chapter.title}
                </div>
              ))}
            </div>
            <div className="lessons">
              {selectedChapter ? (
                <>
                  <h2>{selectedChapter.title}</h2>
                  <ul>
                    {selectedChapter.lessons.map((lesson) => (
                      <li key={lesson.id}>
                        {lesson.title}
                        <button onClick={() => handleEditLesson()}>Edit</button>
                        <button onClick={() => handleDeleteLesson(lesson.id)}>
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    className="add-lesson-button"
                    onClick={() => handleEditLesson()}
                  >
                    Add Lesson
                  </button>
                </>
              ) : (
                <p>Please select a chapter to view its lessons.</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <h1>Please select a course to view details.</h1>
        </div>
      )}
    </div>
  );
};

export default CourseDetails;
