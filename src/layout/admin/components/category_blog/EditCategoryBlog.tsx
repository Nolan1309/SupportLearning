// EditCategoryBlog.tsx

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
import styles from './edit_category_blog.module.scss'; // Import SCSS Module
import { ADMIN_GET_ONE_CATEGORY_BLOG, ADMIN_UPDATE_CATEGORY_BLOG } from '../../../../api/api'; // Import API endpoints
import RequireAdmin from "../../../DOM/RequireAdmin";
import { toast, ToastContainer } from 'react-toastify'; // Import react-toastify để hiển thị thông báo
import 'react-toastify/dist/ReactToastify.css'; // Import CSS của react-toastify

const EditCategoryBlog: React.FC = () => {
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
                const response = await fetch(`${ADMIN_GET_ONE_CATEGORY_BLOG}/${id}`, {
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
                        setDescription(data.description);
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
        if (!name.trim() || !description.trim()) {
            setFormError('Tiêu đề và Mô tả không được để trống.');
            toast.error('Tiêu đề và Mô tả không được để trống.', {
                position: 'top-right',
                autoClose: 3000,
            });
            return;
        }

        setLoading(true);
        setError(null); // Reset error

        try {
            const response = await fetch(`${ADMIN_UPDATE_CATEGORY_BLOG}/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, description }),
            });

            if (response.ok) {
                toast.success('Danh mục blog đã được cập nhật thành công!', {
                    position: 'top-right',
                    autoClose: 3000,
                });
                navigate('/admin/category-blog');
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
        navigate('/admin/category-blog'); // Quay lại trang danh sách danh mục blog
    };

    return (
        <div className={styles.container}>
            <Paper className={styles.paper}>
                <Typography variant="h4" className={styles.headerBold}>
                    Chỉnh sửa Danh Mục Blog
                </Typography>
                <Divider sx={{ marginBottom: '20px' }} />
                {error && <Alert severity="error" className={styles.errorMessage}>{error}</Alert>}
                {formError && <Alert severity="error" className={styles.errorMessage}>{formError}</Alert>}
                <Box component="form" onSubmit={handleSubmit} className={styles.formContainer}>
                    <TextField
                        label="Tiêu đề"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        variant="outlined"
                        fullWidth
                        className={styles.textField}
                    />
                    <TextField
                        label="Mô tả"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={4}
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

export const RequestAdminURL = RequireAdmin(EditCategoryBlog);

export default EditCategoryBlog;
