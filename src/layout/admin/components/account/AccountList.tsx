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
  Dialog,
  DialogTitle,
  DialogContent,
  Paper,
  Divider,
  MenuItem,
} from "@material-ui/core";
import { Edit, Delete, Visibility, Add } from "@material-ui/icons";
import styles from "./accountList.module.scss"; // Import CSS file
import { useNavigate } from "react-router-dom";
import { ADMIN_GET_ACCOUNT, ADMIN_GET_ACCOUNT_LIST } from "../../../../api/api";
import { ToggleOff, ToggleOn } from "react-bootstrap-icons";
import { isTokenExpired } from "../../../util/fucntion/auth";
import useRefreshToken from "../../../util/fucntion/useRefreshToken";
import { TablePagination } from "@material-ui/core";
import classNames from "classnames";
type Account = {
  id: number;
  name: string;
  username: string;
  email: string;
  role: string;
  password: string;
  deleted: boolean;
};
interface AccountDetails {
  id: number; // ID của tài khoản
  fullname: string; // Họ và tên của tài khoản
  email: string; // Email của tài khoản
  phone: string | null; // Số điện thoại
  gender: string | null; // Giới tính
  googleId: string | null; // Google ID
  image: string | null; // Hình ảnh đại diện
  isDeleted: boolean; // Trạng thái xóa
  isGoogleAccount: boolean; // Có phải tài khoản Google hay không
  birthday: string | null; // Ngày sinh
  createdAt: string; // Thời điểm tạo tài khoản
  updatedAt: string; // Thời điểm cập nhật
  deletedDate: string | null; // Ngày xóa
  roleId: number; // ID vai trò
  deleted: boolean; // Trạng thái xóa (duplicate, có thể hợp nhất với `isDeleted`)
  googleAccount: boolean; // Có phải tài khoản Google (duplicate, có thể hợp nhất với `isGoogleAccount`)
}
const AccountList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [hiddenAccounts, setHiddenAccounts] = useState<Set<number>>(new Set());
  const [accounts, setAccounts] = useState<AccountDetails[]>([]);
  const navigate = useNavigate(); // Khởi tạo navigate
  const refresh = useRefreshToken();
  const [page, setPage] = useState(0); // Trang hiện tại
  const [rowsPerPage, setRowsPerPage] = useState(30); // Số bản ghi mỗi trang
  const [totalElements, setTotalElements] = useState(0); // Tổng số bản ghi

  useEffect(() => {
    const fetchAccounts = async () => {
      let token = localStorage.getItem("authToken");

      if (isTokenExpired(token)) {
        token = await refresh();
        if (!token) {
          navigate("/dang-nhap");
          return;
        }
        localStorage.setItem("authToken", token);
      }
      const params = new URLSearchParams({
        ...(selectedRole && { roleId: selectedRole.toString() }),
        ...(searchTerm && { searchTerm }),
        page: page.toString(),
        size: rowsPerPage.toString(),
      });

      const url = `${process.env.REACT_APP_SERVER_HOST}/api/account/list-all-search?${params.toString()}`;
      // Fetch dữ liệu từ API với tham số phân trang
      fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          setAccounts(data.content); // Cập nhật danh sách tài khoản
          setTotalElements(data.page.totalElements); // Tổng số bản ghi
        })
        .catch((error) => console.error("Error fetching accounts:", error));
    };

    fetchAccounts(); // Gọi API mỗi khi `page` hoặc `rowsPerPage` thay đổi
  }, [page, rowsPerPage, searchTerm, selectedRole, navigate]);

  const handleDelete = async (id: number) => {
    let token = localStorage.getItem("authToken");

    if (isTokenExpired(token)) {
      token = await refresh();
      if (!token) {
        navigate("/dang-nhap");
        return;
      }
      localStorage.setItem("authToken", token);
    }

    fetch(`${ADMIN_GET_ACCOUNT}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then(() => {
        setAccounts(accounts.filter((a) => a.id !== id));
      })
      .catch((error) => console.error("Error deleting account:", error));
  };

  const handleAddAccountClick = () => {
    navigate("/admin/add-tai-khoan/");
  };

  const handleEditAccountClick = (id: number) => {
    navigate(`/admin/edit-tai-khoan/${id}`);
  };

  const handleSort = () => {
    const newSortDirection = sortDirection === "asc" ? "desc" : "asc";
    setSortDirection(newSortDirection);

    const sortedAccounts = [...accounts].sort((a, b) => {
      if (a.fullname < b.fullname) return newSortDirection === "asc" ? -1 : 1;
      if (a.fullname > b.fullname) return newSortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setAccounts(sortedAccounts);
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

    fetch(`${process.env.REACT_APP_SERVER_HOST}/api/account/delete/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          setAccounts((prevAccounts) =>
            prevAccounts.map((account) =>
              account.id === id ? { ...account, deleted: true } : account
            )
          );
          alert("Tài khoản đã được khóa thành công");
        } else {
          alert("Có lỗi xảy ra khi khóa tài khoản");
        }
      })
      .catch((error) => {
        console.error("Error deleting account:", error);
        alert("Có lỗi xảy ra khi khóa tài khoản");
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

    fetch(`${process.env.REACT_APP_SERVER_HOST}/api/account/active/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          // Cập nhật trạng thái isDeleted trong danh sách tài khoản
          setAccounts((prevAccounts) =>
            prevAccounts.map((account) =>
              account.id === id ? { ...account, deleted: false } : account
            )
          );
          alert("Tài khoản đã được kích hoạt thành công");
        } else {
          alert("Có lỗi xảy ra khi kích hoạt tài khoản");
        }
      })
      .catch((error) => {
        console.error("Error updating account activation status:", error);
        alert("Có lỗi xảy ra khi kích hoạt tài khoản");
      });
  };
  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage); // Cập nhật trang hiện tại
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10)); // Cập nhật số bản ghi mỗi trang
    setPage(0); // Reset về trang đầu tiên
  };

  return (
    <Paper>
      <div className={styles.Container}>
        <h2 className={styles.title}>Danh Sách Tài Khoản</h2>
        <div className={styles.headContainer}>
          <div>
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
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
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
              <MenuItem value="1">Admin</MenuItem>
              <MenuItem value="2">User</MenuItem>
              <MenuItem value="3">Giáo viên</MenuItem>
            </TextField>
          </div>

          <Button
            className={classNames("btn", "btn-primary", styles.whiteBtn)}
            startIcon={<Add />}
            variant="contained"
            color="primary"
            onClick={handleAddAccountClick}
          >
            Thêm Tài Khoản
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
                  Tên {sortDirection === "asc" ? "↑" : "↓"}
                </TableCell>
                <TableCell className={styles.headerCell}>
                  Tên đăng nhập
                </TableCell>
                <TableCell className={styles.headerCell}>Email</TableCell>
                <TableCell className={styles.headerCell}>Phân quyền</TableCell>
                <TableCell className={styles.headerCell}>Trạng thái</TableCell>
                <TableCell className={styles.headerCell}>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {accounts
                .filter(
                  (a) =>
                    a.fullname
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) &&
                    !hiddenAccounts.has(a.id)
                )
                .filter((account) => account.roleId !== 1)
                .map((account, index) => (
                  <TableRow key={account.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{account.fullname}</TableCell>
                    <TableCell>{account.fullname}</TableCell>
                    <TableCell>{account.email}</TableCell>
                    <TableCell>{account.roleId}</TableCell>
                    <TableCell>
                      {account.deleted ? "Đã khóa" : "Hoạt động"}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleEditAccountClick(account.id)}
                      >
                        <Edit />
                      </IconButton>
                      {/* <IconButton onClick={() => handleDelete(account.id)}>
                      <Delete />
                    </IconButton> */}
                      {account.deleted ? (
                        <IconButton onClick={() => handleShow(account.id)}>
                          <ToggleOff />
                        </IconButton>
                      ) : (
                        <IconButton onClick={() => handleHide(account.id)}>
                          <ToggleOn />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>

        {/* Phân trang */}
        <TablePagination
          rowsPerPageOptions={[30, 50, 100]}
          component="div"
          count={totalElements}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          labelRowsPerPage="Số hàng mỗi trang:"
        />
      </div>
    </Paper>
  );
};

export default AccountList;
