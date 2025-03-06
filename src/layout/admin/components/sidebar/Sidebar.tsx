// Sidebar.tsx

import React, { useState } from "react";
import styles from "./siderbar.module.scss";

import DashboardIcon from "@mui/icons-material/Dashboard";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import QuizIcon from "@mui/icons-material/Quiz";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SchoolIcon from "@mui/icons-material/School";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import CategoryIcon from "@mui/icons-material/Category";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import PeopleIcon from "@mui/icons-material/People"; // New icon for managing students

import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  isAdmin?: boolean;
  isTeacher?: boolean;
}

const Sidebar: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  if (!token) {
    navigate("/dang-nhap");
    return null;
  }

  const decodedToken = jwtDecode<JwtPayload>(token);
  const isAdmin = decodedToken.isAdmin;
  const isTeacher = decodedToken.isTeacher;

  if (!isAdmin && !isTeacher) {
    navigate("/bao-loi-403");
    return null;
  }

  const handleDropdownToggle = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleMenuClick = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authData");
    window.location.href = "/dang-nhap";
  };

  return (
    <div className={styles.sidebar_admin}>
      <div className={styles.top}>
        <span className={styles.logo}>TMS ADMIN</span>
      </div>
      <hr className={styles.hr} />
      <div className={styles.center}>
        <ul>
          {isAdmin && (
            <>
              <p className={styles.title_admin}>MANAGE PAGES</p>
              <li className={styles.liItem}>
                <Link to="/admin" className="link">
                  <LibraryBooksIcon className={styles.icon} />
                  <span>Quản lí tài liệu</span>
                </Link>
              </li>
              <li className={styles.liItem}>
                <Link to="/admin/khoa-hoc" className="link">
                  <AssignmentIcon className={styles.icon} />
                  <span>Quản lí khóa học</span>
                </Link>
              </li>
              <li className={styles.liItem}>
                <Link to="/admin/cau-hoi" className="link">
                  <QuizIcon className={styles.icon} />
                  <span>Ngân hàng câu hỏi</span>
                </Link>
              </li>
              <li className={styles.liItem}>
                <Link to="/admin/bai-kiem-tra" className="link">
                  <QuizIcon className={styles.icon} />
                  <span>Quản lí bài kiểm tra</span>
                </Link>
              </li>
              <li className={styles.liItem}>
                <Link to="/admin/hoc-tap" className="link">
                  <QuizIcon className={styles.icon} />
                  <span>Quản lí kết quả học tập</span>
                </Link>
              </li>
              <li
                className={`${styles.liItem} ${styles.dropdown}`}
                onClick={handleDropdownToggle}
              >
                <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                  <CategoryIcon className={styles.icon} />
                  <span>Quản lí danh mục</span>
                </div>
              </li>
              {isDropdownOpen && (
                <ul className={`${styles.dropdownMenu} ${styles.showDropdown}`}>
                  <li>
                    <Link to="/admin/category-field" className={styles.link}>
                      Danh mục lĩnh vực
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/category-branch" className={styles.link}>
                      Danh mục chuyên ngành
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/category-subject" className={styles.link}>
                      Danh mục môn học
                    </Link>
                  </li>
                  {/* <li>
                    <Link to="/admin/category-blog" className={styles.link}>
                      Danh mục bài viết
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/category-course" className={styles.link}>
                      Danh mục khóa học
                    </Link>
                  </li> */}
                </ul>
              )}
              <li className={styles.liItem}>
                <Link to="/admin/tai-khoan" className="link">
                  <AccountCircleIcon className={styles.icon} />
                  <span>Quản lí tài khoản</span>
                </Link>
              </li>
              <li className={styles.liItem}>
                <Link to="/admin/thanh-toan" className="link">
                  <CreditCardIcon className={styles.icon} />
                  <span>Quản lí thanh toán</span>
                </Link>
              </li>
              <li className={styles.liItem}>
                <Link to="/admin/comment" className="link">
                  <CreditCardIcon className={styles.icon} />
                  <span>Quản lí bình luận</span>
                </Link>
              </li>
              <li className={styles.liItem}>
                <Link to="/admin/blog" className="link">
                  <CreditCardIcon className={styles.icon} />
                  <span>Quản lí bài viết</span>
                </Link>
              </li>
              <li className={styles.liItem}>
                <Link to="/admin/discount" className="link">
                  <CreditCardIcon className={styles.icon} />
                  <span>Quản lí giảm giá</span>
                </Link>
              </li>
              <p className={styles.title_admin}>REPORT</p>
              <li className={styles.liItem}>
                <Link to="/admin/thong-bao" className="link">
                  <NotificationsIcon className={styles.icon} />
                  <span>Thông báo</span>
                </Link>
              </li>
              <li>
                <Link to="/admin/thong-ke" className="link">
                  <NotificationsIcon className="icon" />
                  <span>Thống kê</span>
                </Link>
              </li>
              <p className={styles.title_admin}>SUPPORT</p>
              <li className={styles.liItem}>
                <Link to="/admin/chat" className="link">
                  <SettingsIcon className={styles.icon} />
                  <span>Hỗ trợ khách hàng</span>
                </Link>
              </li>
              <li className={styles.liItem}>
                <Link to="/admin/setting" className="link">
                  <CreditCardIcon className={styles.icon} />
                  <span>Cài đặt</span>
                </Link>
              </li>
              <li className={styles.liItem}>
                <Link to="/admin/restore" className="link">
                  <CreditCardIcon className={styles.icon} />
                  <span>Thùng rác</span>
                </Link>
              </li>
              <li className={styles.liItem}>
                <Link to="/admin/backup" className="link">
                  <CreditCardIcon className={styles.icon} />
                  <span>Sao lưu phục hồi</span>
                </Link>
              </li>
              <p className={styles.title_admin}>PAGES OTHER</p>
              <li className={styles.liItem}>
                <Link to="/admin/profile" className="link">
                  <SettingsIcon className={styles.icon} />
                  <span>Thông tin cá nhân</span>
                </Link>
              </li>
              <li className={styles.liItem} onClick={handleMenuClick}>
                <ExitToAppIcon className={styles.icon} />
                <span>Đăng xuất</span>
              </li>
            </>
          )}

          {isTeacher && (
            <>
              <p className={styles.title_admin}>MANAGE PAGES</p>
              <li className={styles.liItem}>
                <Link to="/admin/khoa-hoc" className="link">
                  <AssignmentIcon className={styles.icon} />
                  <span>Quản lí khóa học</span>
                </Link>
              </li>
              <li className={styles.liItem}>
                <Link to="/admin/cau-hoi" className="link">
                  <QuizIcon className={styles.icon} />
                  <span>Ngân hàng câu hỏi khóa học</span>
                </Link>
              </li>
              <li className={styles.liItem}>
                <Link to="/admin/bai-kiem-tra" className="link">
                  <QuizIcon className={styles.icon} />
                  <span>Quản lí bài kiểm tra khóa học</span>
                </Link>
              </li>
              <li className={styles.liItem}>
                <Link to="/admin/hoc-tap" className="link">
                  <QuizIcon className={styles.icon} />
                  <span>Quản lí kết quả học tập</span>
                </Link>
              </li>
              <p className={styles.title_admin}>REPORT</p>
              <li className={styles.liItem}>
                <Link to="/admin/thong-bao" className="link">
                  <NotificationsIcon className={styles.icon} />
                  <span>Thông báo</span>
                </Link>
              </li>
              <p className={styles.title_admin}>SUPPORT</p>
              <li className={styles.liItem}>
                <Link to="/admin/chat" className="link">
                  <SettingsIcon className={styles.icon} />
                  <span>Hỗ trợ khách hàng</span>
                </Link>
              </li>
              <p className={styles.title_admin}>PAGES OTHER</p>
              <li className={styles.liItem}>
                <Link to="/admin/profile" className="link">
                  <SettingsIcon className={styles.icon} />
                  <span>Thông tin cá nhân</span>
                </Link>
              </li>
              <li className={styles.liItem} onClick={handleMenuClick}>
                <ExitToAppIcon className={styles.icon} />
                <span>Đăng xuất</span>
              </li>
            </>
          )}
        </ul>
      </div>
      {/* Uncomment if you have a bottom section */}
      {/* 
      <div className={styles.bottom}>
        <div className={styles.colorOption}></div>
        <div className={styles.colorOption}></div>
        <div className={styles.colorOption}></div>
      </div> 
      */}
    </div>
  );
};

export default Sidebar;
