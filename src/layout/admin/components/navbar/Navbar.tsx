// Navbar.tsx

import React, { useState, useEffect } from "react";
import { AppBar, Toolbar, IconButton, Menu, MenuItem, Avatar, Tooltip } from "@mui/material";
import { Settings, Logout, AccountCircle } from "@mui/icons-material";
import styles from "./navbar.module.scss";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
interface JwtPayload {
    isAdmin?: boolean;
    isTeacher?: boolean;
    username?: string; // Thêm trường username nếu có
}

const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("authToken");

    // State để quản lý Menu
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const [username, setUsername] = useState<string>("");

    // Sử dụng useEffect để xử lý điều hướng và giải mã token
    useEffect(() => {
        if (!token) {
            navigate("/dang-nhap");
            return;
        }

        try {
            const decodedToken = jwtDecode<JwtPayload>(token);
            const userName = decodedToken.username || "Admin";
            setUsername(userName);
        } catch (error) {
            console.error("Invalid token", error);
            navigate("/dang-nhap");
        }
    }, [token, navigate]);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleProfile = () => {
        navigate("/admin/profile");
        handleMenuClose();
    };

    const handleSettings = () => {
        navigate("/admin/setting");
        handleMenuClose();
    };

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("authData");
        navigate("/dang-nhap");
    };

    return (
        <AppBar position="static" className={styles.navbar}>
            <Toolbar className={styles.toolbar}>
                {/* Các mục menu */}
                <div className={styles.menuItems}>
                    {/* Hiển thị avatar người dùng với menu */}
                    <Tooltip title="Cài đặt và Tài khoản">
                        <IconButton onClick={handleMenuOpen} color="inherit">
                            <Avatar className={styles.icon}>
                                {username.charAt(0).toUpperCase()}
                            </Avatar>
                        </IconButton>
                    </Tooltip>
                    <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleMenuClose}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                    >
                        <MenuItem onClick={handleProfile}>
                            <AccountCircle fontSize="small" className={styles.icon} />
                            Profile
                        </MenuItem>
                        <MenuItem onClick={handleSettings}>
                            <Settings fontSize="small" className={styles.icon} />
                            Cài đặt
                        </MenuItem>
                        <MenuItem onClick={handleLogout}>
                            <Logout fontSize="small" className={styles.icon} />
                            Đăng xuất
                        </MenuItem>
                    </Menu>
                </div>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
