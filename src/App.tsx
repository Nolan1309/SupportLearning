import React, { useEffect } from "react";
import { ToastContainer, toast } from "react-toastify"; // Import Toastify và toast
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import Index from "./layout/homepage/Index";
import Document from "./layout/document/Document";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Document_Detail from "./layout/document/Document-detail";
import Breadcum from "./layout/util/Breadcum";
import { useState } from "react";
import AccountManagement from "./layout/profile/AccountManagement";
import Loading from "./layout/util/Loading";
import Example_Detail from "./layout/example/Example_Detail";
import Courses from "./layout/course/Courses";
import Blogs from "./layout/blogs/Blogs";
import BlogDetail from "./layout/blogs/BlogDetail";
import Contacts from "./layout/contact/Contacs";
import MainLayout from "./layout/main-dom/MainLayout";
import Login from "./layout/login/Login";
import Register from "./layout/login/Register";
import ForgotPassword from "./layout/login/ForgotPassword";
import CourseDetail from "./layout/course/CourseDetail";
import Example from "./layout/example/Example";
import Search from "./layout/search/Search";
import withAuth from "./layout/DOM/withAuth";
import Cart from "./layout/cart/Cart";
import Checkout from "./layout/checkout/Checkout";
import ConfirmPuchase from "./layout/course/ConfirmPuchase";

import NotificationDetails from "./layout/header-footer/NotificationDetails";
import NotificationDropdown from "./layout/header-footer/NotificationDropdown";
import Rank from "./layout/rank/Rank";
import { jwtDecode } from "jwt-decode";

import Home from "./layout/admin/pages/Home";

import EditDocument from "./layout/admin/components/document/EditDocument";
import UploadDocument from "./layout/admin/components/document/UploadDocument";
import QuestionsList from "./layout/admin/components/question/QuestionsList";
import CourseList from "./layout/admin/components/course/CourseList";

import BranchList from "./layout/admin/components/category/branch/BranchList";
import SubjectList from "./layout/admin/components/category/subject/SubjectList";
import FieldList from "./layout/admin/components/category/field/FieldList";
import AccountList from "./layout/admin/components/account/AccountList";
import PaymentList from "./layout/admin/components/payment/PaymentList";
import Chat from "./layout/admin/components/chat/ChatAdmin";
import Studyres from "./layout/admin/components/studyres/Studyres";

import Profile from "./layout/admin/components/profile/Profile";
import StudentList from "./layout/admin/components/student/StudentList";

import ExamList from "./layout/admin/components/exam/ExamList";

import Result_Course from "./layout/admin/components/course/result_course/Result_Course";
import Test_Admin from "./layout/login/test";
import Header11 from "./layout/header-footer/demo";
import Test_Admin22 from "./layout/login/tesss2";
import { DocumentAdminPage } from "./layout/admin/components/document/DocumentAdmin";
import { PaymentFail } from "./layout/payment/PaymentFail";
import PaymentSuccess from "./layout/payment/PaymentSuccess";
import { LogicPayment } from "./layout/util/LogicPayment";
import BlogCategory from "./layout/blogs/BlogCategory";

import Error403 from "./layout/util/bao-loi-403";
import CoursePlayer from "./layout/course/CoursePlayer";
import demomoi2 from "./layout/util/demomoi2";
import DemoEcrypt from "./layout/util/demomoi2";
import EditAccount from "./layout/admin/components/account/EditAccount";
import AddAccount from "./layout/admin/components/account/AddAccount";
import AddBranch from "./layout/admin/components/category/branch/AddBranch";
import EditBranch from "./layout/admin/components/category/branch/EditBranch";
import AddField from "./layout/admin/components/category/field/AddField";
import EditField from "./layout/admin/components/category/field/EditField";
import AddSubject from "./layout/admin/components/category/subject/AddSubjectList";
import EditSubject from "./layout/admin/components/category/subject/EditSubject";

