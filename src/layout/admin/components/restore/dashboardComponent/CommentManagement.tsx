import React, { useState, useEffect } from "react";
import { TextField, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Paper, Button, MenuItem } from "@mui/material";
import { DeleteForever, Restore } from "@mui/icons-material"; // Các icon Material UI
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';  // Để làm việc với đối tượng ngày
import ConfirmModal from "../../../../util/ConfirmModal";
import { useNavigate } from "react-router-dom";
import useRefreshToken from "../../../../util/fucntion/useRefreshToken";
import { isTokenExpired } from "../../../../util/fucntion/auth";
import { AdminCourseDTORestoreList } from "./CourseManagement";
// import "./dashboardCompo.css";
export interface AdminCommentDTORestoreList {
    id: number;
    content: string;
    createdAt: string; // ISO Date format
    deletedDate: string | null; // Có thể null
    isApproved: boolean;
    isDeleted: boolean;
    updatedAt: string;
    accId: number;
    contentId: number;
    lessonId: number;
    videoId: number;
}


const CommentManagement: React.FC = () => {
    const [comments, setComments] = useState<AdminCommentDTORestoreList[]>([]);  // Lưu danh sách khóa học
    // const [chapters, setChapters] = useState<AdminChapterDTORestoreList[]>([]);  // Lưu danh sách khóa học
    const [courses, setCourses] = useState<AdminCourseDTORestoreList[]>([]);  // Lưu danh sách khóa học
    const [page, setPage] = useState(0);  // Lưu trang hiện tại
    const [size, setSize] = useState(2);  // Lưu số lượng bản ghi mỗi trang
    const [totalPages, setTotalPages] = useState(0);
    const navigate = useNavigate();
    const refresh = useRefreshToken();
    const [searchTerm, setSearchTerm] = useState("");  // Lưu từ khóa tìm kiếm
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);  // Lưu ngày chọn tìm kiếm
    const [isSearch, setIsSearch] = useState(false);

    const [selectedCourse, setSelectedCourse] = useState<number | null>(null); // Khóa học đang được chọn
    const [selectedchapter, setSelectedchapter] = useState<number | null>(null); // Khóa học đang được chọn
    const [selectedLesson, setSelectedLesson] = useState<number | null>(null); // Khóa học đang được chọn
    const [isModalOpen, setIsModalOpen] = useState(false); // Quản lý trạng thái modal
    const [modalTitle, setModalTitle] = useState(""); // Tiêu đề modal
    const [modalMessage, setModalMessage] = useState(""); // Nội dung thông báo trong modal
    const [action, setAction] = useState<"restore" | "delete" | null>(null); // Hành động xác nhận (restore hoặc delete)

    const fetchCommentList = async () => {
        let token = localStorage.getItem("authToken");
        if (isTokenExpired(token)) {
            token = await refresh();
            if (!token) {
                window.location.href = "/dang-nhap";
                return;
            }
            localStorage.setItem("authToken", token);
        }

        const searchParams = new URLSearchParams({
            content: searchTerm || "",
            deletedDate: selectedDate ? selectedDate.format("YYYY-MM-DD") : "",
            page: page.toString(),
            size: size.toString(),
        });


        try {
            const response = await fetch(
                `${process.env.REACT_APP_SERVER_HOST}/api/comments/restore/list-all-comments?${searchParams.toString()}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const data = await response.json();
            setComments(data.content);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Failed to fetch data", error);
        }
    };


    const RestoreLessonFunction = async () => {
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
            const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/lessons/restore/${selectedLesson}`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                // const updatedLessons = filteredlessons.filter(lesson => lesson.id !== selectedLesson);
                // setLessons(updatedLessons);
                setIsModalOpen(false);
            } else {
                console.error("Failed to restore account");
            }
        } catch (error) {
            console.error("Error occurred while restoring account", error);
        }
    };
    const DeleteLessonFunction = async () => {
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
            const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/lessons/delete/${selectedLesson}`, {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                // const updatedLessons = filteredlessons.filter(lesson => lesson.id !== selectedLesson);
                // setLessons(updatedLessons);
                setIsModalOpen(false); // Close modal
            } else {
                console.error("Failed to delete account");
            }
        } catch (error) {
            console.error("Error occurred while deleting account", error);
        }
    };

    const handleConfirm = async () => {
        if (action === "restore" && selectedLesson !== null) {
            RestoreLessonFunction();
        } else if (action === "delete" && selectedLesson !== null) {
            DeleteLessonFunction();
        }
    };

    useEffect(() => {
        fetchCommentList();
    }, [page, size]);

    // Hàm để xử lý tìm kiếm theo từ khóa
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    // Hàm để lọc danh sách khóa học theo ngày xóa
    const filterByDate = (comments: AdminCommentDTORestoreList[]) => {
        if (selectedDate) {
            return comments.filter(comment => {
                // Chuyển đổi ngày xóa sang đối tượng ngày và so sánh
                const deletedDate = comment.deletedDate ? dayjs(comment.deletedDate) : null;
                return deletedDate && deletedDate.isSame(selectedDate, 'day');
            });
        }
        return comments;
    };

    // Lọc danh sách khóa học theo từ khóa tìm kiếm
    const filteredcomments = filterByDate(
        comments.filter(comment =>
            comment.content.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const handleRestore = (id: number) => {
        setSelectedLesson(id);
        setModalTitle("Khôi phục bài học");
        setModalMessage("Bạn có chắc chắn muốn khôi phục bài học này?");
        setAction("restore");
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        setSelectedLesson(id);
        setModalTitle("Xóa vĩnh viễn bài học");
        setModalMessage("Bạn có chắc chắn muốn xóa vĩnh viễn bài học này?");
        setAction("delete");
        setIsModalOpen(true);
    };
    const handleSearchClick = () => {
        setPage(0);
        fetchCommentList();
    };

    // const handleCourseChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    //     const selectedCourseId = event.target.value as number;
    //     setSelectedCourse(selectedCourseId);
    //     setSelectedchapter(null); // Reset chapter khi đổi course
    //     const filtered = chapters.filter(chap => chap.courseId === selectedCourseId);
    //     setFilteredChapters(filtered);
    // };

    // const handleChapterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    //     const selectedChapterId = event.target.value as number;
    //     setSelectedchapter(selectedChapterId);

    //     // Tìm khóa học của chương đó
    //     const chapter = chapters.find(chap => chap.id === selectedChapterId);
    //     if (chapter) {
    //         setSelectedCourse(chapter.courseId);
    //     }
    // };



    const handleCancel = () => {
        setIsModalOpen(false); // Đóng modal nếu hủy bỏ
    };
    return (
        <Paper sx={{ padding: "20px" }}>
            <h2>Quản lý bài học</h2>

            <div className="row">
                <div className="col-md-8"> <TextField
                    label="Tìm kiếm tên bài học"
                    variant="outlined"
                    fullWidth
                    value={searchTerm}
                    onChange={handleSearchChange}
                    sx={{ marginBottom: "20px" }}
                />
                    {/* <div>
                        <TextField
                            label="Chọn khóa học"
                            variant="outlined"
                            fullWidth
                            select
                            value={selectedCourse}
                            onChange={handleCourseChange}
                            sx={{ marginBottom: "20px" }}
                        >
                            {courses.map((course) => (
                                <MenuItem key={course.id} value={course.id}>
                                    {course.coursesTitle}
                                </MenuItem>
                            ))}
                        </TextField>
                    </div>
                    <div>
                        <TextField
                            label="Chọn chương học"
                            variant="outlined"
                            fullWidth
                            select
                            value={selectedchapter || ""}
                            onChange={handleChapterChange}
                            sx={{ marginBottom: "20px" }}
                        >
                            {filteredChapters.map((chapter) => (
                                <MenuItem key={chapter.id} value={chapter.id}>
                                    {chapter.chapterTitle}
                                </MenuItem>
                            ))}
                        </TextField>
                    </div> */}
                </div>
                <div className="col-md-4">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Tìm kiếm theo ngày xóa"
                            value={selectedDate}
                            onChange={(date: Dayjs | null) => setSelectedDate(date)}
                            format="YYYY-MM-DD"
                        />
                    </LocalizationProvider>
                    <Button onClick={handleSearchClick}>Tìm kiếm</Button>
                </div>

            </div>

            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Tên bài học</TableCell>
                        <TableCell>Ngày xóa</TableCell>
                        <TableCell>Hành động</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredcomments.map((comment) => (
                        <TableRow key={comment.id}>
                            <TableCell>{comment.id}</TableCell>
                            <TableCell>{comment.content}</TableCell>
                            <TableCell>{comment.deletedDate ? comment.deletedDate : "Chưa xóa"}</TableCell>
                            <TableCell>
                                {comment.isDeleted ? (
                                    <>
                                        {/* Khôi phục khóa học */}
                                        <IconButton onClick={() => handleRestore(comment.id)} color="primary">
                                            <Restore />
                                        </IconButton>
                                        {/* Xóa vĩnh viễn khóa học */}
                                        <IconButton onClick={() => handleDelete(comment.id)} color="secondary">
                                            <DeleteForever />
                                        </IconButton>
                                    </>
                                ) : (
                                    <span>Không có hành động</span>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div>

                <button
                    onClick={() => setPage(prev => Math.max(prev - 1, 0))}
                    disabled={page === 0 || totalPages === 0} // Không có dữ liệu thì disable
                >
                    Trước
                </button>
                <span> {totalPages === 0 ? `${page}/${totalPages}` : `${page + 1}/${totalPages}`}</span>
                <button
                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages - 1))}
                    disabled={totalPages === 0 || page >= totalPages - 1} // Không có dữ liệu hoặc trang cuối thì disable
                >
                    Tiếp
                </button>


            </div>
            <ConfirmModal
                isOpen={isModalOpen}
                title={modalTitle}
                message={modalMessage}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </Paper>
    );
};

export default CommentManagement;
