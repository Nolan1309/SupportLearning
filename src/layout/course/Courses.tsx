import React, { useEffect, useState } from "react";
import "./style.css";
import CourseNav from "./Component/ComponentList/CourseNav";
import CourseList from "./Component/ComponentList/CourseList";
import {
  GET_COURSES_BY_CATEGORIES,
  GET_USER_CATEGORY_COURSE,
  GET_USER_COURSE,
} from "../../api/api";
import { CourseList as CourseListUser } from "../../model/CourseList";
import { CategoryCourse } from "../../model/CategoryCourse";
import { useParams } from "react-router-dom";

interface ApiResponse {
  content: CourseListUser[];
  totalPages: number;
}
interface CategoryResponse {
  _embedded: {
    courseCategories: CategoryCourse[];
  };
}
function Courses() {
  const courseCategoryId = localStorage.getItem("iddanhmuckhoahoc");
  // const { courseCategoryId } = useParams(); // Lấy ID danh mục từ URL
  const [courses, setCourses] = useState<CourseListUser[]>([]);
  const [categories, setCategories] = useState<CategoryCourse[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const coursesPerPage = 6;


  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        let url: string;

        if (courseCategoryId) {
          // Nếu có courseCategoryId trong URL, gọi API lấy khóa học theo danh mục
          url = GET_COURSES_BY_CATEGORIES(
            [Number(courseCategoryId)],
            currentPage,
            coursesPerPage
          );
        } else if (selectedCategories.length > 0) {
          // Nếu có danh mục được chọn, gọi API với các danh mục
          url = GET_COURSES_BY_CATEGORIES(
            selectedCategories,
            currentPage,
            coursesPerPage
          );
        } else {
          // Nếu không có danh mục được chọn, gọi API không có phân loại
          url = GET_USER_COURSE(currentPage, coursesPerPage);
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data: ApiResponse = await response.json();
        setCourses(data.content);
        setTotalPages(data.totalPages);
        // setLoading(false);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
        // setLoading(false);
      }
    };

    fetchCourses();
  }, [courseCategoryId, selectedCategories, currentPage]); // Chạy lại khi courseCategoryId, selectedCategories hoặc currentPage thay đổi

  useEffect(() => {
    const fetchCategories = async () => {
      // setLoading(true);
      try {
        const response = await fetch(GET_USER_CATEGORY_COURSE);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data: CategoryResponse = await response.json();
        setCategories(data._embedded.courseCategories);
        // setLoading(false);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        // setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handlePageChange = (page: number) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  const handleCategoryChange = (id: number) => {
    setSelectedCategories((prevCategories) =>
      prevCategories.includes(id)
        ? prevCategories.filter((catId) => catId !== id)
        : [...prevCategories, id]
    );
    setCurrentPage(0); // Reset trang khi thay đổi danh mục
  };

  // const globalStyles = `
  // @keyframes spin {
  //   0% {
  //     transform: rotate(0deg);
  //   }
  //   100% {
  //     transform: rotate(360deg);
  //   }
  // }
  // `;

  // useEffect(() => {
  //   document.head.insertAdjacentHTML(
  //     "beforeend",
  //     `<style>${globalStyles}</style>`
  //   );
  // }, []);
  // if (loading) {
  //   return <div className="loader"></div>;
  // }
  return (
    <section className="courses-area  pb-120">
      <div className="container">
        <div className="row">
          <div className="col-lg-3 col-md-3 col-sm-3">
            <CourseNav
              categories={categories}
              onCategoryChange={handleCategoryChange}
              onSearchChange={handleSearchChange}
            />
          </div>
          <div className="col-lg-9 col-md-9 col-sm-9">
            <CourseList courses={filteredCourses} />
            <div className="pegi justify-content-center mt-60">
              <a
                href="#0"
                onClick={() => handlePageChange(currentPage - 1)}
                className={`border-none ${currentPage === 0 ? "disabled" : ""}`}
                aria-disabled={currentPage === 0}
              >
                <i className="fa-regular fa-arrow-left primary-color transition"></i>
              </a>
              {[...Array(totalPages)].map((_, index) => (
                <a
                  key={index}
                  href="#0"
                  onClick={() => handlePageChange(index)}
                  className={index === currentPage ? "active" : ""}
                >
                  {index + 1}
                </a>
              ))}
              <a
                href="#0"
                onClick={() => handlePageChange(currentPage + 1)}
                className={`border-none ${
                  currentPage === totalPages - 1 ? "disabled" : ""
                }`}
                aria-disabled={currentPage === totalPages - 1}
              >
                <i className="fa-regular fa-arrow-right primary-color transition"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
export default Courses;