import CategoryBlog from "./layout/admin/components/category_blog/CategoryBlog";
import EditCategoryBlog from "./layout/admin/components/category_blog/EditCategoryBlog";
import EditQuestion from "./layout/admin/components/question/EditQuestionMultipleChoiceDialog";
import AddQuestions from "./layout/admin/components/question/AddQuestions";
import EditExam from "./layout/admin/components/exam/EditExam";
import AddExam from "./layout/admin/components/exam/AddExam";
import UploadExam from "./layout/admin/components/exam/UploadExam";
import AddCourse from "./layout/admin/components/course/AddCourse";
import EditLesson from "./layout/admin/components/lessons/EditLesson";
import AddLesson from "./layout/admin/components/lessons/AddLesson";
import CategoryCourseList from "./layout/admin/components/category_course/CategoryCourseList";
import AddCategoryCourse from "./layout/admin/components/category_course/AddCategoryCourse";
import UpdateCategoryCourse from "./layout/admin/components/category_course/UpdateCategoryCourse";
import AddCategoryBlog from "./layout/admin/components/category_blog/AddCategoryBlog";
import EditCourse from "./layout/admin/components/course/EditCourse";
import LessonList from "./layout/admin/components/lessons/LessonList";
import CommentList from "./layout/admin/components/comment/CommentList";
import Discount from "./layout/admin/components/discount/DiscountList";
import AddDiscount from "./layout/admin/components/discount/AddDiscount";
import EditDiscount from "./layout/admin/components/discount/EditDiscount";

import NotificationListAdmin from "./layout/admin/components/notification/NotificationListAdmin";
import AddNotification from "./layout/admin/components/notification/AddNotification";
import EditNotification from "./layout/admin/components/notification/EditNotification";
import BlogList from "./layout/admin/components/blog/BlogList";
import AddBlog from "./layout/admin/components/blog/AddBlog";
import EditBlog from "./layout/admin/components/blog/EditBlog";
import ResultPage from "./layout/profile/Component/ComponentResultLearning/ResultPage";
import ResultPageAdmin from "./layout/admin/components/studyres/ResultOfAcc";
import ResetPassword from "./layout/login/ResetPassword";
import HomeLogin from "./layout/login/HomeLogin";
import { WebSocketProvider } from "./service/WebSocketContext";
import Cookies from "js-cookie";
import useRefreshToken from "./layout/util/fucntion/useRefreshToken";
import { isTokenExpired } from "./layout/util/fucntion/auth";
import NotificationList from "./layout/header-footer/NotificationList";
import SettingScheduler from "./layout/admin/components/settingsScheduler/SettingScheduler";
import AddDiscountToCourse from "./layout/admin/components/discount/AddDiscountToCourse";
import DiscountList from "./layout/admin/components/discount/DiscountList";
import AccOfCourse from "./layout/admin/components/studyres/AccOfCourse";
import Backup from "./layout/admin/components/backup/Backup";
import { CoursePageConvert } from "./layout/courseConvert/CoursePageConvert";
import Dashboard from "./layout/admin/components/dashboard/Dashboard";
import Spinner from "./layout/util/Spinner";
import { LoadingProvider } from "./layout/util/LoadingContext";
import ExportPDF from "./layout/admin/components/payment/ExportPDF";
import VerifyOTP from "./layout/login/VerifyOTP";
import ChooseRegisterMethod from "./layout/login/ChooseRegisterMethod";
import VerifyOTPSMS from "./layout/login/VerifyOTPSMS";
import RestoreMain from "./layout/admin/components/restore/RestoreMain";

const ProtectedAccountManagement = withAuth(AccountManagement);
const ProtectedChechOut = withAuth(Checkout);

