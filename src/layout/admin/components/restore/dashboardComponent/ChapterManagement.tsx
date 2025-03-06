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
interface AdminChapterDTORestoreList {
    id: number;
    chapterTitle: string;
    deletedDate: string | null;  // Can be null
    isDeleted: boolean;
    courseId: number;
}


const ChapterManagement: React.FC = () => {
    const [chapters, setchapters] = useState<AdminChapterDTORestoreList[]>([]);  // Lưu danh sách khóa học
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
    const [isModalOpen, setIsModalOpen] = useState(false); // Quản lý trạng thái modal
    const [modalTitle, setModalTitle] = useState(""); // Tiêu đề modal
    const [modalMessage, setModalMessage] = useState(""); // Nội dung thông báo trong modal
    const [action, setAction] = useState<"restore" | "delete" | null>(null); // Hành động xác nhận (restore hoặc delete)

    const fetchCourseList = async () => {
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
                `${process.env.REACT_APP_SERVER_HOST}/api/courses/restore-no-delete/list-all-no-courses`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const data = await response.json();
            setCourses(data);

        } catch (error) {
            console.error("Failed to fetch data", error);
        }
    };
    const fetchchapterList = async () => {
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
            courseId: selectedCourse && !isNaN(selectedCourse) ? selectedCourse.toString() : "",
            page: page.toString(),
            size: size.toString(),
        });


        try {
            const response = await fetch(
                `${process.env.REACT_APP_SERVER_HOST}/api/chapters/restore/list-all-chapters?${searchParams.toString()}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const data = await response.json();
            setchapters(data.content);

            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Failed to fetch data", error);
        }
    };
    const fetchchapterListSearch = async () => {
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
            courseId: selectedCourse ? selectedCourse.toString() : "",
            chapterTitle: searchTerm || "",
            deletedDate: selectedDate ? selectedDate.format("YYYY-MM-DD") : "",
            page: page.toString(),
            size: size.toString(),
        });

        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/chapters/restore/list-all/search-chapters?${searchParams.toString()}`
                ,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const data = await response.json();
            setchapters(data.content);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Failed to fetch chapters", error);
        }
    };

    const RestorechapterFunction = async () => {
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
            const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/chapters/restore/${selectedchapter}`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const updatedchapters = chapters.filter(chapter => chapter.id !== selectedchapter);
                setchapters(updatedchapters);
                setIsModalOpen(false);
            } else {
                console.error("Failed to restore account");
            }
        } catch (error) {
            console.error("Error occurred while restoring account", error);
        }
    };
    const DeletechapterFunction = async () => {
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
            const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/chapters/delete/${selectedchapter}`, {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const updatedchapters = chapters.filter(chapter => chapter.id !== selectedchapter);
                setchapters(updatedchapters);
                setIsModalOpen(false); // Close modal
            } else {
                console.error("Failed to delete account");
            }
        } catch (error) {
            console.error("Error occurred while deleting account", error);
        }
    };

    // useEffect(() => {
    //     setPage(0);
    // }, [searchTerm, selectedCourse, selectedDate]);

    const handleConfirm = async () => {
        if (action === "restore" && selectedchapter !== null) {
            RestorechapterFunction();
        } else if (action === "delete" && selectedchapter !== null) {
            DeletechapterFunction();
        }
    };


    useEffect(() => {
        fetchCourseList();
        fetchchapterList();
    }, [page, size]);

    // Hàm để xử lý tìm kiếm theo từ khóa
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    // Hàm để lọc danh sách khóa học theo ngày xóa
    const filterByDate = (chapters: AdminChapterDTORestoreList[]) => {
        if (selectedDate) {
            return chapters.filter(chapter => {
                // Chuyển đổi ngày xóa sang đối tượng ngày và so sánh
                const deletedDate = chapter.deletedDate ? dayjs(chapter.deletedDate) : null;
                return deletedDate && deletedDate.isSame(selectedDate, 'day');
            });
        }
        return chapters;
    };

    // Lọc danh sách khóa học theo từ khóa tìm kiếm
    const filteredchapters = filterByDate(
        chapters.filter(chapter =>
            chapter.chapterTitle.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );


    const handleRestore = (id: number) => {
        setSelectedchapter(id);
        setModalTitle("Khôi phục khóa học");
        setModalMessage("Bạn có chắc chắn muốn khôi phục khóa học này?");
        setAction("restore");
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        setSelectedchapter(id);
        setModalTitle("Xóa vĩnh viễn khóa học");
        setModalMessage("Bạn có chắc chắn muốn xóa vĩnh viễn khóa học này?");
        setAction("delete");
        setIsModalOpen(true);
    };
    const handleSearchClick = () => {
        setPage(0);
        if (searchTerm === "" && selectedDate === null) {
            fetchchapterList();
            return;
        }
        fetchchapterListSearch();
    };
    const handleCourseChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        const value = event.target.value;
        setSelectedCourse(value === '' ? null : Number(value));
    };


    const handleCancel = () => {
        setIsModalOpen(false); // Đóng modal nếu hủy bỏ
    };
    return (
        <Paper sx={{ padding: "20px" }}>
            <h2>Quản lý Chương</h2>

            <div className="row">
                <div className="col-md-8"> <TextField
                    label="Tìm kiếm tên chương"
                    variant="outlined"
                    fullWidth
                    value={searchTerm}
                    onChange={handleSearchChange}
                    sx={{ marginBottom: "20px" }}
                />
                    <div>
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
                        <TableCell>Tên chương</TableCell>
                        <TableCell>Ngày xóa</TableCell>
                        <TableCell>Hành động</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredchapters.map((chapter) => (
                        <TableRow key={chapter.id}>
                            <TableCell>{chapter.id}</TableCell>
                            <TableCell>{chapter.chapterTitle}</TableCell>
                            <TableCell>{chapter.deletedDate ? chapter.deletedDate : "Chưa xóa"}</TableCell>
                            <TableCell>
                                {chapter.isDeleted ? (
                                    <>
                                        {/* Khôi phục khóa học */}
                                        <IconButton onClick={() => handleRestore(chapter.id)} color="primary">
                                            <Restore />
                                        </IconButton>
                                        {/* Xóa vĩnh viễn khóa học */}
                                        <IconButton onClick={() => handleDelete(chapter.id)} color="secondary">
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

export default ChapterManagement;
