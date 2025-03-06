import React, { useState, useEffect } from "react";
import {
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  TablePagination,
  Paper,
  Divider,
} from "@material-ui/core";
import { useNavigate, useParams } from "react-router-dom";
import { ADMIN_ACCOFCOURSE } from "../../../../api/api";
import { isTokenExpired } from "../../../util/fucntion/auth";
import useRefreshToken from "../../../util/fucntion/useRefreshToken";
import styles from "./accOfCourse.module.scss";
import "./accCourse.css";
type Account = {
  accountId: number;
  email: string;
  phone: string;
  gender: string;
};

const AccOfCourse: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>(); // Lấy ID khóa học từ URL
  const [searchTerm, setSearchTerm] = useState("");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const navigate = useNavigate();
  const refresh = useRefreshToken();

  // Kiểm tra xem courseId có hợp lệ không (là một số hợp lệ)
  const isValidCourseId = (id: string | undefined) => {
    return !isNaN(Number(id)) && Number(id) > 0;
  };

  const fetchAccounts = async () => {
    if (!isValidCourseId(courseId)) {
      alert("Khóa học không hợp lệ hoặc không tồn tại.");
      navigate("/danh-sach-khoa-hoc"); // Điều hướng về trang danh sách khóa học
      return;
    }

    let token = localStorage.getItem("authToken");

    if (isTokenExpired(token)) {
      token = await refresh();
      if (!token) {
        navigate("/dang-nhap");
        return;
      }
      localStorage.setItem("authToken", token);
    }

    const apiEndpoint = `${ADMIN_ACCOFCOURSE}/${courseId}?page=${page}&size=${rowsPerPage}`;

    fetch(apiEndpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        const fetchedAccounts: Account[] = data.content.map((account: any) => ({
          accountId: account.accountId,
          email: account.email,
          phone: account.phone,
          gender: account.gender,
        }));

        setAccounts(fetchedAccounts);
        setTotalElements(data.totalElements); // Tổng số tài khoản
      })
      .catch((error) => console.error("Error fetching accounts:", error));
  };

  useEffect(() => {
    if (courseId) {
      fetchAccounts();
    }
  }, [courseId, page, rowsPerPage]);

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

  // Điều hướng đến trang chi tiết học viên
  const handleAccountClick = (accountId: number) => {
    navigate(`/admin/hoc-tap/chi-tiet-hoc-vien/ket-qua/${accountId}`);
  };

  return (
    <Paper>
      <div className={styles.Container}>
        <h2 className={styles.title}>Danh Sách Tài Khoản của Khóa Học</h2>
        <div className={styles.headContainer}>
          <a href="/admin/hoc-tap" className="btn btn-primary white-btn">
            <span>Quay lại</span>
          </a>
          <TextField
            className={styles.searchField}
            size="small"
            label="Tìm kiếm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
          />
        </div>
        <Divider style={{ marginBottom: "20px" }} />
        <div className={styles.tableContainer}>
          <Table className={styles.table} stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell className={styles.headerCell}>Email</TableCell>
                <TableCell className={styles.headerCell}>Điện thoại</TableCell>
                <TableCell className={styles.headerCell}>Giới tính</TableCell>
                <TableCell className={styles.headerCell}>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {accounts
                .filter((a) =>
                  a.email.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((account) => (
                  <TableRow key={account.accountId}>
                    <TableCell>{account.email}</TableCell>
                    <TableCell>{account.phone}</TableCell>
                    <TableCell>{account.gender}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        className="white-btn"
                        onClick={() => handleAccountClick(account.accountId)} // Điều hướng khi click
                      >
                        Xem
                      </Button>
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
        />
      </div>
    </Paper>
  );
};

export default AccOfCourse;
