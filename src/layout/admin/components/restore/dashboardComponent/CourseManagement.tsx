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
// import "./dashboardCompo.css";
export interface AdminCourseDTORestoreList {
    id: number;
    author: string;
    cost: number;
    courseOutput: string;
    createdAt: string;  // ISO 8601 format for date-time strings
    deletedDate: string | null;  // Can be null
    description: string;
    duration: string;
    imageUrl: string;
    isDeleted: boolean;
    language: string;
    price: number;
    status: string;
    coursesTitle: string;
    type: string;
    updatedAt: string;  // ISO 8601 format for date-time strings
    courseCategoryId: number;
    accountId: number;
}


const CourseManagement: React.FC = () => {
    const [courses, setCourses] = useState<AdminCourseDTORestoreList[]>([]);  // Lưu danh sách khóa học
    const [page, setPage] = useState(0);  // Lưu trang hiện tại
    const [size, setSize] = useState(10);  // Lưu số lượng bản ghi mỗi trang
    const [totalPages, setTotalPages] = useState(0);
    const navigate = useNavigate();
    const refresh = useRefreshToken();
    const [searchTerm, setSearchTerm] = useState("");  // Lưu từ khóa tìm kiếm
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);  // Lưu ngày chọn tìm kiếm
    const [isSearch, setIsSearch] = useState(false);

    const [selectedCourse, setSelectedCourse] = useState<number | null>(null); // Khóa học đang được chọn
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
                `${process.env.REACT_APP_SERVER_HOST}/api/courses/restore/list-all-courses?page=${page}&size=${size}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const data = await response.json();
            setCourses(data.content);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Failed to fetch data", error);
        }
    };
    const fetchCourseListSearch = async () => {
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
            courseTitle: searchTerm || "",
            deletedDate: selectedDate ? selectedDate.format("YYYY-MM-DD") : "",
            page: page.toString(),
            size: size.toString(),
        });

        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/courses/restore/list-all/search-courses?${searchParams.toString()}`
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
            setCourses(data.content);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Failed to fetch courses", error);
        }
    };

    const RestoreCourseFunction = async () => {
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
            const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/courses/restore/${selectedCourse}`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const updatedcourses = courses.filter(course => course.id !== selectedCourse);
                setCourses(updatedcourses);
                setIsModalOpen(false);
            } else {
                console.error("Failed to restore account");
            }
        } catch (error) {
            console.error("Error occurred while restoring account", error);
        }
    };
    const DeleteCourseFunction = async () => {
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
            const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/courses/delete/${selectedCourse}`, {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const updatedcourses = courses.filter(course => course.id !== selectedCourse);
                setCourses(updatedcourses);
                setIsModalOpen(false); // Close modal
            } else {
                console.error("Failed to delete account");
            }
        } catch (error) {
            console.error("Error occurred while deleting account", error);
        }
    };


    const handleConfirm = async () => {
        if (action === "restore" && selectedCourse !== null) {
            RestoreCourseFunction();
        } else if (action === "delete" && selectedCourse !== null) {
            DeleteCourseFunction();
        }
    };


    useEffect(() => {
        fetchCourseList();
    }, [page, size]);

    // Hàm để xử lý tìm kiếm theo từ khóa
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    // Hàm để lọc danh sách khóa học theo ngày xóa
    const filterByDate = (courses: AdminCourseDTORestoreList[]) => {
        if (selectedDate) {
            return courses.filter(course => {
                // Chuyển đổi ngày xóa sang đối tượng ngày và so sánh
                const deletedDate = course.deletedDate ? dayjs(course.deletedDate) : null;
                return deletedDate && deletedDate.isSame(selectedDate, 'day');
            });
        }
        return courses;
    };

    // Lọc danh sách khóa học theo từ khóa tìm kiếm
    const filteredCourses = filterByDate(
        courses.filter(course =>
            course.coursesTitle.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );


    const handleRestore = (id: number) => {
        setSelectedCourse(id);
        setModalTitle("Khôi phục khóa học");
        setModalMessage("Bạn có chắc chắn muốn khôi phục khóa học này?");
        setAction("restore");
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        setSelectedCourse(id);
        setModalTitle("Xóa vĩnh viễn khóa học");
        setModalMessage("Bạn có chắc chắn muốn xóa vĩnh viễn khóa học này?");
        setAction("delete");
        setIsModalOpen(true);
    };
    const handleSearchClick = () => {
        if (searchTerm === "" && selectedDate === null) {
            fetchCourseList();
            return;
        }
        fetchCourseListSearch();
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
            <h2>Quản lý Khóa học</h2>

            <div className="row">
                <div className="col-md-8">
                    <TextField
                        label="Tìm kiếm khóa học"
                        variant="outlined"
                        fullWidth
                        value={searchTerm}
                        onChange={handleSearchChange}
                        sx={{ marginBottom: "20px" }}
                    />

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
                        <TableCell>Tên khóa học</TableCell>
                        <TableCell>Ngày xóa</TableCell>
                        <TableCell>Hành động</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredCourses.map((course) => (
                        <TableRow key={course.id}>
                            <TableCell>{course.id}</TableCell>
                            <TableCell>{course.coursesTitle}</TableCell>
                            <TableCell>{course.deletedDate ? course.deletedDate : "Chưa xóa"}</TableCell>
                            <TableCell>
                                {course.isDeleted ? (
                                    <>
                                        {/* Khôi phục khóa học */}
                                        <IconButton onClick={() => handleRestore(course.id)} color="primary">
                                            <Restore />
                                        </IconButton>
                                        {/* Xóa vĩnh viễn khóa học */}
                                        <IconButton onClick={() => handleDelete(course.id)} color="secondary">
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
                    disabled={page === 0}
                >
                    Previous
                </button>
                <span>Page {page + 1} of {totalPages}</span>
                <button
                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages - 1))}
                    disabled={page === totalPages - 1}
                >
                    Next
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

export default CourseManagement;
