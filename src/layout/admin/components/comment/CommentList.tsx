import React, { useState, useEffect } from "react";
import {
    TextField,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    IconButton,
    Button,
    TablePagination,
    Paper,
    Divider
} from "@material-ui/core";
import { ToggleOff, ToggleOn } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import {
    ADMIN_GET_COMNENT,
    ADMIN_HIDE_COMMENT,
    ADMIN_SHOW_COMMENT,
    ADMIN_UNACTIVE_COMNENT,
    ADMIN_ACTIVE_COMNENT
} from "../../../../api/api";
import clsx from 'clsx';
import { isTokenExpired } from "../../../util/fucntion/auth";
import useRefreshToken from "../../../util/fucntion/useRefreshToken";
import { toast, ToastContainer } from "react-toastify"; // Import react-toastify để hiển thị thông báo
import "react-toastify/dist/ReactToastify.css"; // Import CSS của react-toastify
import styles from "./commentList.module.scss"; // Import file CSS nếu cần

type Comment = {
    id: number;
    content: string;
    username: string;
    createdAt: string;
    approved: boolean;
    deleted: boolean;
};

const CommentList: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [comments, setComments] = useState<Comment[]>([]);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalElements, setTotalElements] = useState(0);
    const navigate = useNavigate();
    const refresh = useRefreshToken();

    // Fetch comments
    useEffect(() => {
        const fetchComments = async () => {
            let token = localStorage.getItem("authToken");

            if (isTokenExpired(token)) {
                token = await refresh();
                if (!token) {
                    navigate("/dang-nhap");
                    return;
                }
                localStorage.setItem("authToken", token);
            }

            fetch(`${ADMIN_GET_COMNENT}?page=${page}&size=${rowsPerPage}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            })
                .then((response) => response.json())
                .then((data) => {
                    // Map dữ liệu trả về từ API vào cấu trúc Comment
                    const fetchedComments: Comment[] = data.content.map((comment: any) => ({
                        id: comment.id,                      // ID của bình luận
                        content: comment.content,            // Nội dung bình luận
                        username: comment.fullname,          // Tên người dùng (fullname)
                        createdAt: comment.createdAt,        // Thời gian tạo bình luận
                        deleted: comment.isDeleted,
                        approved: comment.isApproved,           // Trạng thái ẩn/xóa (isDeleted)
                    }));

                    // Cập nhật danh sách bình luận và tổng số bản ghi
                    setComments(fetchedComments);
                    setTotalElements(data.totalElements);    // Tổng số bình luận
                })
                .catch((error) => {
                    console.error("Error fetching comments:", error);
                    toast.error("Có lỗi xảy ra khi lấy danh sách bình luận", {
                        position: "top-right",
                        autoClose: 3000,
                    });
                });

        };

        fetchComments();
    }, [page, rowsPerPage, navigate]);

    const handleHide = async (id: number) => {
        let token = localStorage.getItem("authToken");

        if (isTokenExpired(token)) {
            token = await refresh();
            if (!token) {
                navigate("/dang-nhap");
                return;
            }
            localStorage.setItem("authToken", token);
        }

        fetch(`${ADMIN_HIDE_COMMENT}/${id}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => {
                if (response.ok) {
                    setComments((prevComments) =>
                        prevComments.map((comment) =>
                            comment.id === id ? { ...comment, deleted: true } : comment
                        )
                    );
                    toast.success("Bình luận đã được xóa thành công", {
                        position: "top-right",
                        autoClose: 2000,

                    });

                } else {
                    return response.json().then((data) => {
                        throw new Error(data.message || "Có lỗi xảy ra khi ẩn bình luận");
                    });
                }
            })
            .catch((error) => {
                console.error("Error hiding comment:", error);
                toast.error(`Có lỗi xảy ra khi ẩn bình luận: ${error.message}`, {
                    position: "top-right",
                    autoClose: 3000,
                });
            });
    };

    const handleShow = async (id: number) => {
        let token = localStorage.getItem("authToken");

        if (isTokenExpired(token)) {
            token = await refresh();
            if (!token) {
                navigate("/dang-nhap");
                return;
            }
            localStorage.setItem("authToken", token);
        }

        fetch(`${ADMIN_SHOW_COMMENT}/${id}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => {
                if (response.ok) {
                    setComments((prevComments) =>
                        prevComments.map((comment) =>
                            comment.id === id ? { ...comment, deleted: false } : comment
                        )
                    );
                    toast.success("Bình luận đã được khôi phục thành công", {
                        position: "top-right",
                        autoClose: 2000,

                    });


                } else {
                    return response.json().then((data) => {
                        throw new Error(data.message || "Có lỗi xảy ra khi hiển thị bình luận");
                    });
                }
            })
            .catch((error) => {
                console.error("Error showing comment:", error);
                toast.error(`Có lỗi xảy ra khi hiển thị bình luận: ${error.message}`, {
                    position: "top-right",
                    autoClose: 3000,
                });
            });
    };

    const handleUnActive = async (id: number) => {
        let token = localStorage.getItem("authToken");

        if (isTokenExpired(token)) {
            token = await refresh();
            if (!token) {
                navigate("/dang-nhap");
                return;
            }
            localStorage.setItem("authToken", token);
        }

        fetch(`${ADMIN_UNACTIVE_COMNENT}/${id}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => {
                if (response.ok) {
                    setComments((prevComments) =>
                        prevComments.map((comment) =>
                            comment.id === id ? { ...comment, approved: false } : comment
                        )
                    );
                    toast.success("Bình luận đã được tắt thành công", {
                        position: "top-right",
                        autoClose: 2000,

                    });

                } else {
                    return response.json().then((data) => {
                        throw new Error(data.message || "Có lỗi xảy ra khi tắt bình luận");
                    });
                }
            })
            .catch((error) => {
                console.error("Error tắt comment:", error);
                toast.error(`Có lỗi xảy ra khi tắt bình luận: ${error.message}`, {
                    position: "top-right",
                    autoClose: 3000,
                });
            });
    };

    const handleActive = async (id: number) => {
        let token = localStorage.getItem("authToken");

        if (isTokenExpired(token)) {
            token = await refresh();
            if (!token) {
                navigate("/dang-nhap");
                return;
            }
            localStorage.setItem("authToken", token);
        }

        fetch(`${ADMIN_ACTIVE_COMNENT}/${id}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => {
                if (response.ok) {
                    setComments((prevComments) =>
                        prevComments.map((comment) =>
                            comment.id === id ? { ...comment, approved: true } : comment
                        )
                    );
                    toast.success("Bình luận đã được duyệt thành công", {
                        position: "top-right",
                        autoClose: 2000,

                    });
                } else {
                    return response.json().then((data) => {
                        throw new Error(data.message || "Có lỗi xảy ra khi duyệt bình luận");
                    });
                }
            })
            .catch((error) => {
                console.error("Error duyệt comment:", error);
                toast.error(`Có lỗi xảy ra khi duyệt bình luận: ${error.message}`, {
                    position: "top-right",
                    autoClose: 3000,
                });
            });
    };

    // Sorting
    const handleSort = () => {
        const newSortDirection = sortDirection === "asc" ? "desc" : "asc";
        setSortDirection(newSortDirection);

        const sortedComments = [...comments].sort((a, b) => {
            if (a.createdAt < b.createdAt) return newSortDirection === "asc" ? -1 : 1;
            if (a.createdAt > b.createdAt) return newSortDirection === "asc" ? 1 : -1;
            return 0;
        });

        setComments(sortedComments);
    };

    // Pagination
    const handlePageChange = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Paper>
            <ToastContainer /> {/* Ensure ToastContainer is included */}
            <div className={styles.Container}>
                <h2 className={styles.title}>Danh Sách Bình Luận</h2>
                <div className={styles.headContainer}>
                    <TextField
                        className={styles.searchField}
                        label="Tìm kiếm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        variant="outlined"
                        size="small"
                    />
                </div>
                <Divider style={{ marginBottom: '20px' }} />
                <div className={styles.tableContainer}>
                    <Table className={styles.table} stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell className={styles.headerCell}>ID</TableCell>
                                <TableCell className={styles.headerCell}>Nội dung</TableCell>
                                <TableCell className={styles.headerCell}>Người dùng</TableCell>
                                <TableCell
                                    className={styles.headerCell}
                                    onClick={handleSort}
                                    style={{ cursor: "pointer" }}
                                >
                                    Thời gian {sortDirection === "asc" ? "↑" : "↓"}
                                </TableCell>
                                <TableCell className={styles.headerCell}>Trạng thái</TableCell>
                                <TableCell className={styles.headerCell}>Hành động</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {comments
                                .filter((c) => c.content.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map((comment) => (
                                    <TableRow key={comment.id}>
                                        <TableCell>{comment.id}</TableCell>
                                        <TableCell>{comment.content}</TableCell>
                                        <TableCell>{comment.username}</TableCell>
                                        <TableCell>
                                            {new Date(comment.createdAt).toLocaleString("vi-VN", {
                                                year: "numeric",
                                                month: "2-digit",
                                                day: "2-digit",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="contained"
                                                className={clsx({
                                                    [styles.buttonApproved]: comment.approved,
                                                    [styles.buttonUnapproved]: !comment.approved,
                                                })}
                                                onClick={() => {
                                                    if (comment.approved) {
                                                        handleUnActive(comment.id);
                                                    } else {
                                                        handleActive(comment.id);
                                                    }
                                                }}
                                            >
                                                {comment.approved ? "Ẩn" : "Hiển thị"}
                                            </Button>
                                        </TableCell>
                                        <TableCell>
                                            {comment.deleted ? (
                                                <IconButton onClick={() => handleShow(comment.id)}>
                                                    <ToggleOff />
                                                </IconButton>
                                            ) : (
                                                <IconButton onClick={() => handleHide(comment.id)}>
                                                    <ToggleOn />
                                                </IconButton>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>

                </div>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 20]}
                    component="div"
                    count={totalElements}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handleRowsPerPageChange}
                       labelRowsPerPage="Số hàng mỗi trang:"
                />
            </div>
        </Paper>
    );
};

export default CommentList;
