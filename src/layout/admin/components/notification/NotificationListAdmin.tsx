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
import { Edit, Add } from "@material-ui/icons";
import classNames from "classnames";
import { useNavigate } from "react-router-dom";
import {
  ADMIN_GET_NOTIFICATION,
  ADMIN_HIDE_NOTIFICATION,
  ADMIN_SHOW_NOTIFICATION,
} from "../../../../api/api";
import { isTokenExpired } from "../../../util/fucntion/auth";
import useRefreshToken from "../../../util/fucntion/useRefreshToken";
import { ToggleOff, ToggleOn } from "react-bootstrap-icons";
import styles from "./notificationList.module.scss";
import { toast, ToastContainer } from "react-toastify"; // Import react-toastify để hiển thị thông báo
import "react-toastify/dist/ReactToastify.css";
type Notification = {
  id: number;
  isDeleted: boolean;
  message: string;
  title: string;
  topic: string;
  createAt: Date;
};

const NotificationListAdmin: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const navigate = useNavigate();
  const refresh = useRefreshToken();

  // Fetch notifications từ API
  useEffect(() => {
    const fetchNotifications = async () => {
      let token = localStorage.getItem("authToken");

      if (isTokenExpired(token)) {
        token = await refresh();
        if (!token) {
          navigate("/dang-nhap");
          return;
        }
        localStorage.setItem("authToken", token);
      }

      fetch(`${ADMIN_GET_NOTIFICATION}?page=${page}&size=${rowsPerPage}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          // Map dữ liệu trả về từ API
          const fetchedNotifications: Notification[] = data.content.map(
            (notification: any) => ({
              id: notification.id,
              isDeleted: notification.isDeleted,
              message: notification.message,
              title: notification.title,
              topic: notification.topic,
              createAt: notification.createAt,
            })
          );

          setNotifications(fetchedNotifications); // Cập nhật danh sách thông báo
          setTotalElements(data.totalElements); // Tổng số thông báo
        })
        .catch((error) =>
          console.error("Error fetching notifications:", error)
        );
    };

    fetchNotifications();
  }, [page, rowsPerPage, navigate]);

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

  // Điều hướng đến trang thêm thông báo
  const handleAddNotification = () => {
    navigate("/admin/add-thong-bao");
  };
  // Điều hướng đến trang chỉnh sửa
  const handleEditNotification = (id: number) => {
    navigate(`/admin/edit-thong-bao/${id}`); // Đường dẫn tới trang chỉnh sửa khuyến mãi
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

    fetch(`${ADMIN_HIDE_NOTIFICATION}/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          setNotifications((prevNotifications) =>
            prevNotifications.map((notification) =>
              notification.id === id
                ? { ...notification, isDeleted: true }
                : notification
            )
          );
          toast.success("Thông báo đã được xóa thành công");
        } else {
          toast.error("Có lỗi xảy ra khi xóa thông báo");
        }
      })
      .catch((error) => {
        toast.error("Có lỗi xảy ra khi xóa thông báo");
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

    fetch(`${ADMIN_SHOW_NOTIFICATION}/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          setNotifications((prevNotifications) =>
            prevNotifications.map((notification) =>
              notification.id === id
                ? { ...notification, isDeleted: false }
                : notification
            )
          );
          toast.success("Thông báo đã được khôi phục thành công");
        } else {
          toast.error("Có lỗi xảy ra khi khôi phục thông báo");
        }
      })
      .catch((error) => {
        toast.error("Có lỗi xảy ra khi khôi phục thông báo");
      });
  };
  return (
    <Paper>
      <div className={styles.Container}>
        <h2 className={styles.title}>Danh Sách Lịch Sử Thông Báo</h2>
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
            className={classNames("btn", "btn-primary", styles.whiteBtn)}
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={handleAddNotification}
          >
            Thêm Thông Báo
          </Button>
        </div>
        <Divider style={{ marginBottom: "20px" }} />
        <div className={styles.tableContainer}>
          <Table className={styles.table} stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell className={styles.headerCell}>ID</TableCell>
                <TableCell className={styles.headerCell}>Tiêu đề</TableCell>
                <TableCell className={styles.headerCell}>Nội dung</TableCell>
                <TableCell className={styles.headerCell}>Chủ đề</TableCell>
                <TableCell className={styles.headerCell}>
                  Ngày thông báo
                </TableCell>
                <TableCell className={styles.headerCell}>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notifications
                .filter((n) =>
                  n.title.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell>{notification.id}</TableCell>
                    <TableCell>{notification.title}</TableCell>
                    <TableCell>{notification.message}</TableCell>
                    <TableCell>{notification.topic}</TableCell>
                    <TableCell>
                      {new Date(notification.createAt).toLocaleString()}
                    </TableCell>

                    <TableCell>
                      {/* <IconButton
                                                onClick={() => handleEditNotification(notification.id)}
                                                title="Chỉnh sửa"
                                            >
                                                <Edit />
                                            </IconButton> */}
                      {notification.isDeleted ? (
                        <IconButton onClick={() => handleShow(notification.id)}>
                          <ToggleOff />
                        </IconButton>
                      ) : (
                        <IconButton onClick={() => handleHide(notification.id)}>
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

export default NotificationListAdmin;
