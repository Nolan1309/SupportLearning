import React, { useState } from "react";
import {
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Paper,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import { ADMIN_ADD_ACCOUNT } from "../../../../api/api";
import styles from "./addAccount.module.scss"; // Sử dụng CSS Modules
import { toast, ToastContainer } from "react-toastify";
import useRefreshToken from "../../../util/fucntion/useRefreshToken";
import { isTokenExpired } from "../../../util/fucntion/auth";
import { useNavigate } from "react-router-dom";
import { ref, set } from "firebase/database";
import { database } from "../../../util/fucntion/firebaseConfig";

interface Account {
  id: number;
  email: string;
  fullname: string;
  image: string;
  role: string;
  phone: number;
}

const CustomPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4), // 32px
  maxWidth: 800,
  margin: "40px auto",
  backgroundColor: "#f9f9f9",
}));

const AddAccount: React.FC = () => {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [birthday, setBirthday] = useState("");
  const [roleId, setRoleId] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const refresh = useRefreshToken();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const pushUserToFirebase = async (account: Account) => {
    try {
      const userData = {
        fullname: account.fullname,
        email: account.email,
        phone: account.phone,
        image: "",
        status: "offline",
        role: account.role,
      };

      const userRef = ref(database, `users/${account.id}`);

      await set(userRef, userData);

      console.log("User đã được đẩy lên Firebase:", userData);
    } catch (error) {
      console.error("Lỗi khi đẩy user lên Firebase:", error);
    }
  };

  const handleSave = async () => {
    if (
      !fullname ||
      !email ||
      !phone ||
      !gender ||
      !password ||
      !birthday ||
      !roleId
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Email không hợp lệ.");
      return;
    }

    // Kiểm tra độ dài mật khẩu
    if (password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    // Kiểm tra số điện thoại (ví dụ, chỉ chấp nhận số điện thoại 10 số)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      toast.error("Số điện thoại không hợp lệ.");
      return;
    }

    const formData = new FormData();
    formData.append("fullname", fullname);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("gender", gender);
    formData.append("password", password);
    formData.append("birthday", birthday);
    formData.append("roleId", roleId);

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

    fetch(ADMIN_ADD_ACCOUNT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
      .then(async (response) => {
        if (response.ok) {
          const data = await response.json();
          console.log(data);
          await pushUserToFirebase({
            id: data.id,
            fullname: data.fullname,
            email: data.email,
            phone: Number(data.phone),
            image: "",
            role: data.role.id === 2 ? "USER" : "TEACHER",
          });

          toast.success("Tài khoản đã được thêm thành công");
          setTimeout(() => {
            navigate("/admin/tai-khoan");
          }, 2000); // 2000 milliseconds = 2 giây
          setFullname("");
          setEmail("");
          setPhone("");
          setGender("");
          setPassword("");
          setBirthday("");
          setRoleId("");
          setImageFile(null);
        } else {
          const text = await response.text();
          console.error("Error adding account:", text);
          toast.error("Có lỗi xảy ra khi thêm tài khoản: " + text);
        }
      })
      .catch((error) => {
        console.error("Error adding account:", error);
        toast.error("Có lỗi xảy ra khi thêm tài khoản");
      });
  };

  return (
    <CustomPaper elevation={3}>
      <Box>
        <Typography variant="h4" align="center" gutterBottom>
          Thêm Tài Khoản Mới
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
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            variant="outlined"
            fullWidth
          />
          <TextField
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            variant="outlined"
            fullWidth
          />
          <TextField
            label="Số điện thoại"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            variant="outlined"
            fullWidth
          />
          <FormControl fullWidth variant="outlined">
            <InputLabel id="gender-label">Giới tính</InputLabel>
            <Select
              labelId="gender-label"
              value={gender}
              onChange={(e) => setGender(e.target.value as string)}
              label="Giới tính"
            >
              <MenuItem value="Nam">Nam</MenuItem>
              <MenuItem value="Nữ">Nữ</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Mật khẩu"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            variant="outlined"
            fullWidth
            InputProps={{
              endAdornment: (
                <IconButton onClick={handleTogglePasswordVisibility} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              ),
            }}
          />
          <TextField
            label="Ngày sinh"
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            variant="outlined"
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
          />
          <FormControl fullWidth variant="outlined">
            <InputLabel id="role-label">Phân quyền</InputLabel>
            <Select
              labelId="role-label"
              value={roleId}
              onChange={(e) => setRoleId(e.target.value as string)}
              label="Phân quyền"
            >
              <MenuItem value="2">Người dùng</MenuItem>
              <MenuItem value="3">Giáo viên</MenuItem>
            </Select>
          </FormControl>
          <input type="file" onChange={handleImageChange} accept="image/*" />
          <Box mt={2} display="flex" justifyContent="space-between">
            <Button variant="contained" color="primary" onClick={handleSave}>
              Lưu
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => {
                navigate("/admin/tai-khoan");
              }}
            >
              Hủy
            </Button>
          </Box>
        </form>
      </Box>
      <ToastContainer />
    </CustomPaper>
  );
};

export default AddAccount;
