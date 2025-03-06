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
  TablePagination,
  Paper,
  Divider,
} from "@material-ui/core";
import classNames from "classnames";
import { Edit, Add, PlaylistAdd } from "@material-ui/icons";
import { useNavigate } from "react-router-dom";
import {
  ADMIN_GET_DISCOUNT,
  ADMIN_SHOW_DISCOUNT,
  ADMIN_HIDE_DISCOUNT,
} from "../../../../api/api";
import { isTokenExpired } from "../../../util/fucntion/auth";
import useRefreshToken from "../../../util/fucntion/useRefreshToken";
import { ToggleOff, ToggleOn } from "react-bootstrap-icons";
import styles from "./discoustList.module.scss";
import { toast, ToastContainer } from "react-toastify"; // Import react-toastify để hiển thị thông báo
import "react-toastify/dist/ReactToastify.css";
// Định nghĩa kiểu dữ liệu Discount
type Discount = {
  id: number;
  description: string;
  discountValue: number;
  title: string;
  isDeleted: boolean;
};

const DiscountList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const navigate = useNavigate();
  const refresh = useRefreshToken();

  // Fetch discounts từ API
  useEffect(() => {
    const fetchDiscounts = async () => {
      let token = localStorage.getItem("authToken");

      if (isTokenExpired(token)) {
        token = await refresh();
        if (!token) {
          navigate("/dang-nhap");
          return;
        }
        localStorage.setItem("authToken", token);
      }

      fetch(`${ADMIN_GET_DISCOUNT}?page=${page}&size=${rowsPerPage}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          // Map dữ liệu trả về từ API
          const fetchedDiscounts: Discount[] = data.content.map(
            (discount: any) => ({
              id: discount.id,
              description: discount.description,
              discountValue: discount.discountValue,
              title: discount.title,
              isDeleted: discount.isDeleted,
            })
          );

          setDiscounts(fetchedDiscounts); // Cập nhật danh sách giảm giá
          setTotalElements(data.totalElements); // Tổng số giảm giá
        })
        .catch((error) => console.error("Error fetching discounts:", error));
    };

    fetchDiscounts();
  }, [page, rowsPerPage, navigate]);

  // Sorting
  const handleSort = () => {
    const newSortDirection = sortDirection === "asc" ? "desc" : "asc";
    setSortDirection(newSortDirection);

    const sortedDiscounts = [...discounts].sort((a, b) => {
      if (a.title < b.title) return newSortDirection === "asc" ? -1 : 1;
      if (a.title > b.title) return newSortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setDiscounts(sortedDiscounts);
  };

  // Pagination
  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Điều hướng đến trang thêm mới
  const handleAddDiscount = () => {
    navigate("/admin/add-discount"); // Đường dẫn tới trang thêm mới khuyến mãi
  };
  const handleAddDiscountToCourse = (id: number) => {
    navigate(`/admin/add-discount-course/${id}`);
  };
  // Điều hướng đến trang chỉnh sửa
  const handleEditDiscount = (id: number) => {
    navigate(`/admin/edit-discount/${id}`); // Đường dẫn tới trang chỉnh sửa khuyến mãi
  };
  const handleHide = async (id: number) => {
    let token = localStorage.getItem("authToken");

    if (isTokenExpired(token)) {
      token = await refresh();
      if (!token) {
        navigate("/dang-nhap");
        return;
      }
      localStorage.setItem("authToken", token);
    }

    fetch(`${ADMIN_HIDE_DISCOUNT}/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          setDiscounts((prevDiscounts) =>
            prevDiscounts.map((discount) =>
              discount.id === id ? { ...discount, isDeleted: true } : discount
            )
          );
          toast.success("Khuyến mãi đã được xóa thành công");
        } else {
          toast.error("Có lỗi xảy ra khi xóa khuyến mãi");
        }
      })
      .catch((error) => {
        toast.error("Có lỗi xảy ra khi xóa khuyến mãi");
      });
  };
  const handleShow = async (id: number) => {
    let token = localStorage.getItem("authToken");

    if (isTokenExpired(token)) {
      token = await refresh();
      if (!token) {
        navigate("/dang-nhap");
        return;
      }
      localStorage.setItem("authToken", token);
    }

    fetch(`${ADMIN_SHOW_DISCOUNT}/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          setDiscounts((prevDiscounts) =>
            prevDiscounts.map((discount) =>
              discount.id === id ? { ...discount, isDeleted: false } : discount
            )
          );
          toast.success("Khuyến mãi đã được khôi phục thành công");
        } else {
          toast.error("Có lỗi xảy ra khi khôi phục khuyến mãi!");
        }
      })
      .catch((error) => {
        toast.error("Có lỗi xảy ra khi khôi phục khuyến mãi!");
      });
  };

  const handleAddClick = (discount: Discount) => {
    if (discount.isDeleted) {
      toast.error("Không thể thêm giảm giá khi đã bị xóa.");
      return; // Ngừng hành động nếu discount.isDeleted là true
    }
    handleAddDiscountToCourse(discount.id);
  };

  const handleEditClick = (discount: Discount) => {
    if (discount.isDeleted) {
      toast.error("Không thể chỉnh sửa khi giảm giá đã bị xóa.");
      return; // Ngừng hành động nếu discount.isDeleted là true
    }
    handleEditDiscount(discount.id);
  };
  return (
    <Paper>
      <div className={styles.discountListContainer}>
        <h2 className={styles.title}>Danh Sách Khuyến Mãi</h2>
        <div className={styles.headContainer}>
          <TextField
            className={styles.searchField}
            label="Tìm kiếm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            size="small"
          />
          <Button
            startIcon={<Add />}
            variant="contained"
            color="primary"
            className={classNames("btn", "btn-primary", styles.whiteBtn)}
            style={{ marginLeft: "1rem" }}
            onClick={handleAddDiscount}
          >
            Thêm Khuyến Mãi
          </Button>
        </div>
        <Divider style={{ marginBottom: "20px" }} />
        <div className={styles.tableContainer}>
          <Table className={styles.table} stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell className={styles.headerCell}>ID</TableCell>
                <TableCell
                  className={styles.headerCell}
                  onClick={handleSort}
                  style={{ cursor: "pointer" }}
                >
                  Tiêu đề {sortDirection === "asc" ? "↑" : "↓"}
                </TableCell>
                <TableCell className={styles.headerCell}>Mô tả</TableCell>
                <TableCell className={styles.headerCell}>Giá trị</TableCell>
                <TableCell className={styles.headerCell}>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {discounts
                .filter((d) =>
                  d.title.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((discount) => (
                  <TableRow key={discount.id}>
                    <TableCell>{discount.id}</TableCell>
                    <TableCell>{discount.title}</TableCell>
                    <TableCell>{discount.description}</TableCell>
                    <TableCell>{discount.discountValue}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleAddClick(discount)}>
                        <PlaylistAdd />
                      </IconButton>
                      <IconButton
                        onClick={() => handleEditClick(discount)}
                        title="Chỉnh sửa"
                      >
                        <Edit />
                      </IconButton>
                      {discount.isDeleted ? (
                        <IconButton onClick={() => handleShow(discount.id)}>
                          <ToggleOff />
                        </IconButton>
                      ) : (
                        <IconButton onClick={() => handleHide(discount.id)}>
                          <ToggleOn />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
        <TablePagination
          rowsPerPageOptions={[5, 10, 20]}
          component="div"
          count={totalElements}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          labelRowsPerPage="Số hàng mỗi trang:"
        />
      </div>
      <ToastContainer />
    </Paper>
  );
};

export default DiscountList;
