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
  Paper,
  Divider,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  MenuItem,
} from "@material-ui/core";
import { Edit, Add } from "@material-ui/icons"; // Chỉ giữ lại biểu tượng Edit
import { useNavigate } from "react-router-dom"; // Import useNavigate
import styles from "./fieldList.module.scss"; // Import SCSS Module
import classNames from "classnames";
import {
  ADMIN_CATEGORY_GET_LEVEL1,
  ADMIN_DELETE_CATEGORY_COURSE,
} from "../../../../../api/api"; // Update với các API endpoints chính xác
import RequireAdmin from "../../../../DOM/RequireAdmin";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface CategoryLevel {
  id: number;
  name: string;
  category: string | null;
  level: number;
  type: string;
}

const FieldList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [fields, setFields] = useState<CategoryLevel[]>([]); // Initialize with an empty array for fields
  const [hiddenFields, setHiddenFields] = useState<Set<number>>(new Set());
  const [showDialog, setShowDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const navigate = useNavigate();
  const [typeFilter, setTypeFilter] = useState("");
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(ADMIN_CATEGORY_GET_LEVEL1, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data: CategoryLevel[] = await response.json();
          setFields(data);
        } else {
          console.error("Failed to fetch categories");
          setFields([]);
          toast.error("Không thể tải danh mục lĩnh vực.", {
            position: "top-right",
            autoClose: 3000,
          });
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setFields([]);
        toast.error("Có lỗi xảy ra khi tải danh mục lĩnh vực.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    };

    fetchCategories();
  }, [token]);

  const handleEditClick = (id: number) => {
    navigate(`/admin/edit-category-field/${id}`); // Navigate to the EditField page with the field ID
  };

  const handleAddFieldClick = () => {
    navigate("/admin/add-category-field"); // Navigate to the AddField page
  };

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setShowDialog(true);
  };

  const confirmDelete = async () => {
    if (deleteId === null) return;

    setIsDeleting(true);

    try {
      const response = await fetch(
        ADMIN_DELETE_CATEGORY_COURSE(deleteId),
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        // Xóa thành công, cập nhật danh sách
        setFields((prevFields) =>
          prevFields.filter((field) => field.id !== deleteId)
        );
        toast.success("Xóa lĩnh vực thành công!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        console.error("Failed to delete category");
        toast.error("Không thể xóa lĩnh vực này.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Có lỗi xảy ra khi xóa lĩnh vực.", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsDeleting(false);
      setShowDialog(false);
      setDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setShowDialog(false);
    setDeleteId(null);
  };

  // Lọc danh sách dựa trên searchTerm và trạng thái ẩn
  const filteredFields = fields.filter(
    (field) =>
      field.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (typeFilter === "" || field.type === typeFilter) && // Lọc theo typeFilter
      !hiddenFields.has(field.id)
  );

  return (
    <div className={styles.fieldListContainer}>
      <Paper className={styles.paper}>
        <Typography variant="h2" className={styles.headerBold}>
          Danh Sách Lĩnh Vực
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
            startIcon={<Add />}
            className={classNames("btn", "btn-primary", styles.whiteBtn)}
            variant="contained"
            color="primary"
            onClick={handleAddFieldClick}
          >
            Thêm
          </Button>
        </div>

        <Divider style={{ marginBottom: "20px" }} />
        <div className={styles.tableContainer}>
          <Table className={styles.table} stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell className={styles.headerCell}>STT</TableCell>
                <TableCell className={styles.headerCell}>Tiêu đề</TableCell>
                <TableCell className={styles.headerCell}>Mã code</TableCell>
                <TableCell className={styles.headerCell}>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredFields.map((field, index) => (
                <TableRow key={field.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className={styles.tableCell}>
                    {field.name}
                  </TableCell>
                  <TableCell className={styles.tableCell}>
                    {field.type}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditClick(field.id)}>
                      <Edit />
                    </IconButton>
                    {/* Nếu bạn muốn thêm các hành động khác, ví dụ như xóa, bạn có thể thêm chúng ở đây */}
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
              Bạn có chắc chắn muốn xóa lĩnh vực này không? Hành động này không
              thể hoàn tác.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={cancelDelete} color="secondary">
              Hủy
            </Button>
            <Button
              onClick={confirmDelete}
              color="primary"
              disabled={isDeleting}
            >
              {isDeleting ? "Đang xóa..." : "Xác nhận"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Toast Notifications */}
        <ToastContainer />
      </Paper>
    </div>
  );
};

export const RequestAdminURL = RequireAdmin(FieldList);

export default FieldList;
