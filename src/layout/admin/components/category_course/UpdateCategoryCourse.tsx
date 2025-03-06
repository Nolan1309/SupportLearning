// UpdateCategoryCourse.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    TextField,
    Button,
    CircularProgress,
    Paper,
    Typography,
    Divider,
    Box,
    Alert
} from '@mui/material';
import styles from './edit_category_course.module.scss'; // Import SCSS Module
import { ADMIN_GET_CATEGORY_COURSE, ADMIN_UPDATE_CATEGORY_COURSE } from '../../../../api/api'; // Import API endpoints
import RequireAdmin from "../../../DOM/RequireAdmin";
import { toast, ToastContainer } from 'react-toastify'; // Import react-toastify để hiển thị thông báo
import 'react-toastify/dist/ReactToastify.css'; // Import CSS của react-toastify

const UpdateCategoryCourse: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null); // State to handle form validation errors
    const navigate = useNavigate();
    const token = localStorage.getItem('authToken'); // Get auth token from local storage

    useEffect(() => {
        const fetchCategory = async () => {
            if (!id) {
                setError('ID không hợp lệ.');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${ADMIN_GET_CATEGORY_COURSE}/${id}`, { // Update to the correct GET API for fetching a course category
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data) {
                        setName(data.name);
                        setDescription(data.description); // Ensure the fetched data has a description field
                    } else {
                        setError('Không tìm thấy dữ liệu danh mục.');
                    }
                } else {
                    const data = await response.json();
                    setError(data.message || 'Không thể tải danh mục.');
                }
            } catch (error) {
                console.error('Error fetching category:', error);
                setError('Có lỗi xảy ra khi tải danh mục.');
            } finally {
                setLoading(false);
            }
        };

        fetchCategory();
    }, [id, token]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormError(null); // Reset form error

        // Validate form fields
        if (!name.trim()) {
            setFormError('Tiêu đề không được để trống.');
            toast.error('Tiêu đề không được để trống.', {
                position: 'top-right',
                autoClose: 3000,
            });
            return;
        }

        setLoading(true);
        setError(null); // Reset error

        try {
            const response = await fetch(`${ADMIN_UPDATE_CATEGORY_COURSE}/${id}`, { // Update to the correct PUT API for updating a course category
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, description }), // Include description if needed
            });

            if (response.ok) {
                toast.success('Danh mục khóa học đã được cập nhật thành công!', {
                    position: 'top-right',
                    autoClose: 3000,
                });
                navigate('/admin/category-course'); // Update with the correct route to view the course categories list
            } else {
                const data = await response.json();
                setError(data.message || 'Không thể cập nhật danh mục.');
                toast.error(data.message || 'Không thể cập nhật danh mục.', {
                    position: 'top-right',
                    autoClose: 3000,
                });
            }
        } catch (error) {
            console.error('Error updating category:', error);
            setError('Có lỗi xảy ra khi cập nhật danh mục.');
            toast.error('Có lỗi xảy ra khi cập nhật danh mục.', {
                position: 'top-right',
                autoClose: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/admin/category-course'); // Quay lại trang danh sách danh mục khóa học
    };

    return (
        <div className={styles.container}>
            <Paper className={styles.paper}>
                <Typography variant="h4" className={styles.headerBold}>
                    Chỉnh sửa Danh Mục Khóa Học
                </Typography>
                <Divider sx={{ marginBottom: '20px' }} />
                {error && <Alert severity="error" className={styles.errorMessage}>{error}</Alert>}
                {formError && <Alert severity="error" className={styles.errorMessage}>{formError}</Alert>} {/* Display form validation error */}
                <Box component="form" onSubmit={handleSubmit} className={styles.formContainer}>
                    <TextField
                        label="Tiêu đề"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        variant="outlined"
                        fullWidth
                        className={styles.textField}
                    />

                    <Box className={styles.buttonContainer}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={loading}
                            className={styles.button}
                        >
                            Lưu
                        </Button>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={handleCancel}
                            className={styles.button}
                        >
                            Hủy
                        </Button>
                    </Box>
                </Box>
            </Paper>
            {/* Toast Notifications */}
            <ToastContainer />
        </div>
    );
};

export const RequestAdminURL = RequireAdmin(UpdateCategoryCourse);

export default UpdateCategoryCourse;
