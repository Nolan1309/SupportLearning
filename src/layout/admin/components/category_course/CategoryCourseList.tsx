import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TextField,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    IconButton,
    Button,
    Paper,
    Divider,
    Typography
} from '@material-ui/core';
import { Edit, Delete, Add } from '@material-ui/icons';
import styles from './category_course.module.scss'; // Import SCSS Module
import classNames from 'classnames';
import { ADMIN_GET_CATEGORY_COURSE, ADMIN_DELETE_CATEGORY_COURSE } from '../../../../api/api'; // Update with correct API endpoints
import RequireAdmin from "../../../DOM/RequireAdmin";

interface CategoryCourse {
    id: number;
    name: string;
}

const CategoryCourseList: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryCourses, setCategoryCourses] = useState<CategoryCourse[]>([]);
    const [hiddenCategoryCourses, setHiddenCategoryCourses] = useState<Set<number>>(new Set());
    const navigate = useNavigate();

    const token = localStorage.getItem('authToken');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(ADMIN_GET_CATEGORY_COURSE, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    const categories: CategoryCourse[] = data._embedded.courseCategories;
                    setCategoryCourses(categories);
                } else {
                    console.error('Failed to fetch categories');
                    setCategoryCourses([]);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
                setCategoryCourses([]);
            }
        };

        fetchCategories();
    }, [token]);

    const handleDelete = async (id: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa danh mục khóa học này không?')) {
            try {
                const response = await fetch(ADMIN_DELETE_CATEGORY_COURSE(id), {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    // Xóa thành công, cập nhật danh sách
                    setCategoryCourses(prevCourses => prevCourses.filter(course => course.id !== id));
                } else {
                    console.error('Failed to delete category');
                }
            } catch (error) {
                console.error('Error deleting category:', error);
            }
        }
    };

    const handleHide = (id: number) => {
        setHiddenCategoryCourses(prev => new Set(prev).add(id));
    };

    const handleShow = (id: number) => {
        setHiddenCategoryCourses(prev => {
            const newHiddenFields = new Set(prev);
            newHiddenFields.delete(id);
            return newHiddenFields;
        });
    };

    const handleAddCourseClick = () => {
        navigate('/admin/add-category-course'); // Update route as needed
    };

    const handleEditClick = (id: number) => {
        navigate(`/admin/edit-category-course/${id}`);
    };

    // Lọc danh sách dựa trên searchTerm và trạng thái ẩn
    const filteredCategoryCourses = categoryCourses.filter(categoryCourse =>
        categoryCourse.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !hiddenCategoryCourses.has(categoryCourse.id)
    );

    return (
        <div className={styles.courseCategoryListContainer}>
            <Paper className={styles.paper}>
                <Typography variant="h2" className={styles.headerBold}>
                    Danh Sách Danh Mục Khóa Học
                </Typography>
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
                        className={classNames('btn', 'btn-primary', styles.whiteBtn)}
                        variant="contained"
                        color="primary"
                        startIcon={<Add />}
                        onClick={handleAddCourseClick}
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
                                <TableCell className={styles.headerCell}>Hành động</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredCategoryCourses.map((categoryCourse) => (
                                <TableRow key={categoryCourse.id}>
                                    <TableCell>{categoryCourse.id}</TableCell>
                                    <TableCell className={styles.tableCell}>{categoryCourse.name}</TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleEditClick(categoryCourse.id)}>
                                            <Edit />
                                        </IconButton>
                                        <IconButton onClick={() => handleDelete(categoryCourse.id)}>
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Paper>
        </div>
    );
};

export const RequestAdminURL = RequireAdmin(CategoryCourseList);
export default CategoryCourseList;
