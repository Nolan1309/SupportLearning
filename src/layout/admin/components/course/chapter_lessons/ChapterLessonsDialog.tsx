import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Checkbox,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Typography,
    Paper,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { AdminLessonDTOList } from "../../exam/ExamList";
import useRefreshToken from "../../../../util/fucntion/useRefreshToken";
import { isTokenExpired } from "../../../../util/fucntion/auth";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Props {
    open: boolean;
    onClose: () => void;
    chapterId: number;
    chapterTitle: string;
    courseId?: string;
}

const ChapterLessonsDialog: React.FC<Props> = ({ open, onClose, chapterId, chapterTitle, courseId }) => {

    const [lessons, setLessons] = useState<AdminLessonDTOList[]>([])
    const [selectedLessons, setSelectedLessons] = useState<Set<number>>(() => {
        return new Set(
            lessons
                .filter((lesson) => lesson.isTestExcluded === "FULLTEST")
                .map((lesson) => lesson.id)
        );
    });

    const navigate = useNavigate(); // Khởi tạo navigate
    const refresh = useRefreshToken();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const fetchAllLessonByChapterID = async (chapterId: number, courseID: string) => {
        let token = localStorage.getItem("authToken");

        if (!token || isTokenExpired(token)) {
            token = await refresh();
            if (!token) {
                navigate("/dang-nhap");
                return;
            }
            localStorage.setItem("authToken", token);
        }
        const params = new URLSearchParams({
            courseId: courseID?.toString(),
            page: page.toString(),
            size: rowsPerPage.toString()
        });
        try {
            const response = await fetch(
                `${process.env.REACT_APP_SERVER_HOST}/api/lessons/chapter-all/${chapterId}?${params.toString()}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            if (!response.ok) {
                throw new Error("Failed to fetch data");
            }
            const data = await response.json();
            setLessons(data.content);
        } catch (error: any) {
            toast.error(error);
        }
    };

    useEffect(() => {
        if (chapterId && open) {
            fetchAllLessonByChapterID(chapterId, courseId!);
        }
    }, [chapterId, courseId, open]);
    const handleToggleLesson = (lessonId: number, testStatus: string) => {
        // Nếu bài học có trạng thái EMPTYTEST thì không thực hiện thay đổi
        if (testStatus === "EMPTYTEST") return;

        setLessons((prevLessons) =>
            prevLessons.map((lesson) =>
                lesson.id === lessonId
                    ? {
                        ...lesson,
                        isTestExcluded: lesson.isTestExcluded === "FULLTEST" ? "NOTTEST" : "FULLTEST",
                    }
                    : lesson
            )
        );
    };

    const handleUpdateChapterLesson = async () => {

        let token = localStorage.getItem("authToken");
        if (isTokenExpired(token)) {
            token = await refresh();
            if (!token) {
                navigate("/dang-nhap");
                return;
            }
            localStorage.setItem("authToken", token);
        }

        const url = `${process.env.REACT_APP_SERVER_HOST}/api/lessons/excluded/${chapterId}`;
        fetch(url, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(lessons),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to add lesson");
                }
                return response.text();
            })
            .then((newLesson) => {
                if (newLesson) {

                    toast.success("Cập nhật trạng thái thành công");
                } else {
                    toast.warn("Cập nhật trạng thái không thành công");
                }
            })
            .catch((error) => {
                console.error("Error adding lesson:", error);
            });
    };

    // ✅ Xử lý khi nhấn lưu
    const handleSave = () => {
        console.log("Danh sách bài học đã chọn:", lessons);
        // onClose();
    };
    const testStatusMap: { [key: string]: string } = {
        FULLTEST: "Đã có bài kiểm tra",
        NOTTEST: "Không cần bài kiểm tra",
        EMPTYTEST: "Chưa có bài kiểm tra",
    };


    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">

            <DialogTitle> Cấu Hình Bài Test Cho Bài Học</DialogTitle>
            <DialogContent>

                <h4 style={{ paddingBottom: "10px" }}>Chương: {chapterTitle}</h4>
                {/* Bảng danh sách bài học */}
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>

                                <TableCell>ID</TableCell>
                                <TableCell>Tên bài học</TableCell>
                                <TableCell>Chủ đề</TableCell>
                                <TableCell>Trạng thái bài học</TableCell>
                                <TableCell>Tình trạng bài kiểm tra</TableCell>
                                <TableCell>Bài kiểm tra</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {lessons.map((lesson) => (
                                <TableRow key={lesson.id}>
                                    {/* Checkbox chọn bài */}

                                    <TableCell>{lesson.id}</TableCell>
                                    <TableCell>{lesson.lessonTitle}</TableCell>
                                    <TableCell>{lesson.topic}</TableCell>
                                    <TableCell>{lesson.status ? "Đang hoạt động" : "Đã khóa"}</TableCell>
                                    <TableCell>{testStatusMap[lesson.isTestExcluded] || "Không xác định"}</TableCell>

                                    <TableCell>
                                        <Checkbox
                                            checked={lesson.isTestExcluded === "FULLTEST"}
                                            disabled={lesson.isTestExcluded === "EMPTYTEST"}
                                            onChange={() => handleToggleLesson(lesson.id, lesson.isTestExcluded)}
                                        />
                                    </TableCell>

                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">
                    Hủy
                </Button>
                <Button onClick={handleUpdateChapterLesson} color="primary" variant="contained">
                    Lưu
                </Button>
            </DialogActions>
            <ToastContainer />
        </Dialog>
    );
};

export default ChapterLessonsDialog;
