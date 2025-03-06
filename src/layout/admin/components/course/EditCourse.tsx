import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableContainer,
  TableRow,
  TableHead,
  Table,
  TableBody,
  TableCell,
  SelectChangeEvent,
  Menu,
} from "@mui/material";
import { ExpandLess, ExpandMore, Add, AttachFile, MoreVert, PermDataSetting, ErrorOutline } from "@material-ui/icons";
import classNames from "classnames";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import BookIcon from "@material-ui/icons/Book";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import { ToggleOff, ToggleOn } from "react-bootstrap-icons";
import styles from "./editCourse.module.scss";
import {
  ADMIN_GET_ONE_COURSE,
  ADMIN_COURSE_GET_CATEGORY_COURSE,
  ADMIN_GET_CHAPTER,
  ADMIN_POST_CHAPTER,
  ADMIN_POST_LESSON,
  ADMIN_DELETE_LESSON,
  ADMIN_UPDATE_COURSE,
  ADMIN_UPDATE_CHAPTER,

  ADMIN_UNSTATUS_COURSE,
  ADMIN_CATEGORY_GET_LEVEL2,
  ADMIN_CATEGORY_GET_LEVEL1,
  ADMIN_CATEGORY_GET_LEVEL3,
  ADMIN_Unlock_CHAPTER,
  ADMIN_lock_CHAPTER,
  ADMIN_PUT_LOCK_LESSON,
  ADMIN_PUT_UNLOCK_LESSON,
  ADMIN_PUT_DELETE_LESSON,
} from "../../../../api/api";
import RequireAdmin from "../../../DOM/RequireAdmin";
import useRefreshToken from "../../../util/fucntion/useRefreshToken";
import { isTokenExpired } from "../../../util/fucntion/auth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import ManageStudentListDialog from "./student_list/ManageStudentListDialog";
import { AddLessonFileDialog } from "./add_lesson_file/AddLessonFileDialog";
import EditLesson from "../lessons/EditLesson";
import ChapterLessonsDialog from "./chapter_lessons/ChapterLessonsDialog";
import ConfirmModal from "../../../util/ConfirmModal";
interface Video {
  id: number;
  createdAt: string;
  deletedDate: string | null;
  documentShort: string;
  documentUrl: string;
  duration: number;
  deleted: boolean;
  videoTitle: string;
  updatedAt: string;
  videoUrl: string;
  lessonId: number;
  viewTest: boolean;
}

interface Lesson {
  id: number;
  lessonTitle: string; // Tên bài học
  courseName: string | null; // Tên khóa học, có thể là null
  chapterName: string | null; // Tên chương, có thể là null
  deleted: boolean;
}
interface CategoryLevel {
  id: number;
  name: string;
  level: number;
  parentId: number | null;
  type: string;
}
export interface AccountTeacherDTO_V2 {
  id: number;
  birthday: string; // Hoặc Date nếu bạn muốn xử lý ngày tháng với đối tượng Date
  createdAt: string;
  deletedDate: string | null; // Có thể null nếu tài khoản chưa bị xóa
  email: string;
  fullname: string;
  gender: string;
  isDeleted: boolean;
  phone: string;
  updatedAt: string;
  roleId: number;
}

