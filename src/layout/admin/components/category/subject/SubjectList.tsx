import React, { useState, useEffect } from 'react';
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
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  MenuItem,
} from '@material-ui/core';
import { Edit, Delete, Visibility, VisibilityOff, Add } from '@material-ui/icons'; // Import các icon cần thiết
import { useNavigate } from 'react-router-dom'; // Import useNavigate để điều hướng
import styles from './subjectList.module.scss'; // Import SCSS Module
import classNames from 'classnames';
import { ADMIN_CATEGORY_GET_LEVEL3, ADMIN_DELETE_SUBJECT } from '../../../../../api/api'; // Cập nhật các API endpoints chính xác
import RequireAdmin from "../../../../DOM/RequireAdmin";
import { toast, ToastContainer } from 'react-toastify'; // Import react-toastify để hiển thị thông báo
import 'react-toastify/dist/ReactToastify.css'; // Import CSS của react-toastify

interface CategoryLevel {
  id: number;
  name: string;
  category: string | null;
  level: number;
  type:string;
}

const SubjectList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [subjects, setSubjects] = useState<CategoryLevel[]>([]); // Khởi tạo với một mảng rỗng cho subjects
  const [hiddenSubjects, setHiddenSubjects] = useState<Set<number>>(new Set());
  const [showDialog, setShowDialog] = useState(false); // State để quản lý Dialog xác nhận xóa
  const [isDeleting, setIsDeleting] = useState(false); // State để quản lý trạng thái xóa
  const [deleteId, setDeleteId] = useState<number | null>(null); // State để lưu ID của subject cần xóa
  const navigate = useNavigate(); // Hook để điều hướng
  const [typeFilter, setTypeFilter] = useState("");
  const token = localStorage.getItem('authToken'); // Lấy token từ localStorage

  useEffect(() => {
    // Fetch các subject từ API
    const fetchSubjects = async () => {
      try {
        const response = await fetch(ADMIN_CATEGORY_GET_LEVEL3, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data: CategoryLevel[] = await response.json();
          setSubjects(data);
        } else {
          console.error('Failed to fetch subjects');
          setSubjects([]);
          toast.error('Không thể tải danh mục môn học.', {
            position: 'top-right',
            autoClose: 3000,
          });
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
        setSubjects([]);
        toast.error('Có lỗi xảy ra khi tải danh mục môn học.', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    };

    fetchSubjects();
  }, [token]);

  // Xử lý khi nhấn nút xóa
  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setShowDialog(true);
  };

  // Xác nhận xóa
  const confirmDelete = async () => {
    if (deleteId === null) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`${ADMIN_DELETE_SUBJECT}/${deleteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Xóa thành công, cập nhật danh sách
        setSubjects(prevSubjects => prevSubjects.filter(subject => subject.id !== deleteId));
        toast.success('Xóa môn học thành công!', {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        const data = await response.json();
        toast.error(data.message || 'Không thể xóa môn học này.', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error('Error deleting subject:', error);
      toast.error('Có lỗi xảy ra khi xóa môn học.', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setIsDeleting(false);
      setShowDialog(false);
      setDeleteId(null);
    }
  };

  // Hủy xóa
  const cancelDelete = () => {
    setShowDialog(false);
    setDeleteId(null);
  };

  // Xử lý thêm môn học
  const handleAddSubjectClick = () => {
    navigate('/admin/add-category-subject'); // Điều hướng đến trang thêm môn học
  };

  // Xử lý chỉnh sửa môn học
  const handleEditSubjectClick = (id: number) => {
    navigate(`/admin/edit-category-subject/${id}`); // Điều hướng đến trang chỉnh sửa môn học với ID cụ thể
  };

  // Hàm để ẩn môn học (nếu cần)
  const handleHide = (id: number) => {
    setHiddenSubjects(prev => new Set(prev).add(id));
  };

  // Hàm để hiển thị lại môn học (nếu cần)
  const handleShow = (id: number) => {
    setHiddenSubjects(prev => {
      const newHiddenSubjects = new Set(prev);
      newHiddenSubjects.delete(id);
      return newHiddenSubjects;
    });
  };


  const filteredSubjects = subjects.filter(
    (subject) =>
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (typeFilter === "" || subject.type === typeFilter) && // Lọc theo typeFilter
      !hiddenSubjects.has(subject.id)
  );
  return (
    <div className={styles.subjectListContainer}>
      <Paper className={styles.paper}>
        <Typography variant="h2" className={styles.headerBold}>
          Danh Sách Môn Học
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
            <TextField
            select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            variant="outlined"
            size="small"
            className={styles.filterField}
            SelectProps={{
              displayEmpty: true,
            }}
          >
            <MenuItem value="">
              <em>Tất cả</em>
            </MenuItem>
            <MenuItem value="document">Document</MenuItem>
            <MenuItem value="course">Course</MenuItem>
            <MenuItem value="blog">Blog</MenuItem>
          </TextField>
          <Button
            className={classNames('btn', 'btn-primary', styles.whiteBtn)}
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={handleAddSubjectClick}
          >
            Thêm
          </Button>
        </div>
        <Divider style={{ marginBottom: '20px' }} />
        <div className={styles.tableContainer}>
          <Table className={styles.table} stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell className={styles.headerCell}>STT</TableCell>
                <TableCell
                  className={styles.headerCell}
                  style={{ cursor: 'pointer' }}
                >
                  Tiêu đề {/* Có thể thêm biểu tượng sắp xếp nếu cần */}
                </TableCell>
                <TableCell className={styles.headerCell}>Mã code</TableCell>
                <TableCell className={styles.headerCell}>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSubjects.map((subject, index) => (
                <TableRow key={subject.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className={styles.tableCell}>{subject.name}</TableCell>
                  <TableCell className={styles.tableCell}>{subject.type}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditSubjectClick(subject.id)}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteClick(subject.id)}>
                      <Delete />
                    </IconButton>

                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Dialog Xác Nhận Xóa */}
        <Dialog
          open={showDialog}
          onClose={cancelDelete}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
        >
          <DialogTitle id="delete-dialog-title">Xác Nhận Xóa</DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-dialog-description">
              Bạn có chắc chắn muốn xóa môn học này không? Hành động này không thể hoàn tác.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={cancelDelete} color="secondary">
              Hủy
            </Button>
            <Button onClick={confirmDelete} color="primary" disabled={isDeleting}>
              {isDeleting ? 'Đang xóa...' : 'Xác nhận'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Toast Notifications */}
        <ToastContainer />
      </Paper>
    </div>
  );
};

export const RequestAdminURL = RequireAdmin(SubjectList);

export default SubjectList;
