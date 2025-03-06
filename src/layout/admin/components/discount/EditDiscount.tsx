// EditDiscount.tsx

import React, { useState, useEffect } from "react";
import {
    TextField,
    Button,
    Typography,
    Box,
    Paper,
    Divider,
} from "@mui/material"; // Đổi từ @material-ui/core sang @mui/material
import { useNavigate, useParams } from "react-router-dom";
import { ADMIN_GET_DISCOUNT_BY_ID, ADMIN_EDIT_DISCOUNT } from "../../../../api/api"; // Đảm bảo đường dẫn API chính xác
import { isTokenExpired } from "../../../util/fucntion/auth";
import useRefreshToken from "../../../util/fucntion/useRefreshToken";
import styles from "./editDiscount.module.scss"; // Import SCSS Module
import classNames from 'classnames';

const EditDiscount: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // Lấy ID từ URL
    const [description, setDescription] = useState("");
    const [discountValue, setDiscountValue] = useState<string | number>("");
    const [title, setTitle] = useState(""); // Tiêu đề khuyến mãi
    const [startDate, setStartDate] = useState(""); // Ngày bắt đầu
    const [endDate, setEndDate] = useState(""); // Ngày kết thúc

    const navigate = useNavigate();
    const refresh = useRefreshToken();

    // Fetch dữ liệu khuyến mãi theo ID
    useEffect(() => {
        const fetchDiscount = async () => {
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
                const response = await fetch(`${ADMIN_GET_DISCOUNT_BY_ID}/${id}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                // Cập nhật trạng thái với dữ liệu nhận được từ API
                setDescription(data.description);
                setDiscountValue(data.discountValue); // Sử dụng đúng tên trường dữ liệu
                setTitle(data.title);
                setStartDate(data.startDate.split("T")[0]); // Chuyển về định dạng "YYYY-MM-DD"
                setEndDate(data.endDate.split("T")[0]); // Chuyển về định dạng "YYYY-MM-DD"
            } catch (error) {
                console.error("Error fetching discount:", error);
                alert("Không thể lấy thông tin khuyến mãi."); // Giữ nguyên alert như mã gốc
            }
        };

        fetchDiscount();
    }, [id, navigate]);

    // Xử lý khi nhập discountValue
    const handleDiscountValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(event.target.value);
        setDiscountValue(isNaN(value) ? 0 : value); // Default to 0 if the input is invalid
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        let token = localStorage.getItem("authToken");
        if (isTokenExpired(token)) {
            token = await refresh();
            if (!token) {
                navigate("/dang-nhap");
                return;
            }
            localStorage.setItem("authToken", token);
        }
        // Validate inputs
        if (!title || !description || !discountValue || !startDate || !endDate) {
            alert("Vui lòng điền đầy đủ thông tin!"); // Giữ nguyên alert như mã gốc
            return;
        }

        const parsedDiscountValue = parseFloat(discountValue.toString());
        if (isNaN(parsedDiscountValue) || parsedDiscountValue <= 0) {
            alert("Giá trị giảm giá phải lớn hơn 0."); // Giữ nguyên alert như mã gốc
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            alert("Ngày bắt đầu phải trước ngày kết thúc."); // Giữ nguyên alert như mã gốc
            return;
        }

        const updatedDiscount = {
            title,  // Tên khuyến mãi
            description,  // Mô tả khuyến mãi
            discount_value: parsedDiscountValue,  // Giá trị giảm giá (số thập phân)
            start_date: new Date(startDate).toISOString(),  // Định dạng ngày ISO 8601
            end_date: new Date(endDate).toISOString(),  // Định dạng ngày ISO 8601
        };

        // Gửi yêu cầu PUT đến API
        fetch(`${ADMIN_EDIT_DISCOUNT}/${id}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedDiscount),
        })
            .then(async (response) => {
                if (!response.ok) {
                    // Xử lý lỗi từ API
                    const errorData = await response.json();
                    alert(`Có lỗi xảy ra: ${errorData.message || "Không thể cập nhật khuyến mãi."}`);
                } else {
                    alert("Chỉnh sửa khuyến mãi thành công!");
                    navigate("/admin/discount"); // Điều hướng về trang danh sách giảm giá
                }
            })
            .catch((error) => {
                console.error("Error updating discount:", error);
                alert("Có lỗi xảy ra khi chỉnh sửa khuyến mãi.");
            });
    };

    return (
        <div className={styles.container}>
            <Paper elevation={3} className={styles.paper}>
                <Typography variant="h5" component="h2" className={styles.header}>
                    Chỉnh Sửa Khuyến Mãi
                </Typography>
                <Divider className={styles.divider} />
                <Box component="form" onSubmit={handleSubmit} className={styles.formContainer}>
                    <TextField
                        fullWidth
                        label="Tiêu đề"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        variant="outlined"
                        required
                        className={styles.textField}
                    />
                    <TextField
                        fullWidth
                        label="Mô tả"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        variant="outlined"
                        required
                        multiline
                        rows={4}
                        className={styles.textField}
                    />
                    <TextField
                        fullWidth
                        label="Giá trị giảm giá"
                        type="number"
                        value={discountValue}
                        onChange={handleDiscountValueChange}
                        variant="outlined"
                        required
                        inputProps={{ step: "0.01" }} // Cho phép nhập số thập phân
                        className={styles.textField}
                    />
                    <TextField
                        fullWidth
                        label="Ngày bắt đầu"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        variant="outlined"
                        required
                        InputLabelProps={{
                            shrink: true,
                        }}
                        className={styles.textField}
                    />
                    <TextField
                        fullWidth
                        label="Ngày kết thúc"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        variant="outlined"
                        required
                        InputLabelProps={{
                            shrink: true,
                        }}
                        className={styles.textField}
                    />
                    <Box className={styles.buttonContainer}>
                        <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                            className={classNames(styles.button, styles.buttonPrimary)}
                            disabled={
                                !title ||
                                !description ||
                                !discountValue ||
                                !startDate ||
                                !endDate
                            }
                        >
                            Cập nhật giảm giá
                        </Button>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => navigate("/admin/discount")}
                            className={classNames(styles.button, styles.buttonSecondary)}
                        >
                            Hủy
                        </Button>

                    </Box>
                </Box>
            </Paper>
        </div>
    );
};

export default EditDiscount;