const EditCourse: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const courseId = id ? parseInt(id, 10) : 0;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseOutput, setCourseOutput] = useState("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [duration, setDuration] = useState("");
  const [author, setAuthor] = useState("");
  const [cost, setCost] = useState<number>(0);
  const [price, setPrice] = useState<number>();
  const [language, setLanguage] = useState("Vietnamese");
  const [sections, setSections] = useState<any[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [openAddLessonFileDialog, setAddLessonFileOpenDialog] = useState(false); //
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null); // Lưu id của section đang mở dialog

  const handleClickAddLessonFileOpenDialog = (sectionId: number) => {
    setAddLessonFileOpenDialog(true); // Mở dialog
    setSelectedSectionId(sectionId);
  };

  const handleCloseAddLessonFileDialog = (sectionId: number) => {
    setAddLessonFileOpenDialog(false); // Đóng dialog
    setSelectedSectionId(null);
  };

  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingChapterId, setEditingChapterId] = useState<number | null>(null);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [newLessonTitles, setNewLessonTitles] = useState<{
    [key: number]: string;
  }>({});
  // const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [type, setType] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const refresh = useRefreshToken();
  const navigate = useNavigate();
  const [hoveredLessonId, setHoveredLessonId] = useState<number | null>(null);
  const authData = JSON.parse(localStorage.getItem("authData") || "{}"); // Lấy thông tin authData từ localStorage
  const [courseAuthor, setCourseAuthor] = useState<string>(""); // Author from authData
  const token = localStorage.getItem("authToken");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [statusCourse, setStatusCourse] = useState<boolean | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [teacherAccount, setTeacherAccount] = useState<AccountTeacherDTO_V2[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<
    number | null
  >(null);



  const [selectedLevel1, setSelectedLevel1] = useState<number | "">("");
  const [selectedLevel2, setSelectedLevel2] = useState<number | "">("");
  const [selectedLevel3, setSelectedLevel3] = useState<number | "">("");
  const [categoriesLevel1, setCategoriesLevel1] = useState<CategoryLevel[]>([]);
  const [categoriesLevel2, setCategoriesLevel2] = useState<CategoryLevel[]>([]);
  const [categoriesLevel3, setCategoriesLevel3] = useState<CategoryLevel[]>([]);

  const handleClickOpen = () => {
    setOpenDialog(true);
  };
  const handleClose = () => {
    setOpenDialog(false);
  };
  const fetchVideosAll = async () => {
    let token = localStorage.getItem("authToken");

    if (isTokenExpired(token)) {
      token = await refresh();
      if (!token) {
        navigate("/dang-nhap");
        return;
      }
      localStorage.setItem("authToken", token);
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/videos/list/${courseId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch videos");
      }

      const data: Video[] = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching videos:", error);
      return [];
    }
  };

  const fetchAccountTeacherList = async () => {
    let token = localStorage.getItem("authToken");
    if (isTokenExpired(token)) {
      token = await refresh();
      if (!token) {
        window.location.href = "/dang-nhap";
        return;
      }
      localStorage.setItem("authToken", token);
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/account/list-teacher-only`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setTeacherAccount(data);

    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  };

  // Fetch course data
  useEffect(() => {
    fetch(ADMIN_GET_ONE_COURSE(courseId), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then(async (data: any) => {
        setTitle(data.title || "");
        setDescription(data.description || "");
        setCourseOutput(data.courseOutput || "");
        setImageUrl(data.image_url || "");
        setDuration(data.duration || "");
        setAuthor(data.author || "");
        setCost(data.cost ? data.cost.toString() : "");
        setPrice(data.price);
        setLanguage(data.language);
        setType(data.type);
        const categoryResponse3 = await axios.get(data._links.category.href);
        setSelectedLevel3(categoryResponse3.data.id);

        const categoryResponse2 = await axios.get(
          categoryResponse3.data._links.category[1].href
        );
        setSelectedLevel2(categoryResponse2.data.id);

        const categoryResponse1 = await axios.get(
          categoryResponse2.data._links.category[1].href
        );
        setSelectedLevel1(categoryResponse1.data.id);

        setLoading(false);
        return fetch(`${process.env.REACT_APP_SERVER_HOST}/courses/${courseId}/account`);
      })
      .then(response => response.json())
      .then(data => {
        setSelectedTeacher(data.id);
      })
      .catch((error) => {
        console.error("Error fetching course data:", error);
        setLoading(false);
      });

    const fetchCategories = async () => {
      let token = localStorage.getItem("authToken");

      if (isTokenExpired(token)) {
        token = await refresh();
        if (!token) {
          navigate("/dang-nhap");
          return;
        }
        localStorage.setItem("authToken", token);
      }

      try {
        // Fetch categories for all levels
        const [level1Response, level2Response, level3Response] =
          await Promise.all([
            fetch(ADMIN_CATEGORY_GET_LEVEL1, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }),
            fetch(ADMIN_CATEGORY_GET_LEVEL2, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }),
            fetch(ADMIN_CATEGORY_GET_LEVEL3, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }),
          ]);

        if (!level1Response.ok || !level2Response.ok || !level3Response.ok) {
          throw new Error("Failed to fetch categories");
        }

        const [level1Data, level2Data, level3Data] = await Promise.all([
          level1Response.json(),
          level2Response.json(),
          level3Response.json(),
        ]);

        const filteredLevel1 = level1Data.filter(
          (category: CategoryLevel) => category.type === "course"
        );
        const filteredLevel2 = level2Data.filter(
          (category: CategoryLevel) => category.type === "course"
        );
        const filteredLevel3 = level3Data.filter(
          (category: CategoryLevel) => category.type === "course"
        );

        setCategoriesLevel1(filteredLevel1);
        setCategoriesLevel2(filteredLevel2);
        setCategoriesLevel3(filteredLevel3);


      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetch(ADMIN_GET_CHAPTER(courseId), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setSections(
          data.map((chapter: any) => ({
            id: chapter.id,
            title: chapter.title,
            deteled: chapter.deteled,
            status: chapter.status,
            items: chapter.lessonList.map((lesson: any) => ({
              id: lesson.id,
              type: "lesson",
              title: lesson.title,
              deleted: lesson.deleted,
              status: lesson.status,
              isTestExcluded: lesson.isTestExcluded,
              topic: lesson.topic,
              icon: <BookIcon />,
            })),
            open: false,
            files: []
          }))
        );
        console.log(sections);
      })
      .catch((error) => {
        console.error("Error fetching chapters:", error);
      });

    // fetch(ADMIN_COURSE_GET_CATEGORY_COURSE, {
    //   method: "GET",
    //   headers: {
    //     Authorization: `Bearer ${token}`,
    //     "Content-Type": "application/json",
    //   },
    // })
    //   .then((response) => {
    //     if (!response.ok) {
    //       throw new Error(`HTTP error! status: ${response.status}`);
    //     }
    //     return response.json();
    //   })
    //   .then((data) => {
    //     setCategories(data._embedded.courseCategories || []);
    //   })
    //   .catch((error) => {
    //     console.error("Error fetching categories:", error);
    //   });

    const getVideos = async () => {
      const videoData = await fetchVideosAll();
      setVideos(videoData || []);
    };

    getVideos();
    fetchCategories();
    fetchAccountTeacherList();

  }, [courseId]);

  useEffect(() => {
    if (type === "FREE") {
      setCost(0); // Nếu `type` là "FREE", `cost` sẽ tự động là 0
    }
  }, [type]);
  const handleDialogOpen = () => {
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };
  const handleEditChapter = (chapterId: number, title: string) => {
    setEditingChapterId(chapterId);
    setNewChapterTitle(title); // Đặt tên chapter hiện tại vào trường nhập
    setIsEditDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsEditDialogOpen(false);
    setNewChapterTitle("");
    setEditingChapterId(null);
  };
  const handleSaveChapter = () => {
    if (editingChapterId !== null) {
      // Gửi API để cập nhật chapter với ID và tên mới
      fetch(ADMIN_UPDATE_CHAPTER(editingChapterId), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: newChapterTitle }),
      })
        .then((response) => {
          if (response.ok) {
            // Cập nhật thành công, đóng dialog và làm mới dữ liệu
            setIsEditDialogOpen(false);
            setNewChapterTitle("");
            setEditingChapterId(null);

            // Cập nhật trực tiếp trong state `sections`
            setSections((prevSections) => {
              return prevSections.map((section) => {
                if (section.id === editingChapterId) {
                  // Nếu chapter id trùng với chapter đang sửa, cập nhật lại title
                  return {
                    ...section,
                    title: newChapterTitle,
                  };
                }
                return section;
              });
            });
          } else {
            // Xử lý lỗi nếu có
            console.error("Error updating chapter");
          }
        })
        .catch((error) => console.error("Error updating chapter:", error));
    }
  };

  const handleToggleSection = (index: number) => {
    setSections((prevSections) =>
      prevSections.map((section, i) =>
        i === index ? { ...section, open: !section.open } : section
      )
    );
  };
  const handleEditLesson = (lessonId: number) => {
    // localStorage.setItem("courseId", id!);
    // navigate(`/admin/edit-bai-hoc/${lessonId}`);
    setOpenEditLessonDialog(true);
    setSelectedSectionId(lessonId);
    // console.log(lessonId);
  };



  const handleDeleteLesson = (lessonId: number, chapterId: number) => {
    fetch(ADMIN_PUT_DELETE_LESSON(lessonId), {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete lesson");
        }
        return response.json();
      })
      .then(() => {
        const updatedSections = sections.map((section) => {
          if (section.id === chapterId) {
            return {
              ...section,
              items: section.items.filter(
                (item: { id: number }) => item.id !== lessonId
              ),
            };
          }
          return section;
        });
        setSections(updatedSections);
      })
      .catch((error) => {
        console.error("Error deleting lesson:", error);
      });
  };

  const fetchCourseStatus = async (): Promise<boolean | null> => {
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/courses/courses/status?courseId=${courseId}`
      );

      if (!response.ok) {
        throw new Error(`Course not found or API error: ${response.status}`);
      }

      const data = await response.json();
      setStatusCourse(data); // Cập nhật state trong React nếu cần

      return data;
    } catch (error: any) {
      toast.error("Lỗi kiểm tra! Không thể thêm.");
      return null; // Trả về null nếu có lỗi
    } finally {
      setLoading(false);
    }
  };

  // const handleAddNewLesson = async (chapterId: number) => {
  //   if (!newLessonTitles[chapterId]?.trim()) {
  //     return;
  //   }

  //   let status = await fetchCourseStatus();
  //   if (status) {
  //     // Tiến hành khóa bài học lại, hỏi xác nhận lại có muốn khóa bài học không?
  //     toast.error(
  //       "Khóa học đã được kích hoạt ! Vui lòng khóa bài học trước khi thêm bài học"
  //     );
  //     setTimeout(() => {
  //       if (window.confirm("Bạn có muốn khóa bài học không?")) {
  //         fetch(`${ADMIN_UNSTATUS_COURSE}/${id}`, {
  //           method: "PUT",
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         })
  //           .then((response) => {
  //             if (response.ok) {
  //               alert("Bài học đã được khóa thành công");
  //             }
  //           })
  //           .catch((error) => {
  //             console.error("Error deleting account:", error);
  //           });
  //       } else {
  //         return;
  //       }
  //     }, 3000);
  //   }

  //   const lessonData = {
  //     title: newLessonTitles[chapterId],
  //     chapter_id: chapterId,
  //     course_id: courseId,
  //   };

  //   fetch(ADMIN_POST_LESSON, {
  //     method: "POST",
  //     headers: {
  //       Authorization: `Bearer ${token}`,
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify(lessonData),
  //   })
  //     .then((response) => {
  //       if (!response.ok) {
  //         throw new Error("Failed to add lesson");
  //       }
  //       return response.json();
  //     })
  //     .then((newLesson) => {
  //       const updatedSections = sections.map((section) => {
  //         if (section.id === chapterId) {
  //           return {
  //             ...section,
  //             items: [
  //               ...section.items,
  //               {
  //                 id: newLesson.id,
  //                 title: newLesson.title,
  //                 icon: <BookIcon />,
  //               },
  //             ],
  //           };
  //         }
  //         return section;
  //       });
  //       setSections(updatedSections);
  //       setNewLessonTitles((prevTitles) => ({
  //         ...prevTitles,
  //         [chapterId]: "",
  //       }));
  //     })
  //     .catch((error) => {
  //       console.error("Error adding lesson:", error);
  //     });
  // };

  const handleAddNewLesson = async (chapterId: number) => {
    if (!newLessonTitles[chapterId]?.trim()) {
      return;
    }

    let status = await fetchCourseStatus();
    if (status) {
      toast.error(
        "Khóa học đã được kích hoạt! Vui lòng khóa khóa học trước khi thêm bài học"
      );

      setTimeout(() => {
        if (window.confirm("Bạn có muốn khóa khóa học không?")) {
          fetch(`${ADMIN_UNSTATUS_COURSE}/${id}`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
            .then((response) => {
              if (response.ok) {
                alert("Khóa học đã được khóa thành công");

                createNewLesson(chapterId);
              }
            })
            .catch((error) => {
              console.error("Error locking course:", error);
            });
        } else {
          return;
        }
      }, 3000);
    } else {
      createNewLesson(chapterId);
    }
  };

  // Hàm tạo bài học mới
  const createNewLesson = (chapterId: number) => {
    const lessonData = {
      title: newLessonTitles[chapterId],
      chapter_id: chapterId,
      course_id: courseId,
    };

    fetch(ADMIN_POST_LESSON, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(lessonData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to add lesson");
        }
        return response.json();
      })
      .then((newLesson) => {
        const updatedSections = sections.map((section) => {
          if (section.id === chapterId) {
            return {
              ...section,
              items: [
                ...section.items,
                {
                  id: newLesson.id,
                  title: newLesson.title,
                  icon: <BookIcon />,
                },
              ],
            };
          }
          return section;
        });
        setSections(updatedSections);
        setNewLessonTitles((prevTitles) => ({
          ...prevTitles,
          [chapterId]: "",
        }));
        toast.success("Thêm bài học thành công");
      })
      .catch((error) => {
        console.error("Error adding lesson:", error);
      });
  };

  const handleAddNewSection = () => {
    if (!newChapterTitle.trim()) {
      return;
    }

    const chapterData = {
      title: newChapterTitle,
      id_course: courseId,
    };

    fetch(ADMIN_POST_CHAPTER, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(chapterData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to add chapter");
        }
        return response.json();
      })
      .then((newChapter) => {
        setSections([
          ...sections,
          {
            id: newChapter.id,
            title: newChapter.title,
            items: [],
            open: false,
          },
        ]);
        setNewChapterTitle("");
      })
      .catch((error) => {
        console.error("Error adding chapter:", error);
      });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string); // Save Base64 string to state
      };
      reader.readAsDataURL(file); // Convert file to base64 string
    }
  };

  const handleUpdateCourse = async () => {
    if (!cost && type === "FEE") {
      toast.warning("Vui lòng điền chi phí!");
      return;
    }
    if (cost <= 5 && type === "FEE") {
      toast.warning("Chi phí phải lón hơn 0!");
      return;
    }

    let accountIdParam = selectedTeacher;
    if (authData.roleId === 3) {
      accountIdParam = authData.roleId;
    }
    const courseData = {
      coursesTitle: title,
      description: description,
      courseOutput: courseOutput,
      imageUrl: imageUrl,
      duration: duration,
      author: courseAuthor,
      cost: cost,
      price: cost,
      language: language,
      courseCategoryId: selectedLevel3,
      accountId: accountIdParam,
      type: type,
    };

    try {
      // Gửi yêu cầu PUT đến API để cập nhật khóa học
      const response = await fetch(ADMIN_UPDATE_COURSE(courseId), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(courseData),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      // Nếu thành công, chuyển hướng về trang chi tiết khóa học hoặc danh sách khóa học
      const updatedCourse = await response.json();
      console.log("Course updated successfully:", updatedCourse);
      navigate(`/admin/khoa-hoc`);
    } catch (error) {
      console.error("Error updating course:", error);
      alert("Failed to update course. Please try again later.");
    }
  };

  const handleUnlockChapter = async (id: number) => {
    let token = localStorage.getItem("authToken");
    if (isTokenExpired(token)) {
      token = await refresh();
      if (!token) {
        navigate("/dang-nhap");
        return;
      }
      localStorage.setItem("authToken", token);
    }
    fetch(`${ADMIN_Unlock_CHAPTER}/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          setSections((prevChapters) =>
            prevChapters.map((chapter) =>
              chapter.id === id ? { ...chapter, status: true } : chapter
            )
          );
          // alert("Chương đã được mở khóa thành công");
          toast.success("Chương đã được mở khóa thành công!")
        } else {
          toast.warn("Có lỗi xảy ra khi mở khóa chương!")
          // alert("Có lỗi xảy ra khi mở khóa chương");
        }
      })
      .catch((error) => {
        console.error("Error deleting chapter:", error);
        toast.warn("Có lỗi xảy ra khi mở khóa chương!")
      });
  };
  const handleLockChapter = async (id: number) => {
    let token = localStorage.getItem("authToken");
    if (isTokenExpired(token)) {
      token = await refresh();
      if (!token) {
        navigate("/dang-nhap");
        return;
      }
      localStorage.setItem("authToken", token);
    }
    fetch(`${ADMIN_lock_CHAPTER}/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          setSections((prevChapters) =>
            prevChapters.map((chapter) =>
              chapter.id === id ? { ...chapter, status: false } : chapter
            )
          );
          // alert("Chương đã được khóa thành công");
          toast.success("Chương đã được khóa thành công!")
        } else {
          toast.warn("Có lỗi xảy ra khi khóa Chương!")
          // alert("Có lỗi xảy ra khi kích hoạt Chương");
        }
      })
      .catch((error) => {
        toast.warn("Có lỗi xảy ra khi khóa Chương!")
      });
  };

  // const handleHide = async (id: number) => {
  //   let token = localStorage.getItem("authToken");
  //   if (isTokenExpired(token)) {
  //     token = await refresh();
  //     if (!token) {
  //       navigate("/dang-nhap");
  //       return;
  //     }
  //     localStorage.setItem("authToken", token);
  //   }
  //   fetch(`${ADMIN_HIDE_CHAPTER}/${id}`, {
  //     method: "PUT",
  //     headers: {
  //       Authorization: `Bearer ${token}`,
  //     },
  //   })
  //     .then((response) => {
  //       if (response.ok) {
  //         setSections((prevLessons) =>
  //           prevLessons.map((lesson) =>
  //             lesson.id === id ? { ...lesson, deleted: true } : lesson
  //           )
  //         );
  //         alert("Bài học đã được khóa thành công");
  //       } else {
  //         alert("Có lỗi xảy ra khi khóa Bài học");
  //       }
  //     })
  //     .catch((error) => {
  //       console.error("Error deleting account:", error);
  //       alert("Có lỗi xảy ra khi khóa Bài học");
  //     });
  // };




  // const handleShow = async (id: number) => {
  //   let token = localStorage.getItem("authToken");
  //   if (isTokenExpired(token)) {
  //     token = await refresh();
  //     if (!token) {
  //       navigate("/dang-nhap");
  //       return;
  //     }
  //     localStorage.setItem("authToken", token);
  //   }
  //   fetch(`${ADMIN_SHOW_CHAPTER}/${id}`, {
  //     method: "PUT",
  //     headers: {
  //       Authorization: `Bearer ${token}`,
  //     },
  //   })
  //     .then((response) => {
  //       if (response.ok) {
  //         setSections((prevLessons) =>
  //           prevLessons.map((lesson) =>
  //             lesson.id === id ? { ...lesson, deleted: false } : lesson
  //           )
  //         );
  //         alert("Bài học đã được kích hoạt thành công");
  //       } else {
  //         alert("Có lỗi xảy ra khi kích hoạt Bài học");
  //       }
  //     })
  //     .catch((error) => {
  //       console.error("Error updating account activation status:", error);
  //       alert("Có lỗi xảy ra khi kích hoạt Bài học");
  //     });
  // };

  // const handleHideLesson = async (id: number) => {
  //   let token = localStorage.getItem("authToken");

  //   if (isTokenExpired(token)) {
  //     token = await refresh();
  //     if (!token) {
  //       navigate("/dang-nhap");
  //       return;
  //     }
  //     localStorage.setItem("authToken", token);
  //   }

  //   fetch(`${ADMIN_PUT_DELETE_LESSON_CLEAR}/${id}`, {
  //     method: "PUT",
  //     headers: {
  //       Authorization: `Bearer ${token}`,
  //     },
  //   })
  //     .then((response) => {
  //       if (response.ok) {
  //         setSections((prevLessons) =>
  //           prevLessons.map((lesson) =>
  //             lesson.id === id ? { ...lesson, deleted: true } : lesson
  //           )
  //         );
  //         alert("Bài học đã được khóa thành công");
  //         window.location.reload();
  //       } else {
  //         alert("Có lỗi xảy ra khi khóa Bài học");
  //       }
  //     })
  //     .catch((error) => {
  //       console.error("Error deleting account:", error);
  //       alert("Có lỗi xảy ra khi khóa Bài học");
  //     });
  // };

  // const handleShowLesson = async (id: number) => {
  //   let token = localStorage.getItem("authToken");

  //   if (isTokenExpired(token)) {
  //     token = await refresh();
  //     if (!token) {
  //       navigate("/dang-nhap");
  //       return;
  //     }
  //     localStorage.setItem("authToken", token);
  //   }

  //   fetch(`${ADMIN_PUT_ACTIVE_LESSON_CLEAR}/${id}`, {
  //     method: "PUT",
  //     headers: {
  //       Authorization: `Bearer ${token}`,
  //     },
  //   })
  //     .then((response) => {
  //       if (response.ok) {
  //         setSections((prevLessons) =>
  //           prevLessons.map((lesson) =>
  //             lesson.id === id ? { ...lesson, deleted: false } : lesson
  //           )
  //         );
  //         alert("Bài học đã được kích hoạt thành công");
  //         window.location.reload();
  //       } else {
  //         alert("Có lỗi xảy ra khi kích hoạt Bài học");
  //       }
  //     })
  //     .catch((error) => {
  //       console.error("Error updating account activation status:", error);
  //       alert("Có lỗi xảy ra khi kích hoạt Bài học");
  //     });
  // };


  const handleUnlockLesson = async (id: number) => {
    let token = localStorage.getItem("authToken");

    if (isTokenExpired(token)) {
      token = await refresh();
      if (!token) {
        navigate("/dang-nhap");
        return;
      }
      localStorage.setItem("authToken", token);
    }

    try {
      const response = await fetch(`${ADMIN_PUT_UNLOCK_LESSON}/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      let data;
      try {
        data = await response.json(); // Lấy dữ liệu từ phản hồi
      } catch (error) {
        console.warn("Không thể parse JSON từ phản hồi:", error);
        data = { message: "Lỗi không xác định từ server", status: response.status };
      }

      if (response.ok && data.status === 200) {
        // Cập nhật trạng thái bài học đã mở khóa
        setSections((prevChapters) =>
          prevChapters.map((chapter) => ({
            ...chapter,
            items: chapter.items.map((lesson: any) =>
              lesson.id === id ? { ...lesson, status: true } : lesson
            ),
          }))
        );
        toast.success(data.message || "Bài học đã được mở khóa thành công!");
      } else {
        // console.warn(`Lỗi mở khóa bài học (status: ${response.status}):`, data.message);
        toast.warn(data.message || "Có lỗi xảy ra khi mở khóa bài học!");
      }
    } catch (error) {
      console.warn("Lỗi hệ thống:", error);
      toast.warn("Đã xảy ra lỗi khi mở khóa bài học. Vui lòng thử lại sau!");
    }
  };


  const handleLockLesson = async (id: number) => {
    let token = localStorage.getItem("authToken");

    if (isTokenExpired(token)) {
      token = await refresh();
      if (!token) {
        navigate("/dang-nhap");
        return;
      }
      localStorage.setItem("authToken", token);
    }

    fetch(`${ADMIN_PUT_LOCK_LESSON}/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          setSections((prevChapters) =>
            prevChapters.map((chapter) => ({
              ...chapter,
              items: chapter.items.map((lesson: any) =>
                lesson.id === id
                  ? { ...lesson, status: false } // Cập nhật trạng thái của bài học cần thay đổi
                  : lesson // Giữ nguyên các bài học không thay đổi
              ),
            }))
          );
          // alert("Bài học đã được kích hoạt thành công");
          toast.success("Bài học đã được khóa thành công!")
          // window.location.reload();
        } else {
          // alert("Có lỗi xảy ra khi kích hoạt Bài học");
          toast.warn("Có lỗi xảy ra khi khóa bài học!")
        }
      })
      .catch((error) => {
        console.error("Error updating account activation status:", error);
        toast.warn("Có lỗi xảy ra khi khóa bài học!")
      });
  };

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isConfirmOpenDelete, setIsConfirmOpenDelete] = useState(false);
  const [isConfirmOpenChapter, setIsConfirmOpenChapter] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);

  const [actionType, setActionType] = useState<"lock" | "unlock" | null>(null);
  const [actionTypeChapter, setActionTypeChapter] = useState<"lockChapter" | "unlockChapter" | null>(null);

  const handleOpenConfirmModal = (lessonId: number, type: "lock" | "unlock") => {
    setSelectedLessonId(lessonId);
    setActionType(type);
    setIsConfirmOpen(true);
  };

  // ✅ Đóng modal
  const handleCloseModal = () => {
    setIsConfirmOpen(false);
    setSelectedLessonId(null);
    setActionType(null);
  };
  const handleConfirmAction = () => {
    if (selectedLessonId !== null && actionType) {
      if (actionType === "lock") {
        handleLockLesson(selectedLessonId);
      } else {
        handleUnlockLesson(selectedLessonId);
      }
    }
    handleCloseModal();
  };

  const handleOpenConfirmModalChapter = (chapterId: number, type: "lockChapter" | "unlockChapter") => {
    setSelectedChapterId(chapterId);
    setActionTypeChapter(type);
    setIsConfirmOpenChapter(true);
  };
  // ✅ Đóng modal
  const handleCloseModalChapter = () => {
    setIsConfirmOpenChapter(false);
    setSelectedChapterId(null);
    setActionTypeChapter(null);
  };


  const handleConfirmActionChapter = () => {
    if (selectedChapterId !== null && actionTypeChapter) {
      if (actionTypeChapter === "lockChapter") {
        handleLockChapter(selectedChapterId);
      } else {
        handleUnlockChapter(selectedChapterId);
      }
    }
    handleCloseModalChapter();
  };


  const handleOpenConfirmModalDeleteLesson = (lessonId: number, chapterId: number) => {
    setSelectedLessonId(lessonId);
    setSelectedChapterId(chapterId);
    setIsConfirmOpenDelete(true);
  };

  // ✅ Đóng modal
  const handleCloseModalDeleteLesson = () => {
    setIsConfirmOpenDelete(false);
    setSelectedLessonId(null)
    setSelectedChapterId(null);
  };
  const handleConfirmActionDeleteLesson = () => {
    if (selectedLessonId !== null && selectedChapterId !== null) {
      handleDeleteLesson(selectedLessonId, selectedChapterId);
    }
    handleCloseModalDeleteLesson();
  };

  // const toggleViewTest = (videoId: number) => {
  //   setVideos((prevVideos) =>
  //     prevVideos.map((video) =>
  //       video.id === videoId
  //         ? { ...video, isViewTest: !video.isViewTest } // Chuyển trạng thái
  //         : video
  //     )
  //   );
  // };
  const updateVideoStatus = async (videoId: number, viewTest: boolean) => {
    try {
      let token = localStorage.getItem("authToken");

      if (isTokenExpired(token)) {
        token = await refresh();
        if (!token) {
          navigate("/dang-nhap");
          return;
        }
        localStorage.setItem("authToken", token);
      }

      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/videos/viewtest/${videoId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            isViewTest: viewTest,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update video status");
      }

      setVideos((prevVideos) =>
        prevVideos.map((video) =>
          video.id === videoId ? { ...video, viewTest } : video
        )
      );
    } catch (error) {
      console.error("Error updating video status:", error);
    }
  };
  const handleUpdateStatus = (videoId: number, currentStatus: boolean) => {
    updateVideoStatus(videoId, !currentStatus); // Đảo ngược trạng thái
  };

  const handleLevel1Change = (e: SelectChangeEvent<number | "">) => {
    const level1Id = e.target.value as number;
    setSelectedLevel1(level1Id);
    setSelectedLevel2("");
    setSelectedLevel3("");
  };

  const handleLevel2Change = (e: SelectChangeEvent<number | "">) => {
    const level2Id = e.target.value as number;
    setSelectedLevel2(level2Id);
    setSelectedLevel3("");
  };

  const handleLevel3Change = (e: SelectChangeEvent<number | "">) => {
    const level3Id = e.target.value as number;
    setSelectedLevel3(level3Id);
  };


  const [openAccountStudentDialog, setOpenAccountStudentDialog] = useState(false); // Quản lý trạng thái mở/đóng Dialog

  const handleAccountStudentDialogOpen = () => {
    setOpenAccountStudentDialog(true);
  };

  const handleAccountStudentDialogClose = () => {
    setOpenAccountStudentDialog(false);
  };

  const handleAccountChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const selectedTeacherId = event.target.value as number;
    setSelectedTeacher(selectedTeacherId);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Chuyển đổi FileList thành mảng và cập nhật state files
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    }
  };
  const handleAddLessonFileFileUpload = (uploadedFiles: File[], sectionId: number) => {
    // Cập nhật danh sách tệp sau khi tải lên cho section cụ thể
    setSections((prevSections) =>
      prevSections.map((section) =>
        section.id === sectionId
          ? {
            ...section,
            files: [...section.files || [], ...uploadedFiles], // Thêm các tệp tải lên vào đúng section
          }
          : section
      )
    );
  };
  const handleRemoveFile = (fileIndex: number, sectionId: number) => {
    // Update the files for the specific section
    setSections((prevSections) =>
      prevSections.map((section) =>
        section.id === sectionId
          ? {
            ...section,
            files: section.files.filter((_: any, index: any) => index !== fileIndex), // Remove file at the specified index
          }
          : section
      )
    );
  };
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  // Function to open the menu
  const handleClickMenuChapter = (event: React.MouseEvent<HTMLElement>, sectionId: number) => {
    setMenuState({ anchorEl: event.currentTarget, selectedSectionId: sectionId });
  };
  const [menuState, setMenuState] = useState<{ anchorEl: HTMLElement | null; selectedSectionId: number | null }>({
    anchorEl: null,
    selectedSectionId: null,
  });
  // Function to close the menu
  const handleCloseMenuChapter = () => {
    setMenuState({ anchorEl: null, selectedSectionId: null });
  };
  const [openEditLessonDialog, setOpenEditLessonDialog] = useState(false);

  const [openChapterLessonsDialog, setOpenChapterLessonsDialog] = useState(false);



  const [section1, setSection1] = useState<any>();



  const handleChapterLesson = (chapterId: number, title: string) => {
    setEditingChapterId(chapterId);
    setNewChapterTitle(title);
    setOpenChapterLessonsDialog(true)
  };

  return (
    <Box p={2}>
      <Paper
        style={{ padding: "16px", marginBottom: "16px", textAlign: "center" }}
      >
        <Typography variant="h5" gutterBottom>
          THÔNG TIN KHÓA HỌC
        </Typography>
        <Button
          variant="contained"
          className={classNames("btn", "btn-primary", styles.whiteBtn)}
          color="primary"
          onClick={handleDialogOpen}
        >
          Thông tin chi tiết
        </Button>
        <Button
          variant="contained"
          className={classNames("btn", "btn-primary", styles.whiteBtn)}
          color="primary"
          onClick={handleAccountStudentDialogOpen}
        >
          Danh sách học viên
        </Button>
      </Paper>

      {/* Curriculum */}
      <Paper style={{ padding: "16px", marginBottom: "16px", minHeight: "600px" }}>
        <Typography variant="h5" gutterBottom>
          CẤU TRÚC KHÓA HỌC
          <a href="#" onClick={handleClickOpen} style={{ float: "right" }}>
            <span>Video miễn phí</span>
          </a>
        </Typography>

        {sections.map((section, index) => (
          <Paper key={section.id} style={{ marginBottom: "16px", padding: "16px" }}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              style={{ display: "flex", alignItems: "center" }}
            >

              {!section.status ? (
                <Typography style={{ color: "red" }} variant="h6">Chương: {section.title}</Typography>
              ) : (
                <Typography variant="h6">Chương {index + 1}: {section.title}</Typography>
              )}



              <div style={{ flex: "1", textAlign: "right", marginTop: "4px" }}>

                <IconButton onClick={(event) => handleClickMenuChapter(event, section.id)}>
                  <MoreVert />
                </IconButton>

                <Menu

                  anchorEl={menuState.anchorEl}
                  open={Boolean(menuState.anchorEl) && menuState.selectedSectionId === section.id}
                  onClose={handleCloseMenuChapter}
                >

                  {!section.status ? (
                    <MenuItem style={{ color: "red", paddingLeft: "0px" }} onClick={() => { handleOpenConfirmModalChapter(section.id, "unlockChapter"); handleCloseMenuChapter(); }}>
                      <ToggleOff style={{ width: "40px" }} /> Không hoạt động
                    </MenuItem>
                  ) : (
                    <MenuItem style={{ color: "green", paddingLeft: "0px" }} onClick={() => { handleOpenConfirmModalChapter(section.id, "lockChapter"); handleCloseMenuChapter(); }}>
                      <ToggleOn style={{ width: "40px" }} />  Đang hoạt động
                    </MenuItem>
                  )}


                  <MenuItem style={{ paddingLeft: "0px" }} onClick={() => { handleEditChapter(section.id, section.title); handleCloseMenuChapter(); }}>
                    <EditIcon style={{ width: "40px" }} /> Chỉnh sửa chương
                  </MenuItem>

                  <MenuItem style={{ paddingLeft: "0px" }} onClick={() => { handleChapterLesson(section.id, section.title) }}>
                    <PermDataSetting style={{ width: "40px" }} /> Cấu Hình Bài Test Cho Bài Học
                  </MenuItem>
                </Menu>

                <IconButton onClick={() => handleToggleSection(index)}>
                  {section.open ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </div>
            </Box>

            {section.open && (
              <>
                <List component="div" disablePadding>
                  {section.items.map((item: any) => (






                    <ListItem
                      key={item.id}
                      style={{ borderTop: "0.5px solid #ccc" }}
                      onMouseEnter={() => setHoveredLessonId(item.id)}
                      onMouseLeave={() => setHoveredLessonId(null)}
                    >


                      <ListItemIcon>{item.icon}</ListItemIcon>



                      {!item.status ? (
                        <ListItemText><p style={{ color: "red", paddingLeft: "0px" }}>{item.title}</p> </ListItemText>
                      ) : (
                        <ListItemText><p>{item.title}</p></ListItemText>
                      )}





                      <Box display="flex" >


                        {(item.topic === null || item.isTestExcluded === null) && (
                          <IconButton
                            style={{ color: "red" }}
                          >
                            <ErrorOutline style={{ width: "35px", fontSize: "20px" }} />
                          </IconButton>
                        )}

                        <IconButton
                          color="primary"
                          onClick={() => handleEditLesson(item.id)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="secondary"
                          onClick={() =>
                            handleOpenConfirmModalDeleteLesson(item.id, section.id)
                          }
                        >
                          <DeleteIcon />
                        </IconButton>

                        {!item.status ? (
                          <IconButton
                            style={{ color: "red", paddingLeft: "0px" }}
                            onClick={() => handleOpenConfirmModal(item.id, "unlock")}
                          >
                            <ToggleOff style={{ width: "40px", fontSize: "20px" }} />
                          </IconButton>
                        ) : (
                          <IconButton
                            style={{ color: "green", paddingLeft: "0px" }}
                            onClick={() => handleOpenConfirmModal(item.id, "lock")}
                          >
                            <ToggleOn style={{ width: "40px", fontSize: "20px" }} />
                          </IconButton>
                        )}
                      </Box>

                      {/* )} */}
                    </ListItem>
                  )
                  )}

                  <ListItem>
                    <IconButton onClick={() => handleClickAddLessonFileOpenDialog(section.id)}>
                      <AttachFile />
                    </IconButton>
                    <TextField
                      fullWidth
                      margin="normal"
                      variant="outlined"
                      placeholder="Enter new lesson title"
                      value={newLessonTitles[section.id] || ""}
                      onChange={(e) => {
                        const { value } = e.target;
                        setNewLessonTitles((prevTitles) => ({
                          ...prevTitles,
                          [section.id]: value,
                        }));
                      }}
                    />
                    <Button
                      style={{ margin: "0px 10px 0px 20px" }}
                      className="white-btn btn-primary"
                      disabled={!newLessonTitles[section.id]?.trim()}
                      onClick={() => handleAddNewLesson(section.id)}
                    >
                      THÊM BÀI
                    </Button>
                  </ListItem>
                </List>
              </>
            )}
          </Paper>
        ))}

        {/* TextField để thêm section mới */}
        <TextField
          style={{ marginTop: "30px" }}
          label="Tiêu đề chương"
          fullWidth
          margin="normal"
          variant="outlined"
          placeholder="Nhập tiêu đề chương"
          value={newChapterTitle}
          onChange={(e) => setNewChapterTitle(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={handleAddNewSection}
          disabled={!newChapterTitle.trim()}
          style={{ display: "flex", alignItems: "center", lineHeight: "32px" }}
        >
          Thêm chương
        </Button>
      </Paper>

      {/* Dialog for Editing Course Details */}
      <Dialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>THÔNG TIN CHI TIẾT KHÓA HỌC</DialogTitle>
        <DialogContent>

          <div className="row">
            <div className="col-md-7">
              <TextField
                label="Tên khóa học"
                fullWidth
                margin="normal"
                variant="outlined"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Box className={styles["input-group"]}>
                <FormControl
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  required
                  // error={!!formErrors.idCategory}
                  className={styles["form-control"]}
                >
                  <InputLabel id="level1-label">Ngành học</InputLabel>
                  <Select
                    labelId="level1-label"
                    id="level1-select"
                    value={selectedLevel1}
                    onChange={handleLevel1Change}
                    label="Ngành học"
                  >
                    <MenuItem value="">
                      <em>Chọn ngành</em>
                    </MenuItem>
                    {categoriesLevel1.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {/* {formErrors.idCategory && (
                <FormHelperText>{formErrors.idCategory}</FormHelperText>
              )} */}
                </FormControl>
              </Box>

              {/* Category Level 2 */}
              <Box className={styles["input-group"]}>
                <FormControl
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  required
                  // error={!!formErrors.idCategory}
                  className={styles["form-control"]}
                  disabled={selectedLevel1 === ""}
                >
                  <InputLabel id="level2-label">Khoa</InputLabel>
                  <Select
                    labelId="level2-label"
                    id="level2-select"
                    value={selectedLevel2}
                    onChange={handleLevel2Change}
                    label="Khoa"
                  >
                    <MenuItem value="">
                      <em>Chọn khoa</em>
                    </MenuItem>
                    {categoriesLevel2
                      .filter((category) => category.parentId === selectedLevel1)
                      .map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}
                  </Select>
                  {/* {formErrors.idCategory && (
                <FormHelperText>{formErrors.idCategory}</FormHelperText>
              )} */}
                </FormControl>
              </Box>

              {/* Category Level 3 */}
              <Box className={styles["input-group"]}>
                <FormControl
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  required
                  // error={!!formErrors.idCategory}
                  className={styles["form-control"]}
                  disabled={selectedLevel2 === ""}
                >
                  <InputLabel id="level3-label">Môn học</InputLabel>
                  <Select
                    labelId="level3-label"
                    id="level3-select"
                    value={selectedLevel3}
                    onChange={handleLevel3Change}
                    label="Môn học"
                  >
                    <MenuItem value="">
                      <em>Chọn môn học</em>
                    </MenuItem>
                    {categoriesLevel3
                      .filter((category) => category.parentId === selectedLevel2)
                      .map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}
                  </Select>
                  {/* {formErrors.idCategory && (
                <FormHelperText>{formErrors.idCategory}</FormHelperText>
              )} */}
                </FormControl>
              </Box>


              {authData.roleId === 1 && (
                <div style={{ marginTop: '10px ' }}>
                  <TextField
                    label="Chọn giáo viên"
                    variant="outlined"
                    fullWidth
                    select
                    value={selectedTeacher}
                    onChange={handleAccountChange}
                    sx={{ marginBottom: "20px" }}
                  >
                    {teacherAccount.map((account) => (
                      <MenuItem key={account.id} value={account.id}>
                        {account.fullname}
                      </MenuItem>
                    ))}
                  </TextField>
                </div>
              )}

              <TextField
                className={styles["text-field"]}
                select
                label="Loại Khóa Học"
                variant="outlined"
                value={type}
                onChange={(e) => setType(e.target.value)}
                fullWidth
                margin="normal"
                required
              >
                <MenuItem value="FREE">FREE</MenuItem>
                <MenuItem value="FEE">FEE</MenuItem>
              </TextField>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <TextField
                  label="Chi phí"
                  variant="outlined"
                  style={{ margin: "0px 0px", flex: 1 }}
                  type="number"
                  value={type === "FREE" ? 0 : cost}
                  onChange={(e) => {
                    if (type === "FREE") {
                      setCost(0);
                    } else {
                      const newCost = parseFloat(e.target.value);
                      setCost(isNaN(newCost) ? 1 : newCost);
                    }
                  }}
                  disabled={type === "FREE"}
                />
                <TextField
                  label="Giá bán"
                  variant="outlined"
                  style={{ margin: "0px 0px", flex: 1 }}
                  type="number"
                  value={price}
                  disabled
                />
                <TextField
                  label="Thời lượng"
                  margin="normal"
                  variant="outlined"
                  style={{ flex: 1, marginTop: "8px" }}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
                <FormControl
                  variant="outlined"
                  margin="normal"
                  style={{ flex: 1, marginTop: "8px" }}
                >
                  <InputLabel id="language-label">Ngôn ngữ</InputLabel>
                  <Select
                    labelId="language-label"
                    label="Language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as string)}
                  >
                    <MenuItem value="Vietnamese">Tiếng Việt</MenuItem>
                    <MenuItem value="English">English</MenuItem>
                  </Select>
                </FormControl>
              </div>
            </div>
            <div className="col-md-5">
              <h3 style={{ marginTop: "10px" }}>Ảnh khóa học</h3>
              <Box marginY={2} className={styles["text-field"]}>
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt="Course"
                    style={{ maxWidth: "100%", height: "100%" }}
                  />
                )}
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="upload-image"
                  type="file"
                  onChange={handleImageChange}
                />
                <label htmlFor="upload-image" style={{ float: "right" }}>
                  <Button variant="contained" color="primary" component="span" style={{ marginTop: "10px" }}>
                    Tải ảnh lên
                  </Button>
                </label>
              </Box>
            </div>
          </div>
          <h3 style={{ marginTop: "10px" }}>Mô tả khóa học</h3>
          <Box
            style={{
              border: "1px solid black",
              borderRadius: "4px",
              padding: "16px",
              marginBottom: "24px",
              width: "100%",
              height: "420px",
              overflow: "auto",
            }}
          >

            <CKEditor
              editor={ClassicEditor}
              data={description}
              onChange={(event: any, editor: any) => {
                const data = editor.getData();
                setDescription(data);
              }}
            />
          </Box>

          <h3 style={{ marginTop: "10px" }}>Đầu ra khóa học</h3>
          <Box
            style={{
              border: "1px solid black",
              borderRadius: "4px",
              padding: "16px",
              marginBottom: "24px",
              width: "100%",
              height: "420px",
              overflow: "auto",
            }}
          >

            <CKEditor
              editor={ClassicEditor}
              data={courseOutput}
              onChange={(event: any, editor: any) => {
                const data = editor.getData();
                setCourseOutput(data);
              }}
            />
          </Box>


        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleUpdateCourse}
            className="btn btn-primary white-btn"
          >
            Lưu
          </Button>
          <Button
            onClick={handleDialogClose}
            className="btn btn-primary white-btn"
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>


      <Dialog
        open={isEditDialogOpen}
        onClose={handleCloseDialog}
        style={{ width: "600px !important" }}
      >
        <DialogTitle style={{ textAlign: "center" }}>
          Cập nhật tiêu đề chương
        </DialogTitle>
        <DialogContent>
          <TextField
            value={newChapterTitle}
            onChange={(e) => setNewChapterTitle(e.target.value)}
            fullWidth
            variant="outlined"
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Đóng
          </Button>
          <Button
            onClick={handleSaveChapter}
            color="primary"
            disabled={!newChapterTitle.trim()}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDialog} onClose={handleClose} maxWidth="md">

        <DialogTitle>Video Miễn Phí</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Đây là nơi bạn có thể xem video miễn phí về khóa học.
          </Typography>

          <TableContainer component={Paper} style={{ marginTop: 16 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>STT</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Tiêu Đề</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Thời Lượng</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Link</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Trạng thái</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Hành động</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {videos.map((video, index) => (
                  <TableRow key={video.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{video.videoTitle}</TableCell>
                    <TableCell align="center">{video.duration}</TableCell>
                    <TableCell align="center">
                      <a
                        href={video.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Xem Video
                      </a>
                    </TableCell>
                    <TableCell align="center">
                      {video.viewTest ? "Đã cho phép" : "Không cho phép"}
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        onClick={() =>
                          handleUpdateStatus(video.id, video.viewTest)
                        }
                        color={video.viewTest ? "secondary" : "primary"}
                      >
                        {video.viewTest ? "Không cho phép" : "Cho phép"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog để thêm tệp */}

      <AddLessonFileDialog
        sectionId={selectedSectionId!}
        open={openAddLessonFileDialog}
        onClose={handleCloseAddLessonFileDialog}
        onFileUpload={handleAddLessonFileFileUpload}
      />

      <Dialog open={openAccountStudentDialog} onClose={handleAccountStudentDialogClose} fullWidth maxWidth="md">
        {/* <DialogTitle>Danh sách học viên</DialogTitle> */}
        <DialogContent>
          <ManageStudentListDialog courseId={courseId} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAccountStudentDialogClose} color="secondary">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      <ChapterLessonsDialog
        open={openChapterLessonsDialog}
        onClose={() => setOpenChapterLessonsDialog(false)}
        chapterId={editingChapterId!}
        chapterTitle={newChapterTitle}
        courseId={id}
      />


      <Dialog
        open={openEditLessonDialog}
        onClose={() => setOpenEditLessonDialog(false)}
        fullWidth
        maxWidth="lg" // Điều chỉnh kích thước của popup
      >
        <DialogTitle>Chỉnh sửa bài học</DialogTitle>
        <DialogContent>
          {selectedSectionId && <EditLesson lessonId={selectedSectionId} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditLessonDialog(false)} color="secondary">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>


      <ConfirmModal
        isOpen={isConfirmOpen}
        title={actionType === "lock" ? "Khóa bài học" : "Mở khóa bài học"}
        message={`Bạn có chắc chắn muốn ${actionType === "lock" ? "khóa" : "mở khóa"} bài học này không?`}
        onConfirm={handleConfirmAction}
        onCancel={handleCloseModal}
      />
      <ConfirmModal
        isOpen={isConfirmOpenChapter}
        title={actionTypeChapter === "lockChapter" ? "Khóa chương" : "Mở khóa chương"}
        message={`Bạn có chắc chắn muốn ${actionTypeChapter === "lockChapter" ? "khóa" : "mở khóa"} chương này không?`}
        onConfirm={handleConfirmActionChapter}
        onCancel={handleCloseModalChapter}
      />

      <ConfirmModal
        isOpen={isConfirmOpenDelete}
        title={"Xóa bài học"}
        message={`Bạn có chắc chắn muốn xóa bài học này không?`}
        onConfirm={handleConfirmActionDeleteLesson}
        onCancel={handleCloseModalDeleteLesson}
      />

      <ToastContainer />
    </Box>
  );
};
export const RequestAdminURL = RequireAdmin(EditCourse);
export default EditCourse;
