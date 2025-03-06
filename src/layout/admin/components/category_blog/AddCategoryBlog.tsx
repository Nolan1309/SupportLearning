// AddCategoryBlog.tsx

import React, { useState } from 'react';
import { TextField, Button, Paper, Typography, Divider, Box, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import styles from './add_category_blog.module.scss'; // Import SCSS Module
import { ADMIN_POST_CATEGORY_BLOG } from '../../../../api/api'; // Import API endpoint
import RequireAdmin from "../../../DOM/RequireAdmin";
import { toast, ToastContainer } from 'react-toastify'; // Import react-toastify để hiển thị thông báo
import 'react-toastify/dist/ReactToastify.css'; // Import CSS của react-toastify

const AddCategoryBlog: React.FC = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState<string | null>(null); // State to handle errors
    const [success, setSuccess] = useState<boolean>(false); // State to handle success message
    const navigate = useNavigate();
    const token = localStorage.getItem('authToken'); // Get auth token from local storage

    const handleSave = async () => {
        // Validate input
        if (!name.trim()) {
            setError('Tên danh mục không được để trống.');
            toast.error('Tên danh mục không được để trống.', {
                position: 'top-right',
                autoClose: 3000,
            });
            return;
        }

        if (!description.trim()) {
            setError('Mô tả không được để trống.');
            toast.error('Mô tả không được để trống.', {
                position: 'top-right',
                autoClose: 3000,
            });
            return;
        }

        setError(null); // Reset error
        setSuccess(false); // Reset success state

        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/blog-category`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, description }),
            });

            if (response.ok) {
                setSuccess(true); // Set success state
                setName(''); // Reset name field
                setDescription(''); // Reset description field
                toast.success('Danh mục blog đã được thêm thành công!', {
                    position: 'top-right',
                    autoClose: 3000,
                });
                navigate('/admin/category-blog');
            }
            else {
                const data = await response.json();
                setError(data.message || 'Failed to save category blog.');
                toast.error(data.message || 'Failed to save category blog.', {
                    position: 'top-right',
                    autoClose: 3000,
                });
            }
        } catch (error) {
            console.error('Error saving category blog:', error);
            setError('Có lỗi xảy ra khi lưu danh mục blog.');
            toast.error('Có lỗi xảy ra khi lưu danh mục blog.', {
                position: 'top-right',
                autoClose: 3000,
            });
        }
    };

    return (
        <div className={styles.container}>
            <Paper className={styles.paper}>
                <Typography variant="h4" className={styles.headerBold}>
                    Thêm Danh Mục Blog
                </Typography>
                <Divider sx={{ marginBottom: '20px' }} />
                {error && <Alert severity="error" className={styles.errorMessage}>{error}</Alert>}
                {success && <Alert severity="success" className={styles.successMessage}>Danh mục blog đã được thêm thành công!</Alert>}
                <Box className={styles.formContainer}>
                    <TextField
                        label="Tên Danh Mục"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        variant="outlined"
                        fullWidth
                        className={styles.textField}
                    />
                    <TextField
                        label="Mô Tả"
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
                            variant="contained"
                            color="primary"
                            onClick={handleSave}
                            className={styles.button}
                        >
                            Thêm
                        </Button>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => navigate('/admin/category-blog')}
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

export const RequestAdminURL = RequireAdmin(AddCategoryBlog);

export default AddCategoryBlog;
