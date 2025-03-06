import React, { useState } from "react";

export interface CourseData {
  id: number;
  duration: string;
  title: string;
  enrollment_date: string;
}

interface FilterProps {
  courses: CourseData[]; // Danh sách các khóa học
  onCourseSelect: (courseId: string) => void; 
  selectCourseID: string | null;
}

const Filter: React.FC<FilterProps> = ({ courses, onCourseSelect,selectCourseID }) => {
  const [selectedCourse, setSelectedCourse] = useState(selectCourseID || "");

  const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const courseId = event.target.value;
    setSelectedCourse(courseId);
    onCourseSelect(courseId); // Gọi callback để cập nhật dữ liệu
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <label htmlFor="courseFilter">Lọc khóa học của tôi:</label>
      <select
        id="courseFilter"
        value={selectedCourse}
        onChange={handleSelect}
        style={{ marginLeft: "10px", padding: "5px" }}
      >
      
        {courses.map((course) => (
          <option key={course.id} value={course.id}>
            {course.title}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Filter;