function App() {
  const refresh = useRefreshToken();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    handleAuth();
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", function () {
      var header = document.querySelector("header");
      if (window.scrollY > 0) {
        header?.classList.add("menu-fixed", "animated", "fadeInDown");
      } else {
        header?.classList.remove("menu-fixed", "animated", "fadeInDown");
      }
    });
    return () => {
      window.removeEventListener("scroll", function () {
        var header = document.querySelector("header");
        if (window.scrollY > 0) {
          header?.classList.add("menu-fixed", "animated", "fadeInDown");
        } else {
          header?.classList.remove("menu-fixed", "animated", "fadeInDown");
        }
      });
    };
  }, []);


  const handleAuth = async () => {
    const jwt = Cookies.get("authToken");
    const refreshToken = Cookies.get("refreshToken");
    const userInfo = Cookies.get("userInfo");

    if (jwt && refreshToken && userInfo) {
      const token = JSON.parse(decodeURIComponent(jwt));
      const user = JSON.parse(decodeURIComponent(userInfo));
      const refreshTokenNew = JSON.parse(decodeURIComponent(refreshToken));

      localStorage.setItem("authToken", token);
      localStorage.setItem("authData", JSON.stringify(user));
      localStorage.setItem("refreshToken", refreshTokenNew);

      Cookies.remove("authToken");
      Cookies.remove("refreshToken");
      Cookies.remove("userInfo");
      setTimeout(() => {
        toast.success("Đăng nhập thành công !");
      }, 1000);
    }
  };

  // useEffect(() => {
  //   window.onerror = function (message, source, lineno, colno, error) {
  //     if (String(message).includes("400")) {
  //       return true; // Chặn lỗi 400 xuất hiện trên console
  //     }
  //   };
  // }, []);




  // if (loading) {
  //   return <div className="loader"></div>;
  // }
  return (
    <WebSocketProvider>
      <LoadingProvider>
        <div className="App">
          <BrowserRouter>
            <Routes>
              <Route
                path="/"
                element={
                  <MainLayout>
                    <Index />
                  </MainLayout>
                }
              />
              <Route
                path="/tim-kiem"
                element={
                  <MainLayout>
                    <Search />
                  </MainLayout>
                }
              />
              <Route
                path="/tai-lieu"
                element={
                  <MainLayout>
                    <Breadcum />
                    <Document />
                  </MainLayout>
                }
              />
              <Route
                path="/tai-lieu/:danhmuc"
                element={
                  <MainLayout>
                    <Breadcum />
                    <Document />
                  </MainLayout>
                }
              />
              <Route
                path="/tai-lieu/:danhmuc/:id"
                element={
                  <MainLayout>
                    <Breadcum />
                    <Document_Detail />
                  </MainLayout>
                }
              />
              {/* <Route
            path="/de-thi"
            element={
              <MainLayout>
                <Breadcum />
                <Example />
              </MainLayout>
            }
          /> */}
              {/* <Route
              path="/de-thi/de-thi-chi-tiet"
              element={
                <MainLayout>
                  <Breadcum />
                  <Example_Detail />
                </MainLayout>
              }
            /> */}
              <Route
                path="/khoa-hoc"
                element={
                  <MainLayout>
                    <Breadcum />
                    <Courses />
                  </MainLayout>
                }
              />
              <Route
                path="/khoa-hoc/:danh-muc"
                element={
                  <MainLayout>
                    <Breadcum />
                    <Courses />
                  </MainLayout>
                }
              />
              <Route
                path="/khoa-hoc/:danh-muc/:id"
                element={
                  <MainLayout>
                    <Breadcum />
                    <CourseDetail />
                  </MainLayout>
                }
              />
              <Route
                path="/khoa-hoc/thanh-toan"
                element={
                  <MainLayout>
                    <Breadcum />
                    <ConfirmPuchase />
                  </MainLayout>
                }
              />
              <Route
                path="/khoa-hoc/thanh-toan/fail"
                element={
                  <MainLayout>
                    <Breadcum />
                    <PaymentFail />
                  </MainLayout>
                }
              />
              <Route
                path="/khoa-hoc/thanh-toan/success"
                element={
                  <MainLayout>
                    <Breadcum />
                    <PaymentSuccess />
                  </MainLayout>
                }
              />
              <Route
                path="/bai-viet"
                element={
                  <MainLayout>
                    <Breadcum />
                    <Blogs />
                  </MainLayout>
                }
              />
              <Route
                path="/bai-viet/danh-muc-bai-viet/:id"
                element={
                  <MainLayout>
                    <Breadcum />
                    <BlogCategory />
                  </MainLayout>
                }
              />
              <Route
                path="/bai-viet/:id"
                element={
                  <MainLayout>
                    <Breadcum />
                    <BlogDetail />
                  </MainLayout>
                }
              />
              <Route
                path="/ho-tro"
                element={
                  <MainLayout>
                    <Breadcum />
                    <Contacts />
                  </MainLayout>
                }
              />
              <Route
                path="/notification-all"
                element={
                  <MainLayout>
                    <NotificationList />
                  </MainLayout>
                }
              />
              <Route
                path="/notification-details/:id"
                element={
                  <MainLayout>
                    <NotificationDetails />
                  </MainLayout>
                }
              />

              <Route path="/dang-nhap" element={<Login />} />

              <Route path="/dang-ky" element={<Register />} />
              <Route path="/dang-ky-method" element={<ChooseRegisterMethod />} />

              <Route path="/verify-otp-email" element={<VerifyOTP />} />
              <Route path="/verify-otp-sms" element={<VerifyOTPSMS />} />
              {/* <Route path="/test" element={<Test_Admin />} />
          <Route path="/test2" element={<Test_Admin22 />} /> */}
              {/* <Route path="/demo" element={<Header11 />} /> */}

              <Route
                path="/demo"
                element={
                  <MainLayout>
                    <Example />
                  </MainLayout>
                }
              />

              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              <Route path="/home" element={<HomeLogin />} />

              <Route path="/bao-loi-403" element={<Error403 />} />

              <Route
                path="/tai-khoan"
                element={
                  <MainLayout>
                    <ProtectedAccountManagement />
                  </MainLayout>
                }
              />
              <Route
                path="/tai-khoan/:menu"
                element={
                  <MainLayout>
                    <ProtectedAccountManagement />
                  </MainLayout>
                }
              />
              <Route
                path="/khoa-hoc-thu/vao-hoc"
                element={<CoursePageConvert />}
              />

              <Route path="/khoa-hoc/vao-hoc" element={<CoursePlayer />} />
              <Route
                path="/khoa-hoc/vao-hoc/video"
                element={<CoursePlayer />}
              />
              <Route path="/khoa-hoc/vao-hoc/test" element={<CoursePlayer />} />
              <Route
                path="/khoa-hoc/vao-hoc/test-chapter"
                element={<CoursePlayer />}
              />
              {/* <Route path="/demomoi" element={<DemoEcrypt/>} /> */}

              {/* Giỏ hàng */}
              <Route
                path="/gio-hang"
                element={
                  <MainLayout>
                    <Breadcum />
                    <Cart />
                  </MainLayout>
                }
              />
              <Route
                path="/thanh-toan/logic"
                element={
                  //   <MainLayout>

                  <LogicPayment />
                  // </MainLayout>
                }
              />
            </Routes>

            <Routes>
              {/* <Route
              path="/admin/tai-lieu"
              element={
                <Home>
                  <DocumentAdminPage />
                </Home>
              }
            /> */}
              <Route
                path="/admin/sua-tai-lieu/:id"
                element={
                  <Home>
                    <EditDocument />
                  </Home>
                }
              />
              <Route
                path="/admin/upload"
                element={
                  <Home>
                    <UploadDocument />
                  </Home>
                }
              />
              <Route
                path="/admin/cau-hoi"
                element={
                  <Home>
                    <QuestionsList />
                  </Home>
                }
              />
              {/* <Route
                path="/admin/edit-question/:id"
                element={
                  <Home>
                    <EditQuestion />
                  </Home>
                }
              /> */}
              {/* <Route
                path="/admin/add-question"
                element={
                  <Home>
                    <AddQuestions />
                  </Home>
                }
              /> */}
              <Route
                path="/admin/bai-kiem-tra"
                element={
                  <Home>
                    <ExamList />
                  </Home>
                }
              />
              {/* <Route
                path="/admin/edit-bai-kiem-tra/:id"
                element={
                  <Home>
                    <EditExam />
                  </Home>
                }
              /> */}
              {/* <Route
                path="/admin/add-bai-kiem-tra"
                element={
                  <Home>
                    <AddExam />
                  </Home>
                }
              /> */}
              <Route
                path="/admin/exams/:id/add-questions"
                element={
                  <Home>
                    <UploadExam />
                  </Home>
                }
              />
              <Route
                path="/admin/khoa-hoc"
                element={
                  <Home>
                    <CourseList />
                  </Home>
                }
              />
              <Route
                path="/admin/add-khoa-hoc"
                element={
                  <Home>
                    <AddCourse />
                  </Home>
                }
              />
              <Route
                path="/admin/chi-tiet-khoa-hoc/:id"
                element={
                  <Home>
                    <EditCourse />
                  </Home>
                }
              />
              <Route
                path="/admin/chi-tiet-khoa-hoc/ket-qua-khoa-hoc"
                element={
                  <Home>
                    <Result_Course />
                  </Home>
                }
              />
              {/* <Route
              path="/admin/bai-hoc"
              element={
                <Home>
                  <LessonList />
                </Home>
              }
            /> */}
              {/* <Route
                path="/admin/edit-bai-hoc/:id"
                element={
                  <Home>
                    <EditLesson />
                  </Home>
                }
              /> */}
              <Route
                path="/admin/add-bai-hoc"
                element={
                  <Home>
                    <AddLesson />
                  </Home>
                }
              />
              <Route
                path="/admin/category-branch"
                element={
                  <Home>
                    <BranchList />
                  </Home>
                }
              />
              <Route
                path="/admin/add-category-branch"
                element={
                  <Home>
                    <AddBranch />
                  </Home>
                }
              />
              <Route
                path="/admin/edit-category-branch/:id"
                element={
                  <Home>
                    <EditBranch />
                  </Home>
                }
              />
              <Route
                path="/admin/category-field"
                element={
                  <Home>
                    <FieldList />
                  </Home>
                }
              />
              <Route
                path="/admin/add-category-field"
                element={
                  <Home>
                    <AddField />
                  </Home>
                }
              />
              <Route
                path="/admin/edit-category-field/:id"
                element={
                  <Home>
                    <EditField />
                  </Home>
                }
              />
              <Route
                path="/admin/category-subject"
                element={
                  <Home>
                    <SubjectList />
                  </Home>
                }
              />
              <Route
                path="/admin/add-category-subject"
                element={
                  <Home>
                    <AddSubject />
                  </Home>
                }
              />
              <Route
                path="/admin/edit-category-subject/:id"
                element={
                  <Home>
                    <EditSubject />
                  </Home>
                }
              />
              <Route
                path="/admin/category-blog"
                element={
                  <Home>
                    <CategoryBlog />
                  </Home>
                }
              />
              <Route
                path="/admin/upload-category-blog"
                element={
                  <Home>
                    {/* <AddCategoryBlog /> */}
                    <AddCategoryBlog />
                  </Home>
                }
              />
              <Route
                path="/admin/edit-category-blog/:id"
                element={
                  <Home>
                    <EditCategoryBlog />
                  </Home>
                }
              />
              <Route
                path="/admin/category-course"
                element={
                  <Home>
                    <CategoryCourseList />
                  </Home>
                }
              />
              <Route
                path="/admin/add-category-course"
                element={
                  <Home>
                    <AddCategoryCourse />
                  </Home>
                }
              />
              <Route
                path="/admin/edit-category-course/:id"
                element={
                  <Home>
                    <UpdateCategoryCourse />
                  </Home>
                }
              />
              <Route
                path="/admin/tai-khoan"
                element={
                  <Home>
                    <AccountList />
                  </Home>
                }
              />
              <Route
                path="/admin/add-tai-khoan"
                element={
                  <Home>
                    <AddAccount />
                  </Home>
                }
              />
              <Route
                path="/admin/edit-tai-khoan/:id"
                element={
                  <Home>
                    <EditAccount />
                  </Home>
                }
              />
              <Route
                path="/admin/thanh-toan"
                element={
                  <Home>
                    <PaymentList />
                  </Home>
                }
              />
              <Route
                path="/admin/thanh-toan2"
                element={
                  <Home>
                    <ExportPDF />
                  </Home>
                }
              />
              <Route
                path="/admin/comment"
                element={
                  <Home>
                    <CommentList />
                  </Home>
                }
              />
              <Route
                path="/admin/blog"
                element={
                  <Home>
                    <BlogList />
                  </Home>
                }
              />
              <Route
                path="/admin/edit-blog/:id"
                element={
                  <Home>
                    <EditBlog />
                  </Home>
                }
              />
              <Route
                path="/admin/add-blog"
                element={
                  <Home>
                    <AddBlog />
                  </Home>
                }
              />
              {/* <Route
              path="/admin/login"
              element={
                <Home>
                  <Login />
                </Home>
              }
            /> */}
              <Route
                path="/admin/chat"
                element={
                  <Home>
                    <Chat />
                  </Home>
                }
              />
              <Route
                path="/admin/restore"
                element={
                  <Home>
                    <RestoreMain />
                  </Home>
                }
              />
              <Route
                path="/admin/backup"
                element={
                  <Home>
                    <Backup />
                  </Home>
                }
              />
              <Route
                path="/admin/hoc-tap"
                element={
                  <Home>
                    <Studyres />
                  </Home>
                }
              />
              <Route
                path="/admin/hoc-tap/chi-tiet-hoc-vien/:courseId"
                element={
                  <Home>
                    <AccOfCourse />
                  </Home>
                }
              />
              <Route
                path="/admin/hoc-tap/chi-tiet-hoc-vien/ket-qua/:id"
                element={
                  <Home>
                    <ResultPageAdmin />
                  </Home>
                }
              />
              <Route
                path="/admin/blog"
                element={
                  <Home>
                    <BlogList />
                  </Home>
                }
              />
              {/* <Route
            path="/admin/kiem-tra"
            element={
              <Home>
                <Examres />
              </Home>
            }
          /> */}
              <Route
                path="/admin/discount"
                element={
                  <Home>
                    <DiscountList />
                  </Home>
                }
              />
              <Route
                path="/admin/edit-discount/:id"
                element={
                  <Home>
                    <EditDiscount />
                  </Home>
                }
              />
              <Route
                path="/admin/add-discount"
                element={
                  <Home>
                    <AddDiscount />
                  </Home>
                }
              />
              <Route
                path="/admin/add-discount-course/:discountId"
                element={
                  <Home>
                    <AddDiscountToCourse />
                  </Home>
                }
              />
              <Route
                path="/admin/thong-bao"
                element={
                  <Home>
                    <NotificationListAdmin />
                  </Home>
                }
              />
              <Route
                path="/admin/edit-thong-bao/:id"
                element={
                  <Home>
                    <EditNotification />
                  </Home>
                }
              />
              <Route
                path="/admin/add-thong-bao"
                element={
                  <Home>
                    <AddNotification />
                  </Home>
                }
              />
              <Route
                path="/admin/profile"
                element={
                  <Home>
                    <Profile />
                  </Home>
                }
              />
              <Route
                path="/admin/hoc-vien"
                element={
                  <Home>
                    <StudentList />
                  </Home>
                }
              />
              <Route
                path="/admin/setting"
                element={
                  <Home>
                    <SettingScheduler />
                  </Home>
                }
              />
              <Route
                path="/admin/thong-ke"
                element={
                  <Home>
                    <Dashboard />
                  </Home>
                }
              />
              <Route
                path="/admin"
                element={
                  <Home>
                    <DocumentAdminPage />
                  </Home>
                }
              />
            </Routes>
          </BrowserRouter>
        </div>
      </LoadingProvider>
    </WebSocketProvider>
  );
}

export default App;
