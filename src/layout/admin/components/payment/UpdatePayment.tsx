import React, { useState, useEffect } from 'react';
import { TextField, Button, Select, MenuItem, CircularProgress, FormControlLabel, Checkbox } from '@material-ui/core';
import { useNavigate } from 'react-router-dom';
import { ADMIN_ADD_TEST, ADMIN_GET_CHAPTERS_LIST, ADMIN_GET_CB_COURSE } from '../../../../api/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import RequireAdmin from "../../../DOM/RequireAdmin";
import useRefreshToken from "../../../util/fucntion/useRefreshToken";
import { isTokenExpired } from "../../../util/fucntion/auth";
interface Exam {
    title: string;
    description: string;
    total_question: number;
    chapter_id?: number;  // ID của chương sẽ được cập nhật từ Select
    course_id?: number;   // ID của khóa học sẽ được cập nhật từ Select
    isSummary?: boolean;
}

const AddExam: React.FC = () => {
    const [exam, setExam] = useState<Exam>({
        title: '',
        description: '',
        total_question: 0,
        chapter_id: undefined,
        course_id: undefined,
        isSummary: false
    });
    const [chapters, setChapters] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [adding, setAdding] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const navigate = useNavigate();
    const token = localStorage.getItem('authToken');
    const refresh = useRefreshToken();
    useEffect(() => {


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
                    method: 'GET', // Phương thức yêu cầu
                    headers: {
                        'Authorization': `Bearer ${token}`, // Đảm bảo bạn gửi token trong headers
                        'Content-Type': 'application/json', // Đảm bảo đúng định dạng dữ liệu JSON
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
            const authData = JSON.parse(localStorage.getItem("authData") || '{}');

            const accountId = authData ? authData.id : null;

            if (!accountId) {
                console.error("Account ID không hợp lệ!");
                navigate("/dang-nhap");
                return;
            }

            try {
                // Gọi API để lấy dữ liệu khóa học mà không phân trang
                const response = await fetch(`${ADMIN_GET_CB_COURSE}/${accountId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
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
        fetchChapters();
        fetchCourses();
        setLoading(false);
    }, [token]);

    // Hàm thay đổi thông tin bài kiểm tra dựa trên input từ người dùng
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setExam((prevExam) => ({ ...prevExam, [name]: value }));
    };


    // Hàm thay đổi chương
    const handleChapterChange = (e: React.ChangeEvent<{ value: unknown }>) => {
        const chapterId = e.target.value as number;
        setExam((prevExam) => ({ ...prevExam, chapter_id: chapterId }));
    };

    // Hàm thay đổi khóa học
    const handleCourseChange = (e: React.ChangeEvent<{ value: unknown }>) => {
        const courseId = e.target.value as number;
        setExam((prevExam) => ({ ...prevExam, course_id: courseId }));
    };

    // Hàm thay đổi thuộc tính tóm tắt
    const handleSummaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isSummary = e.target.checked;
        setExam((prevExam) => ({ ...prevExam, isSummary }));
    };

    const handleAddExam = async () => {
        setAdding(true);
        try {
            const response = await fetch(ADMIN_ADD_TEST, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: exam.title,
                    description: exam.description,
                    totalQuestion: exam.total_question,
                    chapterId: exam.chapter_id,
                    courseId: exam.course_id,
                    isSummary: exam.isSummary,
                }),
            });

            if (!response.ok) {
                if (response.status === 500) {
                    // Lỗi từ backend, hiển thị thông báo lỗi với Toast
                    throw new Error('Bài test đã có trong bài test chương');
                } else {
                    throw new Error('Failed to add exam');
                }
            }

            // Nếu thành công, chuyển hướng người dùng
            navigate('/admin/bai-kiem-tra');
        } catch (error) {
            // Hiển thị thông báo lỗi cho người dùng
            if (error instanceof Error) {
                setErrorMessage(error.message);
                toast.error(error.message); // Hiển thị lỗi bằng Toast
            } else {
                setErrorMessage('An unexpected error occurred.');
                toast.error('An unexpected error occurred.');
            }
        } finally {
            setAdding(false);
        }
    };






    if (loading) {
        return <div className="loading-container"><CircularProgress /></div>;
    }

    return (
        <div className="add-exam-container">

            <h2>Thêm Bài Kiểm Tra Mới</h2>
            <form className="add-exam-form">
                <TextField
                    label="Tiêu đề"
                    name="title"
                    value={exam.title}
                    onChange={handleInputChange}
                    variant="outlined"
                    fullWidth
                    margin="dense"
                />
                <TextField
                    label="Mô tả"
                    name="description"
                    value={exam.description}
                    onChange={handleInputChange}
                    variant="outlined"
                    fullWidth
                    margin="dense"
                    multiline
                    rows={4}
                />
                <TextField
                    label="Số lượng câu hỏi"
                    name="total_question"
                    type="number"
                    value={exam.total_question}
                    onChange={handleInputChange}
                    variant="outlined"
                    fullWidth
                    margin="dense"
                />
                <Select
                    label="Chương"
                    value={exam.chapter_id || ''}
                    onChange={handleChapterChange}
                    fullWidth
                    variant="outlined"
                >
                    {chapters.map((chapter) => (
                        <MenuItem key={chapter.id} value={chapter.id}>{chapter.title}</MenuItem>
                    ))}
                </Select>
                <Select
                    label="Khóa học"
                    value={exam.course_id || ''}
                    onChange={handleCourseChange}
                    fullWidth
                    variant="outlined"
                >
                    {courses.map((course) => (
                        <MenuItem key={course.id} value={course.id}>{course.courseTitle}</MenuItem>
                    ))}
                </Select>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={exam.isSummary || false}
                            onChange={handleSummaryChange}
                            name="isSummary"
                            color="primary"
                        />
                    }
                    label="Bài kiểm tra chương"
                />
                <div className="add-exam-actions">
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleAddExam}
                        disabled={adding}
                    >
                        {adding ? <CircularProgress size={24} /> : 'Thêm Bài Kiểm Tra'}
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => navigate('/admin/bai-kiem-tra')}
                        disabled={adding}
                    >
                        Hủy Bỏ
                    </Button>
                </div>
            </form>
            <ToastContainer />
        </div>
    );
};
export const RequestAdminURL = RequireAdmin(AddExam);

export default AddExam;