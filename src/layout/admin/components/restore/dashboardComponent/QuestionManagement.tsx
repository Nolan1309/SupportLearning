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
import { AccountDetailsDTO_V2 } from "./AccountManagementComponent";
// import "./dashboardCompo.css";
export interface AdminChapterDTORestoreList {
    id: number;
    chapterTitle: string;
    deletedDate: string | null;  // Can be null
    isDeleted: boolean;
    courseId: number;
}
export interface AdminLessonDTORestoreList {
    id: number;
    createdAt: string; // ISO Date format
    duration: number;
    lessonTitle: string;
    updatedAt: string;
    chapterId: number;
    courseId: number;
    deletedDate: string | null; // Có thể null
    isDeleted: boolean;
    isTestExcluded: boolean;
}
export interface AdminQuestionDTORestoreList {
    id: number;
    content: string;
    createdAt: string; // ISO Date format
    deletedDate: string | null; // Can be null
    instruction: string;
    isDeleted: boolean;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    result: string;
    resultCheck: string;
    updatedAt: string;
    level: string;
    type: string;
    accountId: number;
    courseId: number;
    topic: string;
}

const QuestionManagement: React.FC = () => {
    const [questions, setQuestions] = useState<AdminQuestionDTORestoreList[]>([]);  // Lưu danh sách khóa học
    const [accounts, setAccounts] = useState<AccountDetailsDTO_V2[]>([]);  // Lưu danh sách khóa học
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
    const [selectedAccount, setSelectedAccount] = useState<number | null>(null); // Khóa học đang được chọn
    const [selectedLesson, setSelectedLesson] = useState<number | null>(null); // Khóa học đang được chọn
    const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null); // Khóa học đang được chọn
    const [isModalOpen, setIsModalOpen] = useState(false); // Quản lý trạng thái modal
    const [modalTitle, setModalTitle] = useState(""); // Tiêu đề modal
    const [modalMessage, setModalMessage] = useState(""); // Nội dung thông báo trong modal
    const [action, setAction] = useState<"restore" | "delete" | null>(null); // Hành động xác nhận (restore hoặc delete)
    const [filteredCourses, setFilteredCourses] = useState<AdminCourseDTORestoreList[]>([]);

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
            setFilteredCourses(data);
        } catch (error) {
            console.error("Failed to fetch data", error);
        }
    };

    const fetchAccountList = async () => {
        let token = localStorage.getItem("authToken");
        if (isTokenExpired(token)) {
            token = await refresh();
            if (!token) {
                window.location.href = "/dang-nhap";
                return;
            }
            localStorage.setItem("authToken", token);
        }

        // const searchParams = new URLSearchParams({
        //     courseId: selectedCourse ? selectedCourse.toString() : "",
        // });

        try {
            const response = await fetch(
                `${process.env.REACT_APP_SERVER_HOST}/api/account/restore-no-delete/list-all-no-accounts-teacher`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const data = await response.json();
            setAccounts(data);

        } catch (error) {
            console.error("Failed to fetch data", error);
        }
    };



    const fetcQuestionList = async () => {
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
            accountId: selectedAccount && !isNaN(selectedAccount) ? selectedAccount.toString() : "",
            content: searchTerm || "",
            deletedDate: selectedDate ? selectedDate.format("YYYY-MM-DD") : "",
            page: page.toString(),
            size: size.toString(),
        });


        try {
            const response = await fetch(
                `${process.env.REACT_APP_SERVER_HOST}/api/questions/restore/list-all-questions?${searchParams.toString()}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const data = await response.json();
            setQuestions(data.content);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Failed to fetch data", error);
        }
    };



    const RestoreQuestionFunction = async () => {
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
            const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/questions/restore/${selectedQuestion}`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const updatedQuestions = filteredquestions.filter(question => question.id !== selectedQuestion);
                setQuestions(updatedQuestions);
                setIsModalOpen(false);
            } else {
                console.error("Failed to restore account");
            }
        } catch (error) {
            console.error("Error occurred while restoring account", error);
        }
    };
    const DeleteQuestionFunction = async () => {
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
            const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/questions/delete/${selectedQuestion}`, {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const updatedQuestions = filteredquestions.filter(question => question.id !== selectedQuestion);
                setQuestions(updatedQuestions);
                setIsModalOpen(false); // Close modal
            } else {
                console.error("Failed to delete account");
            }
        } catch (error) {
            console.error("Error occurred while deleting account", error);
        }
    };

    const handleConfirm = async () => {
        if (action === "restore" && selectedQuestion !== null) {
            RestoreQuestionFunction();
        } else if (action === "delete" && selectedQuestion !== null) {
            DeleteQuestionFunction();
        }
    };

    useEffect(() => {
        fetchCourseList();
        fetchAccountList();
        fetcQuestionList();
    }, [page, size]);

    // Hàm để xử lý tìm kiếm theo từ khóa
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    // Hàm để lọc danh sách khóa học theo ngày xóa
    const filterByDate = (accounts: AdminQuestionDTORestoreList[]) => {
        if (selectedDate) {
            return questions.filter(question => {
                // Chuyển đổi ngày xóa sang đối tượng ngày và so sánh
                const deletedDate = question.deletedDate ? dayjs(question.deletedDate) : null;
                return deletedDate && deletedDate.isSame(selectedDate, 'day');
            });
        }
        return accounts;
    };

    // Lọc danh sách khóa học theo từ khóa tìm kiếm
    const filteredquestions = filterByDate(
        questions.filter(question =>
            question.content.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const handleRestore = (id: number) => {
        setSelectedQuestion(id);
        setModalTitle("Khôi phục bài học");
        setModalMessage("Bạn có chắc chắn muốn khôi phục bài học này?");
        setAction("restore");
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        setSelectedQuestion(id);
        setModalTitle("Xóa vĩnh viễn bài học");
        setModalMessage("Bạn có chắc chắn muốn xóa vĩnh viễn bài học này?");
        setAction("delete");
        setIsModalOpen(true);
    };
    const handleSearchClick = () => {
        setPage(0);
        fetcQuestionList();
    };
    const handleAccountChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        const selectedAccountId = event.target.value as number;
        setSelectedAccount(selectedAccountId);;
        setSelectedCourse(null);
        const filtered = courses.filter(course => course.accountId === selectedAccountId);
        setFilteredCourses(filtered);
    };

    const handleCourseChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        const selectedCourseId = event.target.value as number;
        setSelectedCourse(selectedCourseId);


        const course = courses.find(course => course.id === selectedCourseId);
        if (course) {
            setSelectedAccount(course.accountId);
        }
    };





    const handleCancel = () => {
        setIsModalOpen(false); // Đóng modal nếu hủy bỏ
    };
    return (
        <Paper sx={{ padding: "20px" }}>
            <h2>Quản lý ngân hàng câu hỏi</h2>

            <div className="row">
                <div className="col-md-8"> <TextField
                    label="Tìm kiếm câu hỏi"
                    variant="outlined"
                    fullWidth
                    value={searchTerm}
                    onChange={handleSearchChange}
                    sx={{ marginBottom: "20px" }}
                />
                    <div>
                        <TextField
                            label="Chọn giáo viên"
                            variant="outlined"
                            fullWidth
                            select
                            value={selectedAccount}
                            onChange={handleAccountChange}
                            sx={{ marginBottom: "20px" }}
                        >
                            {accounts.map((account) => (
                                <MenuItem key={account.id} value={account.id}>
                                    {account.fullname}
                                </MenuItem>
                            ))}
                        </TextField>
                    </div>
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
                            {filteredCourses.map((course) => (
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
                        <TableCell>Tên bài học</TableCell>
                        <TableCell>Ngày xóa</TableCell>
                        <TableCell>Hành động</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredquestions.map((question) => (
                        <TableRow key={question.id}>
                            <TableCell>{question.id}</TableCell>
                            <TableCell>{question.content}</TableCell>
                            <TableCell>{question.deletedDate ? question.deletedDate : "Chưa xóa"}</TableCell>
                            <TableCell>
                                {question.isDeleted ? (
                                    <>
                                        {/* Khôi phục khóa học */}
                                        <IconButton onClick={() => handleRestore(question.id)} color="primary">
                                            <Restore />
                                        </IconButton>
                                        {/* Xóa vĩnh viễn khóa học */}
                                        <IconButton onClick={() => handleDelete(question.id)} color="secondary">
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

export default QuestionManagement;
