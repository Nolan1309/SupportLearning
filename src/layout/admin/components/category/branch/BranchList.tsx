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
import { Edit, Delete, Add } from "@material-ui/icons"; // Chỉ giữ lại biểu tượng Edit và Delete
import { useNavigate } from "react-router-dom"; // Import useNavigate để điều hướng
import styles from "./branchList.module.scss"; // Import SCSS Module
import classNames from "classnames";
import {
  ADMIN_CATEGORY_GET_LEVEL2,
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

const BranchList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [branches, setBranches] = useState<CategoryLevel[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const navigate = useNavigate(); // Khởi tạo navigate
  const [typeFilter, setTypeFilter] = useState("");
  const token = localStorage.getItem("authToken");
  const [hiddenFields, setHiddenFields] = useState<Set<number>>(new Set());
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(ADMIN_CATEGORY_GET_LEVEL2, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setBranches(data);
        } else {
          console.error("Failed to fetch categories");
          setBranches([]);
          toast.error("Không thể tải danh mục ngành.", {
            position: "top-right",
            autoClose: 3000,
          });
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setBranches([]);
        toast.error("Có lỗi xảy ra khi tải danh mục ngành.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    };

    fetchCategories();
  }, [token]);

  const handleAddBranchClick = () => {
    navigate("/admin/add-category-branch"); // Điều hướng đến trang thêm ngành
  };

  const handleEditClick = (id: number) => {
    navigate(`/admin/edit-category-branch/${id}`); // Điều hướng đến trang sửa ngành với ID cụ thể
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
        setBranches((prevBranches) =>
          prevBranches.filter((branch) => branch.id !== deleteId)
        );
        toast.success("Xóa ngành thành công!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        console.error("Failed to delete category");
        toast.error("Không thể xóa ngành này.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Có lỗi xảy ra khi xóa ngành.", {
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
  const filteredBranchs = branches.filter(
    (branche) =>
      branche.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (typeFilter === "" || branche.type === typeFilter) && // Lọc theo typeFilter
      !hiddenFields.has(branche.id)
  );
  return (
    <div className={styles.branchListContainer}>
      <Paper className={styles.paper}>
        <Typography variant="h2" className={styles.headerBold}>
          Danh Sách Ngành
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
            onClick={handleAddBranchClick} // Điều hướng đến trang thêm ngành
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
              {filteredBranchs
                .filter((branch) =>
                  branch.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((branch, index) => (
                  <TableRow key={branch.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className={styles.tableCell}>
                      {branch.name}
                    </TableCell>
                    <TableCell className={styles.tableCell}>
                      {branch.type}
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditClick(branch.id)}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteClick(branch.id)}>
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
              Bạn có chắc chắn muốn xóa ngành này không? Hành động này không thể
              hoàn tác.
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

export const RequestAdminURL = RequireAdmin(BranchList);
export default BranchList;
