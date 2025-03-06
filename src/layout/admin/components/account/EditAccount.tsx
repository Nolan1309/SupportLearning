import React, { useState, useEffect } from "react";
import {
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Checkbox,
  FormControlLabel,
  CircularProgress,
} from "@mui/material"; // Đã thay đổi import
import { useParams, useNavigate } from "react-router-dom";
import { ADMIN_GET_ACCOUNT, ADMIN_UPDATE_ACCOUNT } from "../../../../api/api";
import useRefreshToken from "../../../util/fucntion/useRefreshToken";
import { isTokenExpired } from "../../../util/fucntion/auth";
import { toast, ToastContainer } from "react-toastify";
import styles from "./editAccount.module.scss";
import { styled } from "@mui/material/styles"; // Sử dụng cùng phiên bản MUI
import { SelectChangeEvent } from "@mui/material/Select";
type Account = {
  id: number;
  fullname: string;
  email: string;
  phone: string;
  gender: string;
  image: string;
  birthday: string;
  roleId: number;
};

const CustomPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4), // 32px
  maxWidth: 600,
  margin: "40px auto",
  backgroundColor: "#f9f9f9",
}));

const EditAccount: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [account, setAccount] = useState<Account | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null); // State để lưu ảnh
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const refresh = useRefreshToken();

  useEffect(() => {
    const fetchAccountDetails = async () => {
      let token = localStorage.getItem("authToken");

      if (isTokenExpired(token)) {
        token = await refresh();
        if (!token) {
          navigate("/dang-nhap");
          return;
        }
        localStorage.setItem("authToken", token);
      }

      // Thực hiện fetch dữ liệu
      fetch(`${ADMIN_GET_ACCOUNT}/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          const formattedBirthday = data.birthday
            ? data.birthday.split("T")[0]
            : "";
          setAccount({
            id: data.id,
            fullname: data.fullname,
            email: data.email,
            phone: data.phone,
            gender: data.gender,
            image: data.image,
            birthday: formattedBirthday,
            roleId: data.roleId,
          });
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching account:", error);
          setLoading(false);
        });
    };

    fetchAccountDetails();
  }, [id, navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setAccount((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  // Thêm một hàm riêng để xử lý thay đổi của Select
  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setAccount((prev) => (prev ? { ...prev, [name]: value } : null));
  };


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file); // Lưu ảnh vào state
    }
  };

  const handleSave = async () => {
    if (!account) return;

    const formData = new FormData();
    formData.append("fullname", account.fullname);
    formData.append("email", account.email);
    formData.append("phone", account.phone);
    formData.append("gender", account.gender);
    formData.append("birthday", account.birthday);
    formData.append("roleId", account.roleId.toString());

    // Thêm ảnh vào FormData nếu có
    if (imageFile) {
      formData.append("image", imageFile);
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

    fetch(`${ADMIN_UPDATE_ACCOUNT}/${account.id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData, // Sử dụng FormData làm body
    })
      .then((response) => {
        if (response.ok) {
          toast.success("Cập nhật tài khoản thành công!");
          setTimeout(() => {
            navigate("/admin/tai-khoan");
          }, 2000); // 2000 milliseconds = 2 giây

        } else {
          toast.error("Có lỗi xảy ra khi cập nhật tài khoản");
        }
      })
      .catch((error) => {
        console.error("Error updating account:", error);
        toast.error("Có lỗi xảy ra khi cập nhật tài khoản");
      });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!account) {
    return <div>Account not found</div>;
  }

  return (
    <>
      <CustomPaper elevation={3}>
        <Box className={styles.container}>
          <Typography variant="h5" align="center" gutterBottom>
            Chỉnh Sửa Tài Khoản
          </Typography>
          <form
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <TextField
              label="Họ tên"
              name="fullname"
              value={account.fullname}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
              required
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              label="Email"
              name="email"
              value={account.email}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
              required
              disabled
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              label="Số điện thoại"
              name="phone"
              value={account.phone}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
              required
              InputLabelProps={{
                shrink: true,
              }}
            />
            <FormControl variant="outlined" fullWidth required>
              <InputLabel id="gender-label">Giới tính</InputLabel>
              <Select
                labelId="gender-label"
                name="gender"
                value={account.gender}
                onChange={handleSelectChange}
                label="Giới tính"
              >
                <MenuItem value="Nam">Nam</MenuItem>
                <MenuItem value="Nữ">Nữ</MenuItem>
              </Select>
            </FormControl>

            {/* Hiển thị hình ảnh nếu có */}
            {account.image && (
              <Box className={styles.imagePreview}>
                <img src={account.image} alt="Profile" />
              </Box>
            )}
            <input
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              style={{ marginTop: "10px" }}
            />

            <TextField
              label="Ngày sinh"
              name="birthday"
              type="date"
              value={account.birthday}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
              required
              InputLabelProps={{
                shrink: true,
              }}
            />
            <FormControl variant="outlined" fullWidth required>
              <InputLabel id="role-label">Phân quyền</InputLabel>
              <Select
                labelId="role-label"
                name="roleId"
                value={account.roleId}
                onChange={(e) =>
                  setAccount((prev) =>
                    prev ? { ...prev, roleId: Number(e.target.value) } : null
                  )
                }
                label="Phân quyền"
              >
                <MenuItem value={1}>Quản trị viên</MenuItem>
                <MenuItem value={2}>Người dùng</MenuItem>
                <MenuItem value={3}>Giáo viên</MenuItem>
              </Select>
            </FormControl>
            <Box className={styles.actions}>
              <Button variant="contained" color="primary" type="submit">
                Lưu Thay Đổi
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => navigate("/admin/tai-khoan")}
                className={styles.buttonSecondary}
              >
                Hủy
              </Button>
            </Box>
          </form>
        </Box>
      </CustomPaper>
      <ToastContainer />
    </>
  );
};

export default EditAccount;
