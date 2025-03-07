import React, { useEffect, useRef, useState } from "react";
import "./CoursePageConvert.css";
import { isTokenExpired } from "../util/fucntion/auth";
import { useNavigate } from "react-router-dom";
import useRefreshToken from "../util/fucntion/useRefreshToken";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { decryptData, encryptData } from "../util/encryption";
interface LessonRightSidebarProps {
  isSidebarOpen: boolean;
  handleToggleSidebar: () => void;
  content: {
    video_id: number;
    type: "video";
    title: string;
    url: string;
    documentUrl?: string;
    documentShort?: string;
  };
  progressData: any;
  coursesData: any;
}
interface Comment {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  account: {
    id: number;
    fullname: string;
  };
  children?: Comment[];
}

interface videoFace {
  id: number;
  title: string;
  url: string;
  documentShort: string;
  documentUrl: string;
}
export const LessonRightSidebar: React.FC<LessonRightSidebarProps> = ({
  isSidebarOpen,
  handleToggleSidebar,
  content,
  progressData,
  coursesData,
}) => {
  const [rootComments, setRootComments] = useState<Comment[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [childrenComments, setChildrenComments] = useState<{
    [key: number]: Comment[];
  }>({});
  const [expandedComments, setExpandedComments] = useState<{
    [key: number]: boolean;
  }>({});
  const [lessonId, setLessonId] = useState<number | null>(null);
  const [rootCommentContent, setRootCommentContent] = useState("");

  const [childCommentContent, setChildCommentContent] = useState("");
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  const refresh = useRefreshToken();
  const [video, setVideo] = useState<videoFace | null>(null);

  const fetchVideoData = async (videoId: string) => {
    let token = localStorage.getItem("authToken");

    if (isTokenExpired(token)) {
      token = await refresh();
      if (!token) {
        window.location.href = "/login";
        return;
      }
      localStorage.setItem("authToken", token);
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/videos/${videoId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch video data. Status: ${response.status}`
        );
      }

      const videoData = await response.json();
      setVideo(videoData);
    } catch (error) {
      console.error("Error fetching video data:", error);
    }
  };
  const handleGoBack = () => {
    localStorage.removeItem("encryptedVideoId");
    localStorage.removeItem("encryptedTestId");
    localStorage.removeItem("encryptedCourseId");
    localStorage.removeItem("encryptedLessonId");
    localStorage.removeItem("encryptedTestChapterId");
    localStorage.removeItem("encryptedChapterId");
    window.location.href = "/";
  };
  const handleLoadedData = () => {
    if (videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.error("Video playback failed:", err);
      });
    }
  };
  const findLessonIndex = (
    chapterId: number,
    lessonId: number,
    courseData: any
  ) => {
    for (let i = 0; i < courseData.chapters.length; i++) {
      const chapter = courseData.chapters[i];
      if (chapter.chapter_id === chapterId) {
        const lessonIndex = chapter.lessons.findIndex(
          (lesson: any) => lesson.lesson_id === lessonId
        );
        return { chapterIndex: i, lessonIndex };
      }
    }
    return null; // Không tìm thấy
  };
  const getNextLesson = (
    chapterId: number,
    lessonId: number,
    courseData: any
  ) => {
    const indices = findLessonIndex(chapterId, lessonId, courseData);
    if (!indices) return null;

    const { chapterIndex, lessonIndex } = indices;
    const currentChapter = courseData.chapters[chapterIndex];

    // Bài học tiếp theo trong cùng một chương
    if (lessonIndex < currentChapter.lessons.length - 1) {
      return currentChapter.lessons[lessonIndex + 1];
    }

    // Chuyển sang bài học đầu tiên của chương kế tiếp
    if (chapterIndex < courseData.chapters.length - 1) {
      const nextChapter = courseData.chapters[chapterIndex + 1];
      return nextChapter.lessons[0];
    }

    return null; // Không có bài học tiếp theo
  };
  const getPreviousLesson = (
    chapterId: number,
    lessonId: number,
    courseData: any
  ) => {
    const indices = findLessonIndex(chapterId, lessonId, courseData);
    if (!indices) return null;

    const { chapterIndex, lessonIndex } = indices;
    const currentChapter = courseData.chapters[chapterIndex];

    // Bài học trước trong cùng một chương
    if (lessonIndex > 0) {
      return currentChapter.lessons[lessonIndex - 1];
    }

    // Chuyển sang bài học cuối cùng của chương trước đó
    if (chapterIndex > 0) {
      const prevChapter = courseData.chapters[chapterIndex - 1];
      return prevChapter.lessons[prevChapter.lessons.length - 1];
    }

    return null; // Không có bài học trước
  };
  const showToast = (message: string) => {
    toast.warning(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
  };
  const isLessonUnlocked = (
    chapterId: number,
    lessonId: number,
    courseData: any
  ) => {
    const progress = progressData.find(
      (p: any) => p.chapterId === chapterId && p.lessonId === lessonId
    );
    return progress?.videoStatus === true || progress?.testStatus === true;
  };
  const handleVideoClick = (
    videoId: string,
    lessonId: string,
    chapterId: string
  ) => {
    const encryptedVideoId = encryptData(videoId);
    localStorage.setItem("encryptedVideoId", encryptedVideoId);
    localStorage.removeItem("encryptedTestId");
    localStorage.removeItem("encryptedTestChapterId");

    const encryptedChapterId = encryptData(chapterId);
    const encryptedLessonId = encryptData(lessonId);
    localStorage.setItem("encryptedChapterId", encryptedChapterId);
    localStorage.setItem("encryptedLessonId", encryptedLessonId);

    window.location.reload();
  };
  const navigateToLesson = (
    direction: string,
    chapterId: number,
    lessonId: number,
    courseData: any,
    progressData: any
  ) => {
    let targetLesson;
    console.log("Hi");
    if (direction === "next") {
      targetLesson = getNextLesson(chapterId, lessonId, courseData);
    } else if (direction === "previous") {
      targetLesson = getPreviousLesson(chapterId, lessonId, courseData);
    }

    if (!targetLesson) {
      showToast("Không có bài học để chuyển.");
      return;
    }
    let isUnlocked;
    if (direction === "next") {
      isUnlocked = isLessonUnlocked(
        chapterId,
        targetLesson.lesson_id,
        progressData
      );
      if (!isUnlocked) {
        showToast("Bài học này chưa được mở khóa!");
        return;
      }
    }

    handleVideoClick(
      targetLesson.video?.video_id.toString(),
      targetLesson.lesson_id.toString(),
      chapterId.toString()
    );
    // console.log("Đã video", targetLesson.video?.video_id.toString());
    // console.log("Đã lesson", targetLesson.lesson_id.toString());
    // console.log("Đã chapter", chapterId.toString());
  };
  const fetchRootComments = async (page: number) => {
    // setLoading(true);
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
        `${process.env.REACT_APP_SERVER_HOST}/api/comments/video/${content.video_id}/lesson/${lessonId}?page=${page}&size=5`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      setRootComments(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching root comments:", error);
    }
  };

  const fetchChildrenComments = async (parentId: number) => {
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
        `${process.env.REACT_APP_SERVER_HOST}/api/comments/${parentId}/children/video/${content.video_id}/lesson/${lessonId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      setChildrenComments((prev) => ({ ...prev, [parentId]: data }));
    } catch (error) {
      console.error("Error fetching children comments:", error);
    }
  };
  const postComment = async (
    content: string,
    accId: number,
    lessonId: number,
    videoId: number,
    contentId: number | null = null
  ) => {
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
        "${process.env.REACT_APP_SERVER_HOST}/api/comments/submit",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content,
            accId,
            lessonId,
            videoId,
            contentId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Không thể thêm bình luận. Vui lòng thử lại.");
      }
      const data = await response.json();
      return data; // Trả về bình luận đã được thêm
    } catch (error) {
      console.error("Error posting comment:", error);
      throw error; // Để xử lý thêm nếu cần
    }
  };

  const getUserData = () => {
    const authData = localStorage.getItem("authData");
    if (authData) {
      return JSON.parse(authData); // Parse JSON từ localStorage
    }
    return null; // Trả về null nếu không tìm thấy
  };

  const handleAddRootComment = async (content1: string) => {
    if (!lessonId || !content.video_id) {
      console.error("LessonId hoặc VideoId không hợp lệ.");
      return;
    }
    const user = getUserData();

    try {
      const newComment = await postComment(
        content1,
        user.id,
        lessonId,
        content.video_id,
        null
      );
      setRootComments((prev) => [newComment, ...prev]);
      toast.success(`Comment sẽ được Quản trị viên duyệt !`);
      setTimeout(() => {
        window.location.reload();
      }, 2500);
    } catch (error) {
      toast.success(`Không thể thêm bình luận. Vui lòng thử lại.`);
      setTimeout(() => {
        window.location.reload();
      }, 2500);
    }
  };

  const handleAddChildComment = async (content1: string, parentId: number) => {
    if (!lessonId || !content.video_id) {
      console.error("LessonId hoặc VideoId không hợp lệ.");
      return;
    }
    const user = getUserData();
    try {
      const newChildComment = await postComment(
        content1,
        user.id,
        lessonId,
        content.video_id,
        parentId
      );
      // console.log(newChildComment);
      setChildrenComments((prev) => ({
        ...prev,
        [parentId]: [...(prev[parentId] || []), newChildComment], // Thêm bình luận con vào danh sách
      }));

      toast.success(`Comment sẽ được Quản trị viên duyệt !`);
      setTimeout(() => {
        window.location.reload();
      }, 2500);
    } catch (error) {
      toast.success(`Không thể thêm bình luận con. Vui lòng thử lại.`);
      setTimeout(() => {
        window.location.reload();
      }, 2500);
    }
  };

  const handleReplyToggle = (parentId: number) => {
    setExpandedComments((prev) => ({
      ...prev,
      [parentId]: !prev[parentId],
    }));

    // Fetch children comments only if they haven't been fetched before
    if (!childrenComments[parentId]) {
      fetchChildrenComments(parentId);
    }
  };

  const handleReplyClick = (commentId: number) => {
    setActiveReplyId((prev) => (prev === commentId ? null : commentId));
  };

  const btnDelete = async (commentId: number) => {
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
        `${process.env.REACT_APP_SERVER_HOST}/api/comments/delete/${commentId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast.success(`Comment đã được xóa thành công!`);
        window.location.reload();
      } else {
        const errorData = await response.json();
        toast.error(
          `Không thể xóa comment : ${errorData.message || response.statusText}`
        );
        // window.location.reload();
      }
    } catch (error) {
      console.error("Error fetching children comments:", error);
    }

    // console.log(commentId);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };
  useEffect(() => {
    const storedEncryptedLessonId = localStorage.getItem("encryptedLessonId");
    if (storedEncryptedLessonId) {
      const decryptedLessonId = decryptData(storedEncryptedLessonId);
      setLessonId(decryptedLessonId);
    }
  }, []);
  useEffect(() => {
    if (content.video_id) {
      fetchVideoData(String(content.video_id));
    }
  }, [content.video_id]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load(); // Tải lại video khi URL thay đổi
      // videoRef.current.play();
    }
  }, [video?.url]);
  useEffect(() => {
    if (lessonId) {
      fetchRootComments(currentPage);
    }
  }, [lessonId, currentPage]);
  return (
    <div
      className="rbt-lesson-rightsidebar overflow-hidden lesson-video vaohoc"
      style={{ width: isSidebarOpen ? "75%" : "100%", flex: "1" }}
    >
      <div className="lesson-top-bar vaohoc">
        <div className="lesson-top-left vaohoc">
          <div className="rbt-lesson-toggle vaohoc">
            <button
              style={{ color: "white" }}
              title="Toggle Sidebar"
              onClick={handleToggleSidebar}
            >
              {isSidebarOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-arrow-bar-left"
                  viewBox="0 0 16 16"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.5 15a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 1 0v13a.5.5 0 0 1-.5.5M10 8a.5.5 0 0 1-.5.5H3.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L3.707 7.5H9.5a.5.5 0 0 1 .5.5"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-arrow-bar-right"
                  viewBox="0 0 16 16"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 8a.5.5 0 0 0 .5.5h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L12.293 7.5H6.5A.5.5 0 0 0 6 8m-2.5 7a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 1 0v13a.5.5 0 0 1-.5.5"
                  />
                </svg>
              )}
            </button>
          </div>
          <h5 style={{ color: "white" }}>{video?.title}</h5>
        </div>
        <div className="lesson-top-right vaohoc">
          <div className="rbt-btn-close vaohoc">
            <a
              href="/"
              style={{
                color: "white",
                width: "30px",
                height: "30px",
                textAlign: "center",
              }}
              title="Go Back to Course"
              className="rbt-round-btn vaohoc"
              onClick={(e) => {
                e.preventDefault(); // Ngừng hành động mặc định của thẻ <a>
                handleGoBack(); // Gọi hàm xử lý sự kiện click
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-x-lg"
                viewBox="0 0 16 16"
              >
                <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
      <div className="inner vaohoc">
        <div
          className="plyr__video-embed rbtplayer vaohoc"
          style={{ height: "80%" }}
        >
          <video
            ref={videoRef}
            controls
            autoPlay
            muted
            style={{ height: "100%" }}
            className="main-video"
            poster={"/default-thumbnail.jpg"}
            onLoadedData={handleLoadedData}
          >
            {video?.url ? (
              <source src={video.url} type="video/mp4" />
            ) : (
              <p>Video không khả dụng.</p>
            )}
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="content vaohoc" style={{ height: "20%" }}>
          <div className="section-title vaohoc">
            {/* <h4 ></h4> */}

            <p
              dangerouslySetInnerHTML={{ __html: video?.documentShort || "" }}
            ></p>
          </div>
        </div>
      </div>
      <a
        href={video?.documentUrl}
        className="btn btn-primary"
        style={{ float: "right" }}
        target="_blank"
        rel="noopener noreferrer"
      >
        Tải xuống
      </a>
      <div
        className="bg-color-extra2 ptb--15 overflow-hidden vaohoc"
        style={{ marginBottom: "20px" }}
      >
        <div className="rbt-button-group vaohoc">
          <a
            className="rbt-btn icon-hover icon-hover-left btn-md bg-primary-opacity vaohoc"
            href="#"
            onClick={(e) => {
              e.preventDefault(); // Ngăn chặn hành động mặc định của thẻ <a>

              // Lấy dữ liệu từ localStorage
              const storedChapterId =
                localStorage.getItem("encryptedChapterId");
              const storedLessonId = localStorage.getItem("encryptedLessonId");

              // Giải mã và chuyển sang số
              const chapterId = storedChapterId
                ? parseInt(decryptData(storedChapterId), 10)
                : null;
              const lessonId = storedLessonId
                ? parseInt(decryptData(storedLessonId), 10)
                : null;

              if (chapterId && lessonId) {
                // Gọi hàm chuyển bài học
                navigateToLesson(
                  "previous",
                  chapterId,
                  lessonId,
                  coursesData,
                  progressData
                );
              } else {
                showToast("Không tìm thấy thông tin bài học hiện tại.");
              }
            }}
          >
            <span className="btn-icon vaohoc">
              <i className="feather-arrow-left vaohoc"></i>
            </span>
            <span className="btn-text vaohoc" style={{ color: "white" }}>
              Bài trước
            </span>
          </a>

          <a
            className="rbt-btn icon-hover btn-md vaohoc"
            href="#"
            onClick={(e) => {
              // Lấy dữ liệu từ localStorage
              const storedChapterId =
                localStorage.getItem("encryptedChapterId");
              const storedLessonId = localStorage.getItem("encryptedLessonId");

              // Giải mã và chuyển sang số
              const chapterId = storedChapterId
                ? parseInt(decryptData(storedChapterId), 10)
                : null;
              const lessonId = storedLessonId
                ? parseInt(decryptData(storedLessonId), 10)
                : null;

              if (chapterId && lessonId) {
                // Gọi hàm chuyển bài học
                navigateToLesson(
                  "next",
                  chapterId,
                  lessonId,
                  coursesData,
                  progressData
                );
              } else {
                showToast("Không tìm thấy thông tin bài học hiện tại.");
              }
            }}
          >
            <span className="btn-text vaohoc" style={{ color: "white" }}>
              Bài tiếp theo
            </span>
            <span className="btn-icon vaohoc">
              <i className="feather-arrow-right vaohoc"></i>
            </span>
          </a>
        </div>
      </div>
      <div className="comment-section row" style={{ margin: "0px 15px" }}>
        <h3>BÌNH LUẬN</h3>

        <div className="comment-login">
          <div className="add-comment-root">
            <textarea
              placeholder="Viết bình luận của bạn..."
              value={rootCommentContent}
              onChange={(e) => setRootCommentContent(e.target.value)}
            ></textarea>
            <button
              onClick={() => {
                handleAddRootComment(rootCommentContent);
                setRootCommentContent(""); // Xóa nội dung sau khi gửi
              }}
              disabled={!rootCommentContent.trim()} // Vô hiệu hóa nút nếu không có nội dung
            >
              Gửi
            </button>
          </div>
        </div>

        <div className="comments-list">
          {rootComments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-user">
                <div className="comment-user-image">
                  <img
                    src="https://i.imgur.com/6ASBXYj.jpeg"
                    alt="User Avatar"
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                    }}
                  />
                </div>
                <div className="comment-user-content">
                  <span className="username">{comment.account.fullname}</span>
                  <span className="comment-date">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                  <button
                    className="reply-button-user"
                    onClick={() => handleReplyClick(comment.id)}
                  >
                    {activeReplyId === comment.id ? "Hủy" : "Trả lời"}
                  </button>
                  {/* <button
                    className="reply-button-user"
                    onClick={() => btnDelete(comment.id)}
                  >
                    Xóa
                  </button> */}
                  <p className="comment-content">{comment.content}</p>
                </div>
              </div>

              <div className="comment-actions">
                <button
                  className="reply-button"
                  onClick={() => handleReplyToggle(comment.id)}
                >
                  {expandedComments[comment.id]
                    ? "Ẩn các câu trả lời"
                    : "Xem tất cả câu trả lời"}
                </button>
              </div>

              {activeReplyId === comment.id && (
                <div className="add-child-comment">
                  <textarea
                    placeholder="Viết trả lời của bạn..."
                    onChange={(e) => setChildCommentContent(e.target.value)}
                    value={childCommentContent}
                  />
                  <button
                    onClick={() => {
                      handleAddChildComment(childCommentContent, comment.id);
                      setActiveReplyId(null); // Đóng sau khi gửi
                    }}
                  >
                    Gửi
                  </button>
                </div>
              )}

              {/* Hiển thị comment con nếu comment gốc đã được mở */}
              {expandedComments[comment.id] && childrenComments[comment.id] && (
                <div className="child-comments">
                  {childrenComments[comment.id].map((child) => (
                    <div key={child.id} className="child-comment-item children">
                      <div className="comment-user">
                        <div className="comment-user-image">
                          {" "}
                          <img
                            src="https://i.imgur.com/6ASBXYj.jpeg"
                            alt="User Avatar"
                            className="avatar"
                          />
                        </div>
                        <div className="comment-user-content">
                          <span className="username">
                            {child.account.fullname}
                          </span>
                          <span className="comment-date">
                            {new Date(child.createdAt).toLocaleString()}
                          </span>
                          <button
                            className="reply-button-user"
                            onClick={() => handleReplyClick(child.id)}
                          >
                            {activeReplyId === child.id ? "Hủy" : "Trả lời"}
                          </button>
                          {/* <button
                            className="reply-button-user"
                            onClick={() => btnDelete(child.id)}
                          >
                            Xóa
                          </button> */}
                          <p className="comment-content">{child.content}</p>
                        </div>
                      </div>

                      {activeReplyId === child.id && (
                        <div className="add-child-comment">
                          <textarea
                            placeholder="Viết trả lời của bạn..."
                            onChange={(e) =>
                              setChildCommentContent(e.target.value)
                            }
                            value={childCommentContent}
                          />
                          <button
                            onClick={() => {
                              handleAddChildComment(
                                childCommentContent,
                                comment.id
                              );
                              setActiveReplyId(null);
                            }}
                          >
                            Gửi
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {/* Nút phân trang */}

          <div className="pagination comment-video">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
            >
              &lt;
            </button>

            {Array.from(Array(totalPages).keys()).map((page) => (
              <React.Fragment key={page}>
                {page === currentPage ||
                  page === 0 ||
                  page === totalPages - 1 ||
                  (page >= currentPage - 1 && page <= currentPage + 1) ? (
                  <button
                    onClick={() => handlePageChange(page)}
                    className={page === currentPage ? "active" : ""}
                  >
                    {page + 1}
                  </button>
                ) : page === currentPage - 2 || page === currentPage + 2 ? (
                  <span className="dots">...</span>
                ) : null}
              </React.Fragment>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};
