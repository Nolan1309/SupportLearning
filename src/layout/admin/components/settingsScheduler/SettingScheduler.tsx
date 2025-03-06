import React, { useState, useEffect } from "react";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import classNames from "classnames";
import styles from "./setting.module.scss";
import {
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  Button,
  Paper,
  Divider,
} from "@material-ui/core";
import {
  Edit,
  Delete,
  Visibility,
  ToggleOff,
  ToggleOn,
} from "@material-ui/icons";
import { useNavigate } from "react-router-dom";
import {
  ADMIN_GET_PAYMENT,
  ADMIN_GET_PAYMENTDETAIL,
  ADMIN_DELETE_PAYMENT,
} from "../../../../api/api";
import RequireAdmin from "../../../DOM/RequireAdmin";
import { TablePagination } from "@material-ui/core";
import { isTokenExpired } from "../../../util/fucntion/auth";
import useRefreshToken from "../../../util/fucntion/useRefreshToken";

const SettingScheduler: React.FC = () => {
  const [scheduler, setScheduler] = useState<any[]>([]);
  const [score, setScore] = useState<any[]>([]);
  const [selectedTime, setSelectedTime] = useState(dayjs());

  const navigate = useNavigate();
  const refresh = useRefreshToken();

  const fetchSettingScheduler = async (type: string) => {
    let token = localStorage.getItem("authToken");

    if (isTokenExpired(token)) {
      token = await refresh();
      if (!token) {
        window.location.href = "/dang-nhap";
        return;
      }
      localStorage.setItem("authToken", token);
    }

    try {
      const response = await fetch(
        ` ${process.env.REACT_APP_SERVER_HOST}/api/settings/type/${type}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setScore(data);
    } catch (error) {
      console.error("Failed to fetch payments", error);
    }
  };
  const fetchSettingScore = async (type: string) => {
    let token = localStorage.getItem("authToken");

    if (isTokenExpired(token)) {
      token = await refresh();
      if (!token) {
        window.location.href = "/dang-nhap";
        return;
      }
      localStorage.setItem("authToken", token);
    }

    try {
      const response = await fetch(
        ` ${process.env.REACT_APP_SERVER_HOST}/api/settings/type/${type}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setScheduler(data);
    } catch (error) {
      console.error("Failed to fetch payments", error);
    }
  };
  const handleTimeChange = (newValue: any) => {
    setSelectedTime(newValue);
  };
  useEffect(() => {
    fetchSettingScheduler("scheduler");
    fetchSettingScore("score");
  }, []);
  const handleEdit = (id: number) => {
    navigate(`/edit-setting/${id}`);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa?")) {
      let token = localStorage.getItem("authToken");

      if (isTokenExpired(token)) {
        token = await refresh();
        if (!token) {
          window.location.href = "/dang-nhap";
          return;
        }
        localStorage.setItem("authToken", token);
      }

      try {
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_HOST}/api/settings/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Không thể xóa dữ liệu");
        }

        toast.success("Đã xóa thành công!");
        fetchSettingScheduler("scheduler");
        fetchSettingScore("score");
      } catch (error) {
        console.error("Failed to delete setting", error);
      }
    }
  };
  const handleShow = async (id: number) => {
    try {
      let token = localStorage.getItem("authToken");

      if (isTokenExpired(token)) {
        token = await refresh();
        if (!token) {
          window.location.href = "/dang-nhap";
          return;
        }
        localStorage.setItem("authToken", token);
      }
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/settings/${id}/show`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to show setting");
      }
      toast.success("Cài đặt đã được hiển thị!");
      fetchSettingScheduler("scheduler");
    } catch (error) {
      console.error(error);
    }
  };

  const handleHide = async (id: number) => {
    try {
      let token = localStorage.getItem("authToken");

      if (isTokenExpired(token)) {
        token = await refresh();
        if (!token) {
          window.location.href = "/dang-nhap";
          return;
        }
        localStorage.setItem("authToken", token);
      }

      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/settings/${id}/hide`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to hide setting");
      }
      // alert("Setting has been hidden!");
      toast.error("Cài đặt đã được ẩn!");
      fetchSettingScheduler("scheduler");
    } catch (error) {
      console.error(error);
    }
  };
  const [openDialog, setOpenDialog] = useState(false);
  const [openDialogThemScore, setOpenDialogThemScore] = useState(false);
  const [openDialogThemScheduler, setOpenDialogThemScheduler] = useState(false);
  const [openDialogScheduler, setOpenDialogScheduler] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [updatedName, setUpdatedName] = useState<string>("");

  const handleOpenDialog = (item: any) => {
    if (item.type == "scheduler") {
      setSelectedItem(item);
      setUpdatedName(item.name);
      setOpenDialogScheduler(true);
    } else {
      setSelectedItem(item);
      setUpdatedName(item.name);
      setOpenDialog(true);
    }
  };
  const handleOpenDialogThemScore = () => {
    setOpenDialogThemScore(true);
  };
  const handleOpenDialogThemScheduler = () => {
    setOpenDialogThemScheduler(true);
  };

  const handleCloseDialog = () => {
    setOpenDialogScheduler(false);
    setOpenDialog(false);
    setOpenDialogThemScore(false);
    setOpenDialogThemScheduler(false);
    setSelectedItem(null);
    setUpdatedName("");
  };
  const handleUpdateName = async () => {
    if (!selectedItem) return;

    let token = localStorage.getItem("authToken");

    if (isTokenExpired(token)) {
      token = await refresh();
      if (!token) {
        window.location.href = "/dang-nhap";
        return;
      }
      localStorage.setItem("authToken", token);
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/settings/${selectedItem.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: updatedName }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update setting");
      }

      // alert("Name updated successfully!");
      toast.success("Cập nhật tên thành công!");
      fetchSettingScheduler("scheduler");
      fetchSettingScore("score");
      handleCloseDialog();
    } catch (error) {
      console.error("Error updating name:", error);
    }
  };
  const handleAddNameScore = async () => {
    let token = localStorage.getItem("authToken");

    if (isTokenExpired(token)) {
      token = await refresh();
      if (!token) {
        window.location.href = "/dang-nhap";
        return;
      }
      localStorage.setItem("authToken", token);
    }
    const settingData = {
      name: updatedName,
      type: "score",
      isCheck: false,
    };
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settingData),
      });

      if (!response.ok) {
        throw new Error("Failed to update setting");
      }
      toast.success("Thêm điểm thành công");

      fetchSettingScheduler("scheduler");
      fetchSettingScore("score");
      handleCloseDialog();
    } catch (error) {
      console.error("Error updating name:", error);
    }
  };
  const handleAddNameScheduler = async () => {
    const cronExpression = formatTimeToCron(selectedTime);
    let token = localStorage.getItem("authToken");

    if (isTokenExpired(token)) {
      token = await refresh();
      if (!token) {
        window.location.href = "/dang-nhap";
        return;
      }
      localStorage.setItem("authToken", token);
    }
    const settingData = {
      name: cronExpression,
      type: "scheduler",
      isCheck: false,
    };
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settingData),
      });

      if (!response.ok) {
        throw new Error("Failed to update setting");
      }
      toast.success("Thêm điểm thành công");

      fetchSettingScheduler("scheduler");
      fetchSettingScore("score");
      handleCloseDialog();
    } catch (error) {
      console.error("Error updating name:", error);
    }
  };
  const formatTimeToCron = (time: any) => {
    const seconds = "0"; // Luôn là giây thứ 0
    const minutes = time.minute(); // Phút
    const hours = time.hour(); // Giờ

    return `${seconds} ${minutes} ${hours} * * ?`; // Trả về biểu thức cron
  };

  const handleUpdateScheduler = async () => {
    const cronExpression = formatTimeToCron(selectedTime);

    let token = localStorage.getItem("authToken");

    if (isTokenExpired(token)) {
      token = await refresh();
      if (!token) {
        window.location.href = "/dang-nhap";
        return;
      }
      localStorage.setItem("authToken", token);
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/settings/${selectedItem.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: cronExpression }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update scheduler");
      }

      // alert("");
      toast.success("Hẹn giờ cập nhật thành công!");
      fetchSettingScheduler("scheduler");
      handleCloseDialog();
    } catch (error) {
      toast.error("Cập nhật giờ thất bại! Vui lòng thử lại sau!");
      // console.error("Error updating scheduler:", error);
    }
  };

  const handleActivate = async (id: number, type: string) => {
    try {
      let token = localStorage.getItem("authToken");

      if (isTokenExpired(token)) {
        token = await refresh();
        if (!token) {
          window.location.href = "/dang-nhap";
          return;
        }
        localStorage.setItem("authToken", token);
      }

      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/settings/${id}/activate/${type}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to activate setting");
      }

      // alert("Setting activated successfully!");
      toast.success("Cài đặt trạng thái thành công!");
      fetchSettingScheduler("scheduler"); // Refresh dữ liệu scheduler
      fetchSettingScore("score"); // Refresh dữ liệu score
    } catch (error) {
      toast.error("Cài đặt trạng thái không thành công!");
      // console.error("Error activating setting:", error);
    }
  };

  return (
    <Paper>
      <div className={styles.Container}>
        <div className="scheduler-container">
          {" "}
          <div className="header-container">
            <h2 style={{ margin: "0px" }}>Điều kiện điểm qua bài</h2>
          </div>
          <div style={{ textAlign: "left" }}>
            <button
              className={classNames("btn", "btn-primary", styles.whiteBtn)}
              onClick={() => handleOpenDialogThemScore()}
            >
              Thêm điều kiện
            </button>
          </div>
          <div className={styles.tableContainer}>
            <Table className={styles.table} stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell className={styles.headerCell}>STT</TableCell>
                  <TableCell className={styles.headerCell}>Điểm pass</TableCell>
                  <TableCell className={styles.headerCell}>Loại</TableCell>
                  <TableCell className={styles.headerCell}>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {scheduler.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleOpenDialog(item)}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(item.id)}>
                        <Delete />
                      </IconButton>
                      <IconButton
                        onClick={() => handleActivate(item.id, item.type)}
                      >
                        {item.check ? <ToggleOn /> : <ToggleOff />}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="score-container">
          <div className="header-container">
            <h2 style={{ margin: "10px 0px" }}>Nhắc lịch học</h2>
          </div>
          <div style={{ textAlign: "left" }}>
            <button
              className={classNames("btn", "btn-primary", styles.whiteBtn)}
              onClick={() => handleOpenDialogThemScheduler()}
            >
              Thêm giờ
            </button>
          </div>
          <div className={styles.tableContainer}>
            <Table className={styles.table} stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell className={styles.headerCell}>STT</TableCell>
                  <TableCell className={styles.headerCell}>Giờ nhắc</TableCell>
                  <TableCell className={styles.headerCell}>Loại</TableCell>
                  <TableCell className={styles.headerCell}>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {score.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleOpenDialog(item)}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(item.id)}>
                        <Delete />
                      </IconButton>
                      <IconButton
                        onClick={() => handleActivate(item.id, item.type)}
                      >
                        {item.check ? <ToggleOn /> : <ToggleOff />}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>Cập nhật giờ</DialogTitle>
          <DialogContent>
            <TextField
              label="Giờ mới"
              fullWidth
              value={updatedName}
              onChange={(e) => setUpdatedName(e.target.value)}
              margin="normal"
            />
            <Button
              onClick={handleUpdateName}
              color="primary"
              variant="contained"
              style={{ marginRight: 10 }}
            >
              Cập nhật
            </Button>
            <Button
              onClick={handleCloseDialog}
              color="secondary"
              variant="outlined"
            >
              Hủy
            </Button>
          </DialogContent>
        </Dialog>
        <Dialog open={openDialogThemScore} onClose={handleCloseDialog}>
          <DialogTitle>Thêm điểm</DialogTitle>
          <DialogContent>
            <TextField
              label="Điểm mới"
              fullWidth
              value={updatedName}
              onChange={(e) => setUpdatedName(e.target.value)}
              margin="normal"
              type="number" // Giới hạn chỉ cho nhập số
              inputProps={{
                step: 1, // Bước nhảy là 1
                min: 0, // Giá trị nhỏ nhất
                pattern: "[0-9]*", // Chỉ cho phép số
              }}
            />
            <Button
              onClick={handleAddNameScore}
              color="primary"
              variant="contained"
              className="white-btn"
              style={{ marginRight: 10 }}
            >
              Thêm
            </Button>
            <Button
              onClick={handleCloseDialog}
              color="secondary"
              variant="outlined"
            >
              Hủy
            </Button>
          </DialogContent>
        </Dialog>
        <Dialog open={openDialogThemScheduler} onClose={handleCloseDialog}>
          <DialogTitle>Thêm giờ nhắc</DialogTitle>
          <DialogContent>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <TimePicker
                label="Giờ mới"
                value={selectedTime}
                onChange={handleTimeChange}
                slots={{ textField: TextField }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    margin: "normal",
                  },
                }}
              />
            </LocalizationProvider>
            <Button
              onClick={handleAddNameScheduler}
              color="primary"
              variant="contained"
              style={{ marginRight: 10 }}
            >
              Cập nhật
            </Button>
            <Button
              onClick={handleCloseDialog}
              color="secondary"
              variant="outlined"
            >
              Hủy
            </Button>
          </DialogContent>
        </Dialog>
        <Dialog open={openDialogScheduler} onClose={handleCloseDialog}>
          <DialogTitle>Cập nhật hẹn giờ nhắc lịch học</DialogTitle>
          <DialogContent>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <TimePicker
                label="Giờ mới"
                value={selectedTime}
                onChange={handleTimeChange}
                slots={{ textField: TextField }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    margin: "normal",
                  },
                }}
              />
            </LocalizationProvider>
            <Button
              onClick={() => handleUpdateScheduler()}
              color="primary"
              variant="contained"
              style={{ marginRight: 10 }}
            >
              Cập nhật
            </Button>
            <Button
              onClick={handleCloseDialog}
              color="secondary"
              variant="outlined"
            >
              Hủy
            </Button>
          </DialogContent>
        </Dialog>
        <ToastContainer />
      </div>
    </Paper>
  );
};
export const RequestAdminURL = RequireAdmin(SettingScheduler);
export default SettingScheduler;
