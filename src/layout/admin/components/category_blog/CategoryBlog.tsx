import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Button, Paper, Divider } from '@material-ui/core';
import { Edit, Delete, Add, VisibilityOff } from '@material-ui/icons';
import styles from './category_blog.module.scss'; // Import CSS file
import { ADMIN_GET_CATEGORY_BLOG, ADMIN_DELETE_CATEGORY_BLOG } from '../../../../api/api';
import RequireAdmin from "../../../DOM/RequireAdmin";
import classNames from 'classnames';
interface CategoryBlog {
    id: number;
    name: string;
    description: string;
}

const CategoryBlog: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryBlogs, setCategoryBlogs] = useState<CategoryBlog[]>([]); // Initialize with an empty array for categoryBlogs
    const [hiddenCategoryBlogs, setHiddenCategoryBlogs] = useState<Set<number>>(new Set());
    const navigate = useNavigate();

    const token = localStorage.getItem('authToken');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(ADMIN_GET_CATEGORY_BLOG, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    const categories = data._embedded.blogCategories;
                    setCategoryBlogs(categories);
                } else {
                    console.error('Failed to fetch categories');
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, [token]);

    const handleDelete = async (id: number, index: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này không?')) {
            try {
                const response = await fetch(ADMIN_DELETE_CATEGORY_BLOG(id), {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    // Xóa thành công, cập nhật danh sách
                    setCategoryBlogs(categoryBlogs.filter((_, i) => i !== index));
                } else {
                    console.error('Failed to delete category');
                }
            } catch (error) {
                console.error('Error deleting category:', error);
            }
        }
    };

    const handleHide = (id: number) => {
        setHiddenCategoryBlogs(prev => new Set(prev).add(id));
    };

    const handleShow = (id: number) => {
        setHiddenCategoryBlogs(prev => {
            const newHiddenFields = new Set(prev);
            newHiddenFields.delete(id);
            return newHiddenFields;
        });
    };

    const handleAddFieldClick = () => {
        navigate('/admin/upload-category-blog');
    };

    const handleEditClick = (id: number) => {
        navigate(`/admin/edit-category-blog/${id}`);
    };

    return (
        <Paper>
            <div className={styles.Container}>
                <h2 className={styles.title}>Danh Sách Danh Mục Blog</h2>
                <div className={styles.headContainer}>
                    <TextField
                        className={styles.searchField}
                        size="small"
                        label="Tìm kiếm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        variant="outlined"
                    />
                    <Button
                        startIcon={<Add />}
                        className={classNames('btn', 'btn-primary', styles.whiteBtn)}
                        variant="contained"
                        color="primary"
                        onClick={handleAddFieldClick}
                    >
                        Thêm
                    </Button>
                </div>
                <Divider style={{ marginBottom: '20px' }} />
                <div className={styles.tableContainer}>
                    <Table className={styles.table} stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell className={styles.headerCell}>ID</TableCell>
                                <TableCell className={styles.headerCell}>Tiêu đề</TableCell>
                                <TableCell className={styles.headerCell}>Mô tả</TableCell>
                                <TableCell className={styles.headerCell}>Hành động</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {categoryBlogs
                                .filter((categoryBlog) => categoryBlog.name.toLowerCase().includes(searchTerm.toLowerCase()) && !hiddenCategoryBlogs.has(categoryBlog.id))
                                .map((categoryBlog, index) => (
                                    <TableRow key={categoryBlog.id}>
                                        <TableCell>{categoryBlog.id}</TableCell>
                                        <TableCell>{categoryBlog.name}</TableCell>
                                        <TableCell>{categoryBlog.description}</TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => handleEditClick(categoryBlog.id)}><Edit /></IconButton>
                                            <IconButton onClick={() => handleDelete(categoryBlog.id, index)}><Delete /></IconButton>

                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </div>

            </div>
        </Paper>
    );
};
export const RequestAdminURL = RequireAdmin(CategoryBlog);
export default CategoryBlog;