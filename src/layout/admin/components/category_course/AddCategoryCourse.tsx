// AddCategoryCourse.tsx

import React, { useState } from 'react';
import {
    TextField,
    Button,
    Paper,
    Typography,
    Divider,
    Box,
    Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import styles from './add_category_course.module.scss'; // Import SCSS Module
import { ADMIN_POST_CATEGORY_COURSE } from '../../../../api/api'; // Import API endpoint
import RequireAdmin from "../../../DOM/RequireAdmin";
import { toast, ToastContainer } from 'react-toastify'; // Import react-toastify để hiển thị thông báo
import 'react-toastify/dist/ReactToastify.css'; // Import CSS của react-toastify

const AddCategoryCourse: React.FC = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState<string | null>(null); // State to handle errors
    const [success, setSuccess] = useState<boolean>(false); // State to handle success message
    const navigate = useNavigate();
    const token = localStorage.getItem('authToken'); // Get auth token from local storage

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Validate input
        if (!name.trim()) {
            setError('Tên danh mục không được để trống.');
            toast.error('Tên danh mục không được để trống.', {
                position: 'top-right',
                autoClose: 3000,
            });
            return;
        }

        // Nếu bạn muốn kiểm tra mô tả, bạn có thể thêm điều kiện tương tự
        // if (!description.trim()) {
        //     setError('Mô tả không được để trống.');
        //     toast.error('Mô tả không được để trống.', {
        //         position: 'top-right',
        //         autoClose: 3000,
        //     });
        //     return;
        // }

        setError(null); // Reset error
        setSuccess(false); // Reset success state

        try {
            const response = await fetch(ADMIN_POST_CATEGORY_COURSE, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`, // Pass the token for authorization
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, description }), // Send data as JSON
            });

            if (response.ok) {
                setSuccess(true); // Set success state
                setName(''); // Reset name field
                setDescription(''); // Reset description field
                toast.success('Danh mục khóa học đã được thêm thành công!', {
                    position: 'top-right',
                    autoClose: 3000,
                });
                navigate('/admin/category-course');
            } else {
                const data = await response.json();
                // setError(data.message || 'Failed to save course category.');
                toast.error('Vui lòng thử lại sau !', {
                    position: 'top-right',
                    autoClose: 3000,
                });
            }
        } catch (error) {         
            setError('Có lỗi xảy ra khi lưu danh mục khóa học.');
            toast.error('Có lỗi xảy ra khi lưu danh mục khóa học.', {
                position: 'top-right',
                autoClose: 3000,
            });
        }
    };

    const handleCancel = () => {
        navigate('/admin/category-course'); // Quay lại trang danh sách danh mục khóa học
    };

    return (
        <div className={styles.container}>
            <Paper className={styles.paper}>
                <Typography variant="h4" className={styles.headerBold}>
                    Thêm Danh Mục Khóa Học
                </Typography>
                <Divider sx={{ marginBottom: '20px' }} />
                {error && <Alert severity="error" className={styles.errorMessage}>{error}</Alert>}
                {success && <Alert severity="success" className={styles.successMessage}>Danh mục khóa học đã được thêm thành công!</Alert>}
                <Box component="form" onSubmit={handleSave} className={styles.formContainer}>
                    <TextField
                        label="Tên Danh Mục"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        variant="outlined"
                        fullWidth
                        required
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
                            type="submit"
                            variant="contained"
                            color="primary"
                            className={styles.button}
                        >
                            Thêm Danh Mục
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

export const RequestAdminURL = RequireAdmin(AddCategoryCourse);

export default AddCategoryCourse;
