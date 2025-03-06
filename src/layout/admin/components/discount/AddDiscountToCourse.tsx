import React, { useState, useEffect } from "react";
import {
    TextField,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Button,
    TablePagination,
    Checkbox,
    Paper, Divider
} from "@material-ui/core";
import { useNavigate, useParams } from "react-router-dom";
import { ADMIN_COURSE_DISCOUNT, ADMIN_DISCOUNT_TO_COURSE, ADMIN_RESET_PRICE } from "../../../../api/api";
import { isTokenExpired } from "../../../util/fucntion/auth";
import useRefreshToken from "../../../util/fucntion/useRefreshToken";
import styles from './addDiscountToCourse.module.scss';
import classNames from 'classnames';
type Course = {
    id: number;
    coursesTitle: string;
    duration: string;
    price: number;
    cost: number;
};

const AddDiscountToCourse: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalElements, setTotalElements] = useState(0);
    const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
    const navigate = useNavigate();
    const refresh = useRefreshToken();

    // Lấy discountId từ URL
    const { discountId } = useParams<{ discountId: string }>();

    const fetchCourses = async () => {
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
            const response = await fetch(`${ADMIN_COURSE_DISCOUNT}?page=${page}&size=${rowsPerPage}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Error fetching courses");
            }

            const data = await response.json();
            const fetchedCourses: Course[] = data.content.map((course: any) => ({
                id: course.id,
                coursesTitle: course.coursesTitle,
                duration: course.duration,
                price: course.price,
                cost: course.cost,
            }));

            setCourses(fetchedCourses);
            setTotalElements(data.totalElements);
        } catch (error) {
            console.error("Error fetching courses:", error);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, [page, rowsPerPage, navigate]);

    const handlePageChange = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleCheckboxChange = (courseId: number) => {
        setSelectedCourses((prevSelected) =>
            prevSelected.includes(courseId)
                ? prevSelected.filter((id) => id !== courseId) // Bỏ chọn nếu đã chọn
                : [...prevSelected, courseId] // Thêm vào danh sách nếu chưa chọn
        );
    };

    const handleApplyDiscount = async () => {
        if (!discountId) {
            alert("Mã giảm giá không được cung cấp trong URL.");
            return;
        }

        if (selectedCourses.length === 0) {
            alert("Vui lòng chọn ít nhất một khóa học để áp dụng giảm giá.");
            return;
        }

        // Kiểm tra trạng thái áp dụng
        const coursesToApply = courses.filter((course) =>
            selectedCourses.includes(course.id) && course.price === course.cost
        );
        const alreadyAppliedCourses = courses.filter((course) =>
            selectedCourses.includes(course.id) && course.price !== course.cost
        );

        if (alreadyAppliedCourses.length > 0) {
            alert(
                `Một số khóa học đã được áp dụng giảm giá:\n` +
                alreadyAppliedCourses.map((course) => `- ${course.coursesTitle}`).join("\n") +
                `\nVui lòng tắt trạng thái áp dụng trước khi tiếp tục.`
            );
            return;
        }

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
            // Chuyển danh sách courseIds thành chuỗi (query string)
            const courseIdsParam = coursesToApply.map((course) => `courseIds=${course.id}`).join("&");
            const response = await fetch(
                `${ADMIN_DISCOUNT_TO_COURSE}/${discountId}?${courseIdsParam}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );

            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(`Lỗi từ server: ${errorMessage}`);
            }
            alert("Áp dụng giảm giá thành công");
            fetchCourses();
        } catch (error) {
            console.error("Error applying discounts:", error);
        }
    };
    const handleResetPrice = async (courseIds: number[]) => {
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
            // Chuyển danh sách ID thành query string
            const courseIdsParam = courseIds.map((id) => `courseIds=${id}`).join("&");

            const response = await fetch(`${ADMIN_RESET_PRICE}?${courseIdsParam}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(`Lỗi từ server: ${errorMessage}`);
            }
            alert(`Reset giá thành công cho các khóa học:`);
            fetchCourses();
        } catch (error) {
            console.error("Error resetting price:", error);
        }
    };
    return (
        <Paper>
            <div className={styles.Container}>
                <h2 className={styles.title}>Thêm Giảm Giá Cho Khóa Học</h2>
                <div className={styles.headContainer}>
                    <TextField
                        label="Tìm kiếm khóa học"
                        variant="outlined"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchField}
                        size="small"
                    />
                    <Button
                        className="btn btn-danger white-btn"
                        onClick={async () => {
                            const coursesToReset = courses
                                .filter((course) => selectedCourses.includes(course.id) && course.price !== course.cost)
                                .map((course) => course.id);
                            if (coursesToReset.length === 0) {
                                alert("Không có khóa học nào để reset giá.");
                                return;
                            }
                            await handleResetPrice(coursesToReset);
                        }}
                    >
                        Reset
                    </Button>
                    <Button
                        className={classNames('btn', 'btn-primary', styles.whiteBtn)}
                        variant="contained"
                        onClick={handleApplyDiscount}
                    >
                        Áp dụng
                    </Button>
                </div>
                <Divider style={{ marginBottom: '20px' }} />
                <div className={styles.tableContainer}>
                    <Table className={styles.table}>
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    <Checkbox
                                        indeterminate={
                                            selectedCourses.length > 0 &&
                                            selectedCourses.length < courses.length
                                        }
                                        checked={selectedCourses.length === courses.length}
                                        onChange={(e) =>
                                            setSelectedCourses(
                                                e.target.checked ? courses.map((c) => c.id) : []
                                            )
                                        }
                                    />
                                </TableCell>
                                <TableCell>ID</TableCell>
                                <TableCell>Tên khóa học</TableCell>
                                <TableCell>Thời lượng</TableCell>
                                <TableCell>Giá</TableCell>
                                <TableCell>Chi phí gốc</TableCell>
                                <TableCell>Trạng thái</TableCell> {/* Thêm cột trạng thái */}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {courses
                                .filter((c) =>
                                    c.coursesTitle.toLowerCase().includes(searchTerm.toLowerCase())
                                )
                                .map((course) => (
                                    <TableRow key={course.id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedCourses.includes(course.id)}
                                                onChange={() => handleCheckboxChange(course.id)}
                                            />
                                        </TableCell>
                                        <TableCell>{course.id}</TableCell>
                                        <TableCell>{course.coursesTitle}</TableCell>
                                        <TableCell>{course.duration}</TableCell>
                                        <TableCell>
                                            {course.price !== undefined
                                                ? course.price.toLocaleString("vi-VN")
                                                : "N/A"}{" "}
                                            VND
                                        </TableCell>
                                        <TableCell>
                                            {course.cost !== undefined
                                                ? course.cost.toLocaleString("vi-VN")
                                                : "N/A"}{" "}
                                            VND
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="contained"
                                                className="btn btn-danger white-btn"
                                                style={{
                                                    backgroundColor: course.price === course.cost ? "red" : "green",
                                                    color: "white",
                                                }}
                                                onClick={async () => {
                                                    if (course.price !== course.cost) {
                                                        await handleResetPrice([course.id]); // Reset giá cho khóa học cụ thể
                                                    }
                                                }}
                                                disabled={course.price === course.cost} // Chỉ bật nút nếu đã áp dụng
                                            >
                                                {course.price === course.cost ? "Chưa áp dụng" : "Đã áp dụng"}
                                            </Button>
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
                />
            </div>
        </Paper>
    );
};

export default AddDiscountToCourse;
