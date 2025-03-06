import React, { useState, useEffect } from "react";
import mammoth from "mammoth";
import "react-toastify/dist/ReactToastify.css";
import {
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  Radio,
  RadioGroup,
  FormControlLabel,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import {
  ADMIN_GET_CB_COURSE1,
  ADMIN_GET_CHAPTERS,
  ADMIN_GET_LESSONS,
  ADMIN_ADD_TEST_TO_LESSON,
  ADMIN_UPLOAD_VIDEO,
  ADMIN_GET_TEST,
  ADMIN_GET_LESSONS_ADMIN,
  ADMIN_POST_LESSONS_UPDATE_VIDEO_ADD,
  ADMIN_POST_LESSONS_UPDATE_VIDEO_UPDATE,
  ADMIN_GET_TEST_JPA,
  ADMIN_GET_CHAPTERS_LIST,
} from "../../../../api/api"; // Đảm bảo đường dẫn API chính xác
import RequireAdmin from "../../../DOM/RequireAdmin";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import "./EditLesson.scss";
import { toast, ToastContainer } from "react-toastify";
import useRefreshToken from "../../../util/fucntion/useRefreshToken";
import { isTokenExpired } from "../../../util/fucntion/auth";
interface Chapter {
  id: number;
  title: string;
  course_id: number;
}

interface Course {
  id: number;
  courseTitle: string;
}

interface Test {
  id: number;
  title: string;
}

export interface TestCombo {
  id: number;
  lesson: Lesson; // Nếu bài kiểm tra không có bài học thì sẽ là null
  title: string;
  description: string;
  totalQuestion: number;
  createdAt: string;  // Thời gian tạo (ISO string)
  updatedAt: string | null;  // Thời gian cập nhật (ISO string hoặc null nếu chưa cập nhật)
  deletedDate: string | null;  // Thời gian xóa (ISO string hoặc null nếu không bị xóa)
  deleted: boolean;  // Trạng thái xóa bài kiểm tra
  summary: boolean;  // Bài kiểm tra có phải là bài kiểm tra tóm tắt không?
}

export interface Lesson {
  id: number;
  title: string;
  // Các thông tin khác của bài học
}

const EditLesson: React.FC<{ lessonId: number; }> = ({ lessonId }) => {
  // const { id } = useParams<{ id: string }>();
  const [lessonTitle, setLessonTitle] = useState<string>("");
  const [lessonDuration, setLessonDuration] = useState<number | null>(null);
  // const [lessonChapter, setLessonChapter] = useState<number | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [selectedTest, setSelectedTest] = useState<number | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [videoId, setVideoId] = useState<number | null>(null);
  const [videoTitle, setVideoTitle] = useState<string>("");

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [tests, setTests] = useState<TestCombo[]>([]); // Danh sách bài kiểm tra
  const [filltest, setFilltest] = useState<TestCombo[]>([]);
  const [currentTest, setCurrentTest] = useState<Test | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [option, setOption] = useState<string>("video");

  const [documentShort, setDocumentShort] = useState<string>("");
  const [documentUrl, setDocumentUrl] = useState<string>("");
  const [documentUrlFile, setDocumentUrlFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const refresh = useRefreshToken();
  const [filteredChapters, setFilteredChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    fetchChapters();
    fetchCourses();
    fetchLessonDetails();
    // fetchTests();
  }, []);


  useEffect(() => {
    if (selectedCourse && selectedChapter) {
      fetchTests();
    }
  }, [selectedCourse, selectedChapter]);

  // }, [selectedCourse, selectedChapter]);

  useEffect(() => {
    if (selectedCourse) {
      const filtered = chapters.filter(
        (chapter) => chapter.course_id === selectedCourse
      );
      setFilteredChapters(filtered);
    } else {
      setFilteredChapters(chapters); // Nếu chưa chọn khóa học, hiển thị toàn bộ chương
    }
  }, [selectedCourse, chapters]);
  const fetchTests = async () => {

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
        `${process.env.REACT_APP_SERVER_HOST}/api/tests/course/${selectedCourse}/chapter/${selectedChapter}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch tests");
      }

      const data = await response.json();
      const filteredTests = data.filter(
        (test: TestCombo) =>
          test.lesson === null || test.lesson?.id === lessonId // Lọc theo điều kiện
      );

      // Cập nhật lại filltest với các bài kiểm tra đã được lọc
      setFilltest(filteredTests);
    } catch (error) {
      console.error("Failed to fetch tests:", error);
    }
  }
  const fetchChapters = async () => {
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
      const response = await fetch(ADMIN_GET_CHAPTERS_LIST, {
        method: "GET", // Phương thức yêu cầu
        headers: {
          Authorization: `Bearer ${token}`, // Đảm bảo bạn gửi token trong headers
          "Content-Type": "application/json", // Đảm bảo đúng định dạng dữ liệu JSON
        },
      });

      // Kiểm tra xem phản hồi có thành công hay không
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json(); // Chuyển đổi dữ liệu JSON từ phản hồi
      setChapters(data); // Cập nhật dữ liệu vào state
      // setChapters(data._embedded.chapters);
    } catch (error) {
      console.error("Failed to fetch chapters:", error);
    }
  };
  const fetchCourses = async () => {
    let token = localStorage.getItem("authToken");

    // Kiểm tra xem token có hết hạn không
    if (isTokenExpired(token)) {
      token = await refresh();
      if (!token) {
        navigate("/dang-nhap");
        return;
      }
      localStorage.setItem("authToken", token);
    }

    // Lấy accountId từ authData (giả sử authData lưu trong localStorage hoặc sessionStorage)
    const authData = JSON.parse(localStorage.getItem("authData") || "{}");

    const accountId = authData ? authData.id : null;

    if (!accountId) {
      console.error("Account ID không hợp lệ!");
      navigate("/dang-nhap");
      return;
    }

    try {
      // Gọi API để lấy dữ liệu khóa học mà không phân trang
      const response = await fetch(`${ADMIN_GET_CB_COURSE1}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch courses: " + response.statusText);
      }

      const data = await response.json();
      // Cập nhật danh sách khóa học
      setCourses(data);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    }
  };

  const fetchLessonDetails = async () => {
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
      const response = await fetch(`${ADMIN_GET_LESSONS_ADMIN}/${lessonId}`, {
        headers: {
          method: "GET",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.length > 0) {
        const lessonData = data[0]; // Truy cập phần tử đầu tiên của mảng
        setLessonTitle(lessonData.title);
        setLessonDuration(lessonData.duration);
        setSelectedChapter(lessonData.chapter_id);
        setSelectedCourse(lessonData.course_id);
        setVideoUrl(lessonData.video_url);
        setVideoTitle(lessonData.video_title);
        setDocumentShort(lessonData.document_short);
        setDocumentUrl(lessonData.document_url);
        setVideoId(lessonData.video_id);
        setSelectedTest(lessonData.test_id);
        // if (lessonData.id && lessonData.title) {
        //   setCurrentTest({
        //     id: lessonData.test_id,
        //     title: lessonData.test_title,
        //   });
        //   setSelectedTest(lessonData.id);
        // }
      }
    } catch (error) {
      console.error("Failed to fetch lesson details:", error);
    }
  };

  const validateForm = () => {
    if (option === "video") {
      if (!lessonTitle) {
        toast.error("Tên bài học không được để trống.");
        return false;
      }
      if (!lessonDuration) {
        toast.error("Thời lượng không được để trống.");
        return false;
      }
      if (!selectedChapter) {
        toast.error("Chương không được để trống.");
        return false;
      }
      if (!selectedCourse) {
        toast.error("Khóa học không được để trống.");
        return false;
      }

      if (!videoUrl && !videoFile) {
        toast.error("Phải tải lên video hoặc cung cấp URL của video.");
        return false;
      }

      if (!videoTitle) {
        toast.error("Bạn phải đặt tên video !");
        return false;
      }

      if (!documentUrl && !documentUrlFile) {
        toast.error("Phải tải lên tài liệu hoặc cung cấp URL của tài liệu.");
        return false;
      }
      // if (documentUrl && videoUrl) {
      //   if (!videoFile || !documentUrlFile) {
      //     toast.error("Phải tải lên tài liệu hoặc cung cấp URL của tài liệu.");
      //     return false;
      //   }
      // }
      if (!documentShort) {
        toast.error("Mô tả tài liệu không được để trống.");
        return false;
      }
    } else {
      // if (!currentTest) {
      //   toast.error("Bài test đã có trong bài học!");
      //   return false;
      // }
    }

    return true;
  };

  const handleUpdateLesson = async () => {
    if (!validateForm()) return;

    const confirmUpdate = window.confirm(
      "Bạn có chắc chắn muốn cập nhật bài học này?"
    );
    if (!confirmUpdate) return;
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("id", lessonId?.toString() || "");
      formData.append("title", lessonTitle);
      formData.append("duration", lessonDuration?.toString() || "");
      formData.append("chapterId", selectedChapter?.toString() || "");
      formData.append("courseId", selectedCourse?.toString() || "");

      let token = localStorage.getItem("authToken");

      if (isTokenExpired(token)) {
        token = await refresh();
        if (!token) {
          navigate("/dang-nhap");
          return;
        }
        localStorage.setItem("authToken", token);
      }

      if (option === "video" && videoFile && documentUrlFile && documentShort) {
        //Thêm
        formData.append("videoTitle", videoTitle?.toString() || "");
        formData.append("videoFile", videoFile);
        formData.append("documentShort", documentShort?.toString() || "");
        formData.append("documentUrlFile", documentUrlFile);
        try {
          const response = await fetch(`${ADMIN_POST_LESSONS_UPDATE_VIDEO_ADD}`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          });

          if (response.ok) {
            window.location.href = `/admin/edit-bai-hoc/${lessonId}`;
          } else {
            console.error("Failed to update lesson:", await response.text());
          }
        } catch (error) {
          console.error("Failed to update lesson:", error);
        }
      } else if (option === "video" && videoUrl && documentUrl) {

        formData.append("videoId", videoId?.toString() || "");
        formData.append("videoTitle", videoTitle?.toString() || "");
        formData.append("documentShort", documentShort?.toString() || "");
        if (videoFile) {
          formData.append("videoFile", videoFile);
        } else formData.append("videoFile", "");
        if (documentUrlFile) {
          formData.append("documentUrlFile", documentUrlFile);
        } else formData.append("documentUrlFile", "");

        try {
          const response = await fetch(
            `${ADMIN_POST_LESSONS_UPDATE_VIDEO_UPDATE}`,
            {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: formData,
            }
          );

          if (response.ok) {
            window.location.href = `/admin/edit-bai-hoc/${lessonId}`;
          } else {
            console.error("Failed to update lesson:", await response.text());
          }
        } catch (error) {
          console.error("Failed to update lesson:", error);
        }
      } else if (option === "test") {
        handleAddTestToLesson();
      }
    } catch (error) {
      console.error("Failed to update lesson:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTestToLesson = async () => {
    if (!selectedTest) {
      alert("Vui lòng chọn một bài kiểm tra để thêm vào bài học.");
      return;
    }

    // Tạo đối tượng dữ liệu JSON để gửi
    const requestData = {
      lessonId: lessonId ?? "", // Gửi `lessonId` lấy từ URL hoặc giá trị mặc định ''
    };

    let token = localStorage.getItem("authToken");

    // Kiểm tra xem token có hết hạn không
    if (isTokenExpired(token)) {
      token = await refresh();
      if (!token) {
        navigate("/dang-nhap");
        return;
      }
      localStorage.setItem("authToken", token);
    }

    try {
      // Gửi yêu cầu PUT tới endpoint với selectedTest trong URL và dữ liệu JSON trong body
      const response = await fetch(
        `${ADMIN_ADD_TEST_TO_LESSON}/${selectedTest}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json", // Đảm bảo Content-Type là application/json
          },
          body: JSON.stringify(requestData), // Chuyển đối tượng JSON thành chuỗi
        }
      );

      // Kiểm tra kết quả trả về từ server
      if (response.ok) {
        toast.success("Đã thêm bài kiểm tra vào bài học thành công");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        console.error("Failed to add test to lesson:", await response.text());
      }
    } catch (error) {
      console.error("Failed to add test to lesson:", error);
    }
  };

  const handleUploadVideo = async () => {
    if (!videoFile) {
      setErrors({ videoFile: "Video không được để trống." });
      return;
    }

    const formData = new FormData();
    formData.append("video", videoFile);

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
      const response = await fetch(ADMIN_UPLOAD_VIDEO, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        alert("Video đã được tải lên thành công.");
      } else {
        console.error("Failed to upload video:", await response.text());
      }
    } catch (error) {
      console.error("Failed to upload video:", error);
    }
  };

  const handleDocumentShortChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setDocumentShort(e.target.value);
  };

  return (
    <Box className="container" p={3}>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Chỉnh Sửa Bài Học
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Tên Bài Học"
                value={lessonTitle}
                variant="outlined"
                onChange={(e) => setLessonTitle(e.target.value)}
                fullWidth
                margin="dense"
                required
                error={!!errors.lessonTitle}
                helperText={errors.lessonTitle}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Thời lượng (phút)"
                type="number"
                variant="outlined"
                value={lessonDuration ?? ""}
                onChange={(e) => setLessonDuration(Number(e.target.value))}
                fullWidth
                margin="dense"
                required
                error={!!errors.lessonDuration}
                helperText={errors.lessonDuration}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl
                fullWidth
                variant="outlined"
                error={!!errors.selectedCourse}
              >
                <InputLabel id="course-label">Khóa Học</InputLabel>
                <Select
                  labelId="course-label"
                  id="course-select"
                  name="selectedCourse"
                  value={selectedCourse ?? ""}
                  onChange={(e) => setSelectedCourse(Number(e.target.value))}
                  label="Khóa Học"
                  required
                  disabled
                >
                  {courses.map((course) => (
                    <MenuItem key={course.id} value={course.id}>
                      {course.courseTitle}
                    </MenuItem>
                  ))}
                </Select>
                {errors.selectedCourse && (
                  <Typography color="error">{errors.selectedCourse}</Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined" required>
                <InputLabel id="chapter-label">Chương</InputLabel>
                <Select
                  labelId="chapter-label"
                  id="chapter-select"
                  name="selectedChapter"
                  value={selectedChapter ?? ""}
                  onChange={(e) => setSelectedChapter(Number(e.target.value))}
                  label="Chương"
                  disabled
                >
                  {filteredChapters.map((chapter) => (
                    <MenuItem key={chapter.id} value={chapter.id}>
                      {chapter.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Tùy chọn Thêm Video hoặc Bài Kiểm Tra */}
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <RadioGroup
                  row
                  value={option}
                  onChange={(e) => setOption(e.target.value)}
                >
                  <FormControlLabel
                    value="video"
                    control={<Radio />}
                    label="Thêm Video"
                  />
                  <FormControlLabel
                    value="test"
                    control={<Radio />}
                    label="Thêm Bài Kiểm Tra"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>

            {/* Form Thêm Video */}
            {option === "video" && (
              <>
                <Grid item xs={12}>
                  <TextField
                    label="Tiêu đề Video"
                    type="text"
                    value={videoTitle ?? ""}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    fullWidth
                    margin="dense"
                    required
                    error={!!errors.lessonDuration}
                    helperText={errors.lessonDuration}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Thời lượng Video (phút)"
                    type="number"
                    value={lessonDuration ?? ""}
                    onChange={(e) => setLessonDuration(Number(e.target.value))}
                    fullWidth
                    margin="dense"
                    required
                    error={!!errors.lessonDuration}
                    helperText={errors.lessonDuration}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6">Video</Typography>
                  <div style={{ display: "block", textAlign: "center" }}>
                    {videoUrl ? (
                      <video
                        src={videoUrl}
                        controls
                        style={{ width: "80%", margin: "auto" }}
                      />
                    ) : (
                      <Typography color="textSecondary">
                        No video available
                      </Typography>
                    )}
                  </div>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6">Tài liệu mô tả video</Typography>

                  <CKEditor
                    editor={ClassicEditor}
                    data={documentShort || ""}
                    onChange={(event: any, editor: any) => {
                      const data = editor.getData();
                      setDocumentShort(data);
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6">Tài liệu video tải xuống</Typography>
                  <label htmlFor="document_url">
                    {documentUrl
                      ? documentUrl.length > 100
                        ? `${documentUrl.substring(0, 80)}...`
                        : documentUrl
                      : "No document download available"}
                  </label>

                  {documentUrl ? (
                    <a
                      href={documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="download-url"
                      download
                    >
                      <button
                        style={{ float: "right" }}
                        className="btn btn-secondary"
                      >
                        Download
                      </button>
                    </a>
                  ) : (
                    <button
                      style={{ float: "right" }}
                      className="btn btn-secondary"
                      disabled
                    >
                      Download
                    </button>
                  )}
                  <div>
                    <input
                      type="file"
                      accept=".docx"
                      name="document_url_file"
                      id="document_url_file"
                      onChange={(e) =>
                        setDocumentUrlFile(
                          e.target.files ? e.target.files[0] : null
                        )
                      }
                    />
                  </div>
                </Grid>

                <Grid item xs={12}>
                  <label
                    htmlFor="vide-lesson"
                    style={{
                      display: "block",
                      fontSize: "20px",
                      fontWeight: "500",
                    }}
                  >
                    Upload Video
                  </label>
                  <input
                    type="file"
                    name="vide-lesson"
                    accept="video/*"
                    onChange={(e) =>
                      setVideoFile(e.target.files ? e.target.files[0] : null)
                    }
                    style={{ marginTop: "16px" }}
                  />
                  {errors.videoFile && (
                    <Typography color="error">{errors.videoFile}</Typography>
                  )}
                </Grid>
              </>
            )}

            {/* Form Thêm Bài Kiểm Tra */}
            {option === "test" && (
              <>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined" required>
                    <InputLabel>Bài Kiểm Tra</InputLabel>
                    <Select
                      label="Bài kiểm tra"
                      value={selectedTest}  // Đặt giá trị mặc định là id của bài kiểm tra đầu tiên
                      onChange={(e) => setSelectedTest(Number(e.target.value))}
                      required
                    >
                      {filltest.map((test) => (
                        <MenuItem key={test.id} value={test.id}>
                          {test.title}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

              </>
            )}

            {/* Nút Cập Nhật Bài Học */}
            <Grid item xs={12} container justifyContent="flex-end">
              <Button
                onClick={handleUpdateLesson}
                disabled={isLoading} // Vô hiệu hóa khi đang tải
                className="btn btn-primary white-btn"
                style={{ marginTop: "16px", color: "white !important" }}
              >
                {isLoading ? "Đang tải..." : "Cập nhật Bài Học"}
              </Button>

              <Button
                onClick={() => {
                  const courseId = localStorage.getItem("courseId");
                  navigate(`/admin/chi-tiet-khoa-hoc/${courseId}`);
                }}
                color="secondary"
                variant="outlined"
                style={{ marginTop: "16px", marginLeft: "8px" }}
              >
                Quay lại
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <ToastContainer />
    </Box>
  );
};
export const RequestAdminURL = RequireAdmin(EditLesson);
export default EditLesson;
