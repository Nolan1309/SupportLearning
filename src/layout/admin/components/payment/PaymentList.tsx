// import React, { useState, useEffect } from "react";
// import {
//   TextField,
//   Table,
//   TableHead,
//   TableRow,
//   TableCell,
//   TableBody,
//   IconButton,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   List,
//   ListItem,
//   ListItemText,
//   Button,
//   Paper,
//   Divider,
// } from "@material-ui/core";
// import { Edit, Delete, Visibility } from "@material-ui/icons";
// import { useNavigate } from "react-router-dom";
// import styles from "./paymentList.module.scss";
// import {
//   ADMIN_GET_PAYMENT,
//   ADMIN_GET_PAYMENTDETAIL,
//   ADMIN_DELETE_PAYMENT,
// } from "../../../../api/api";
// import RequireAdmin from "../../../DOM/RequireAdmin";
// import { TablePagination } from "@material-ui/core";
// import { isTokenExpired } from "../../../util/fucntion/auth";
// import useRefreshToken from "../../../util/fucntion/useRefreshToken";
// interface PaymentDetailHistory {
//   courseId: number;
//   courseTitle: string;
//   imageUrl: string;
//   price: number;
// }
// interface PaymentHistory {
//   paymentId: number;
//   paymentDate: string;
//   totalPayment: number;
//   courseCount: number;
//   paymentMethod: string;
// }
// const PaymentList: React.FC = () => {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
//   const [selectedPayment, setSelectedPayment] = useState<any>(null);
//   const [showDetail, setShowDetail] = useState(false);
//   const [payments, setPayments] = useState<any[]>([]);
//   const [courseDetails, setCourseDetails] = useState<any[]>([]);
//   const [showCourseDetails, setShowCourseDetails] = useState(false);
//   const [page, setPage] = useState(0); // Trang hiện tại
//   const [rowsPerPage, setRowsPerPage] = useState(10); // Số bản ghi mỗi trang
//   const [totalElements, setTotalElements] = useState(0); // Tổng số bản ghi
//   const navigate = useNavigate();
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const getUserData = () => {
//     const authData = localStorage.getItem("authData");
//     if (authData) {
//       return JSON.parse(authData);
//     }
//     return null;
//   };
//   const refresh = useRefreshToken();
//   const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
//   const [paymentDetailHistory, setPaymentDetailHistory] = useState<
//     PaymentDetailHistory[]
//   >([]);
//   const user = getUserData();
//   const token = localStorage.getItem("authToken");

//   // Gọi API để lấy dữ liệu thanh toán bằng phân trang
//   const fetchPayments = async (page: number, size: number) => {
//     try {
//       const response = await fetch(
//         `${ADMIN_GET_PAYMENT}?page=${page}&size=${size}`,
//         {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Network response was not ok");
//       }

//       const data = await response.json();
//       setPayments(data.content); // Lấy danh sách thanh toán
//       setTotalElements(data.totalElements); // Lấy tổng số bản ghi
//     } catch (error) {
//       console.error("Failed to fetch payments", error);
//     }
//   };

//   useEffect(() => {
//     fetchPayments(page, rowsPerPage);
//   }, [page, rowsPerPage]);

//   const handleDelete = async (id: number) => {
//     try {
//       const response = await fetch(`${ADMIN_DELETE_PAYMENT}/${id}`, {
//         method: "DELETE",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (!response.ok) {
//         throw new Error("Failed to delete payment");
//       }

//       // Cập nhật lại danh sách sau khi xóa thành công
//       setPayments(payments.filter((p) => p.id !== id));
//       setTotalElements((prev) => prev - 1);
//     } catch (error) {
//       console.error("Failed to delete payment", error);
//     }
//   };

//   const handleSort = () => {
//     const newSortDirection = sortDirection === "asc" ? "desc" : "asc";
//     setSortDirection(newSortDirection);

//     const sortedPayments = [...payments].sort((a, b) => {
//       if (a.buyerName < b.buyerName) return newSortDirection === "asc" ? -1 : 1;
//       if (a.buyerName > b.buyerName) return newSortDirection === "asc" ? 1 : -1;
//       return 0;
//     });

//     setPayments(sortedPayments);
//   };

//   const handleViewCourseDetails = async (paymentId: number) => {
//     try {
//       const response = await fetch(ADMIN_GET_PAYMENTDETAIL(paymentId), {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (!response.ok) {
//         throw new Error("Network response was not ok");
//       }

//       const data = await response.json();
//       setCourseDetails(data);
//       setShowCourseDetails(true);
//     } catch (error) {
//       console.error("Failed to fetch course details", error);
//     }
//   };

//   const handleCloseCourseDetails = () => {
//     setShowCourseDetails(false);
//     setCourseDetails([]);
//   };

//   const handlePageChange = (event: any, newPage: number) => {
//     setPage(newPage);
//   };

//   const handleRowsPerPageChange = (
//     event: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0); // Reset về trang đầu tiên khi thay đổi số hàng mỗi trang
//   };

//   const fetchPaymentDetailHistory = async (paymentId: number) => {
//     setLoading(true);
//     let token = localStorage.getItem("authToken");

//     if (isTokenExpired(token)) {
//       token = await refresh();
//       if (!token) {
//         window.location.href = "/dang-nhap";
//         return;
//       }
//       localStorage.setItem("authToken", token);
//     }
//     try {
//       const response = await fetch(
//         `${process.env.REACT_APP_SERVER_HOST}/api/payments/course-detail-admin/${paymentId}`,
//         {
//           method: "GET",
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       if (response.ok) {
//         const data = await response.json();
//         setPaymentDetailHistory(data);
//       }
//     } catch (error) {
//       console.error("Error fetching payment history:", error);
//     } finally {
//       setLoading(false);
//     }
//   };
//   const handlePaymentClick = (id : number , payment: PaymentHistory) => {
//     fetchPaymentDetailHistory(id);
//     setSelectedPayment(payment);
//     setIsModalOpen(true);
//   };

//   return (
//     <Paper>
//       <div className={styles.Container}>
//         <h2 className={styles.title}>Danh Sách Thanh Toán</h2>
//         <div className={styles.headContainer}>
//           <TextField
//             className={styles.searchField}
//             label="Tìm kiếm"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             variant="outlined"
//             size="small"
//           />
//         </div>
//         <Divider style={{ marginBottom: "20px" }} />
//         <div className={styles.tableContainer}>
//           <Table className={styles.table} stickyHeader>
//             <TableHead>
//               <TableRow>
//                 <TableCell
//                   className={styles.headerCell}
//                   onClick={handleSort}
//                   style={{ cursor: "pointer" }}
//                 >
//                   Người mua {sortDirection === "asc" ? "↑" : "↓"}
//                 </TableCell>
//                 <TableCell className={styles.headerCell}>Tổng tiền</TableCell>
//                 <TableCell className={styles.headerCell}>
//                   Ngày thanh toán
//                 </TableCell>
//                 <TableCell className={styles.headerCell}>
//                   Phương thức thanh toán
//                 </TableCell>
//                 <TableCell className={styles.headerCell}>Hành động</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {payments
//                 .filter((p) =>
//                   p.buyerName.toLowerCase().includes(searchTerm.toLowerCase())
//                 )
//                 .map((payment) => (
//                   <TableRow
//                     key={payment.id}
//                     onClick={() => handlePaymentClick(payment.id,payment)}
//                     style={{ cursor: "pointer" }}
//                   >
//                     <TableCell>{payment.buyerName}</TableCell>
//                     <TableCell>{payment.totalPayment}</TableCell>
//                     <TableCell>
//                       {new Date(payment.paymentDate).toLocaleDateString()}
//                     </TableCell>
//                     <TableCell>{payment.paymentMethod}</TableCell>
//                     <TableCell>
//                       <IconButton
//                         onClick={() => handleViewCourseDetails(payment.id)}
//                       >
//                         <Visibility />
//                       </IconButton>
//                       <IconButton
//                         onClick={() => {
//                           if (
//                             window.confirm(
//                               "Bạn có chắc chắn muốn xóa thanh toán này?"
//                             )
//                           ) {
//                             handleDelete(payment.id);
//                           }
//                         }}
//                       >
//                         <Delete />
//                       </IconButton>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//             </TableBody>
//           </Table>
//         </div>

//         {/* Phân trang */}
//         <TablePagination
//           rowsPerPageOptions={[50, 100, 200]}
//           component="div"
//           count={totalElements}
//           rowsPerPage={rowsPerPage}
//           page={page}
//           onPageChange={handlePageChange}
//           onRowsPerPageChange={handleRowsPerPageChange}
//           labelRowsPerPage="Số hàng mỗi trang:"
//         />

//         {/* Popup hiển thị chi tiết khóa học */}
//         {/* <Dialog open={showCourseDetails} onClose={handleCloseCourseDetails}>
//           <DialogTitle>Chi Tiết</DialogTitle>
//           <DialogContent>
//             <List>
//               {courseDetails.map((course, index) => (
//                 <ListItem key={index}>
//                   <ListItemText primary={course.courseName} secondary={`Giá: ${course.price}`} />
//                 </ListItem>
//               ))}
//             </List>
//           </DialogContent>
//         </Dialog> */}
//         {isModalOpen && selectedPayment && (
//           <div
//             className="modal-payment show d-block"
//             tabIndex={-1}
//             role="dialog"
//           >
//             <div className="modal-payment-dialog" role="document">
//               <div className="modal-payment-content payment-history">
//                 <div className="modal-payment-header">
//                   <h5 className="modal-payment-title">Chi tiết giao dịch</h5>
//                   <button
//                     type="button"
//                     className="btn-close"
//                     aria-label="Close"
//                     onClick={() => setIsModalOpen(false)}
//                   ></button>
//                 </div>
//                 <div className="modal-payment-body">
//                   <h3 style={{ textAlign: "center" }}>Chi tiết giao dịch</h3>

//                   <p>
//                     <strong>Người mua:</strong> {user.fullname}
//                   </p>
//                   <p>
//                     <strong>Số lượng:</strong> {selectedPayment.courseCount}
//                   </p>
//                   <p>
//                     <strong>Ngày thanh toán:</strong>{" "}
//                     {new Date(selectedPayment.paymentDate).toLocaleString()}
//                   </p>
//                   <p>
//                     <strong>Phương thức thanh toán:</strong>{" "}
//                     {selectedPayment.paymentMethod}
//                   </p>
//                   <table className="table table-striped table-hover">
//                     <thead>
//                       <tr>
//                         <th style={{ textAlign: "center" }}>STT</th>
//                         <th style={{ textAlign: "center" }}>Khóa học</th>
//                         <th style={{ textAlign: "center" }}>Giá</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {paymentDetailHistory.map((item, index) => (
//                         <tr>
//                           <th style={{ textAlign: "center" }}>{index + 1}</th>
//                           <td
//                             style={{
//                               display: "flex",
//                               alignItems: "center",
//                               justifyContent: "center",
//                               gap: "10px",
//                             }}
//                           >
//                             <img
//                               src={item.imageUrl}
//                               alt=""
//                               width={100}
//                               height={60}
//                             />
//                             {item.courseTitle}
//                           </td>
//                           <td style={{ textAlign: "right" }}>
//                             {item.price.toLocaleString()} VND
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>

//                   <p style={{ textAlign: "right" }}>
//                     <strong>Tổng tiền:</strong>{" "}
//                     {selectedPayment.totalPayment.toLocaleString()} VND
//                   </p>
//                 </div>
//                 <div className="modal-payment-footer">
//                   <button
//                     type="button"
//                     className="btn btn-secondary"
//                     onClick={() => setIsModalOpen(false)}
//                   >
//                     Đóng
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </Paper>
//   );
// };
// export const RequestAdminURL = RequireAdmin(PaymentList);
// export default PaymentList;
import React, { useState, useEffect, useRef } from "react";
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
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import { Edit, Delete, Visibility } from "@material-ui/icons";
import { useNavigate } from "react-router-dom";
import styles from "./paymentList.module.scss";
import {
  ADMIN_GET_PAYMENT,
  ADMIN_GET_PAYMENTDETAIL,
  ADMIN_DELETE_PAYMENT,
} from "../../../../api/api";
import RequireAdmin from "../../../DOM/RequireAdmin";
import { TablePagination } from "@material-ui/core";
import { isTokenExpired } from "../../../util/fucntion/auth";
import useRefreshToken from "../../../util/fucntion/useRefreshToken";
// import chroma from 'chroma-js';


interface PaymentDetailHistory {
  courseId: number;
  courseTitle: string;
  imageUrl: string;
  price: number;
}
interface PaymentHistory {
  paymentId: number;
  paymentDate: string;
  totalPayment: number;
  courseCount: number;
  paymentMethod: string;
}
const PaymentList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
  const [courseDetails, setCourseDetails] = useState<any[]>([]);
  const [showCourseDetails, setShowCourseDetails] = useState(false);
  const [page, setPage] = useState(0); // Trang hiện tại
  const [rowsPerPage, setRowsPerPage] = useState(10); // Số bản ghi mỗi trang
  const [totalElements, setTotalElements] = useState(0); // Tổng số bản ghi
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const getUserData = () => {
    const authData = localStorage.getItem("authData");
    if (authData) {
      return JSON.parse(authData);
    }
    return null;
  };
  const refresh = useRefreshToken();
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [paymentDetailHistory, setPaymentDetailHistory] = useState<
    PaymentDetailHistory[]
  >([]);
  const user = getUserData();
  const token = localStorage.getItem("authToken");



  const handleExportPDF = () => {
    const input = printRef.current;
    if (input) {
      html2canvas(input, { scale: 2 })
        .then((canvas) => {
          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF("p", "mm", "a4");
          const imgProps = pdf.getImageProperties(imgData);
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
          pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
          const formattedDate = new Date(selectedPayment.paymentDate)
            .toISOString()
            .split("T")[0];
          pdf.save(`ChiTietGiaoDich_${formattedDate}.pdf`);
        })
        .catch((err) => {
          console.error("Error generating PDF", err);
        });
    }
  };

  // Gọi API để lấy dữ liệu thanh toán bằng phân trang
  const fetchPayments = async (page: number, size: number) => {
    try {
      const response = await fetch(
        `${ADMIN_GET_PAYMENT}?page=${page}&size=${size}`,
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
      setPayments(data.content); // Lấy danh sách thanh toán
      setTotalElements(data.totalElements); // Lấy tổng số bản ghi
    } catch (error) {
      console.error("Failed to fetch payments", error);
    }
  };

  useEffect(() => {
    fetchPayments(page, rowsPerPage);
  }, [page, rowsPerPage]);

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`${ADMIN_DELETE_PAYMENT}/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete payment");
      }

      // Cập nhật lại danh sách sau khi xóa thành công
      setPayments(payments.filter((p) => p.id !== id));
      setTotalElements((prev) => prev - 1);
    } catch (error) {
      console.error("Failed to delete payment", error);
    }
  };

  const handleSort = () => {
    const newSortDirection = sortDirection === "asc" ? "desc" : "asc";
    setSortDirection(newSortDirection);

    const sortedPayments = [...payments].sort((a, b) => {
      if (a.buyerName < b.buyerName) return newSortDirection === "asc" ? -1 : 1;
      if (a.buyerName > b.buyerName) return newSortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setPayments(sortedPayments);
  };

  const handleViewCourseDetails = async (paymentId: number) => {
    try {
      const response = await fetch(ADMIN_GET_PAYMENTDETAIL(paymentId), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setCourseDetails(data);
      setShowCourseDetails(true);
    } catch (error) {
      console.error("Failed to fetch course details", error);
    }
  };

  const handleCloseCourseDetails = () => {
    setShowCourseDetails(false);
    setCourseDetails([]);
  };

  const handlePageChange = (event: any, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset về trang đầu tiên khi thay đổi số hàng mỗi trang
  };

  const fetchPaymentDetailHistory = async (paymentId: number) => {
    setLoading(true);
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
        `${process.env.REACT_APP_SERVER_HOST}/api/payments/course-detail-admin/${paymentId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPaymentDetailHistory(data);
      }
    } catch (error) {
      console.error("Error fetching payment history:", error);
    } finally {
      setLoading(false);
    }
  };
  const handlePaymentClick = (id: number, payment: PaymentHistory) => {
    fetchPaymentDetailHistory(id);
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  return (
    <Paper>
      <div className={styles.Container}>
        <h2 className={styles.title}>Danh Sách Thanh Toán</h2>
        <div className={styles.headContainer}>
          <TextField
            className={styles.searchField}
            label="Tìm kiếm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            size="small"
          />
        </div>
        <Divider style={{ marginBottom: "20px" }} />
        <div className={styles.tableContainer}>
          <Table className={styles.table} stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell
                  className={styles.headerCell}
                  onClick={handleSort}
                  style={{ cursor: "pointer" }}
                >
                  Người mua {sortDirection === "asc" ? "↑" : "↓"}
                </TableCell>
                <TableCell className={styles.headerCell}>Tổng tiền</TableCell>
                <TableCell className={styles.headerCell}>
                  Ngày thanh toán
                </TableCell>
                <TableCell className={styles.headerCell}>
                  Phương thức thanh toán
                </TableCell>
                <TableCell className={styles.headerCell}>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments
                .filter((p) =>
                  p.buyerName.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((payment) => (
                  <TableRow
                    key={payment.id}
                    onClick={() => handlePaymentClick(payment.id, payment)}
                    style={{ cursor: "pointer" }}
                  >
                    <TableCell>{payment.buyerName}</TableCell>
                    <TableCell>{payment.totalPayment}</TableCell>
                    <TableCell>
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{payment.paymentMethod}</TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleViewCourseDetails(payment.id)}
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        onClick={() => {
                          if (
                            window.confirm(
                              "Bạn có chắc chắn muốn xóa thanh toán này?"
                            )
                          ) {
                            handleDelete(payment.id);
                          }
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>

        {/* Phân trang */}
        <TablePagination
          rowsPerPageOptions={[50, 100, 200]}
          component="div"
          count={totalElements}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          labelRowsPerPage="Số hàng mỗi trang:"
        />

        {/* Popup hiển thị chi tiết khóa học */}
        {/* <Dialog open={showCourseDetails} onClose={handleCloseCourseDetails}>
          <DialogTitle>Chi Tiết</DialogTitle>
          <DialogContent>
            <List>
              {courseDetails.map((course, index) => (
                <ListItem key={index}>
                  <ListItemText primary={course.courseName} secondary={`Giá: ${course.price}`} />
                </ListItem>
              ))}
            </List>
          </DialogContent>
        </Dialog> */}
        {isModalOpen && selectedPayment && (
          <div
            className="modal-payment show d-block"
            tabIndex={-1}
            role="dialog"
          >
            <div className="modal-payment-dialog" role="document">
              <div className="modal-payment-content payment-history">
                <div className="modal-payment-header">
                  <h5 className="modal-payment-title">Chi tiết giao dịch</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => setIsModalOpen(false)}
                  ></button>
                </div>
                <div className="modal-payment-body" ref={printRef}>
                  <h3 style={{ textAlign: "center" }}>Chi tiết giao dịch</h3>

                  <p>
                    <strong>Người mua:</strong> {user.fullname}
                  </p>
                  <p>
                    <strong>Số lượng:</strong> {selectedPayment.courseCount}
                  </p>
                  <p>
                    <strong>Ngày thanh toán:</strong>{" "}
                    {new Date(selectedPayment.paymentDate).toLocaleString()}
                  </p>
                  <p>
                    <strong>Phương thức thanh toán:</strong>{" "}
                    {selectedPayment.paymentMethod}
                  </p>
                  <table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th style={{ textAlign: "center" }}>STT</th>
                        <th style={{ textAlign: "center" }}>Khóa học</th>
                        <th style={{ textAlign: "center" }}>Giá</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentDetailHistory.map((item, index) => (
                        <tr>
                          <th style={{ textAlign: "center" }}>{index + 1}</th>
                          <td
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "10px",
                            }}
                          >
                            <img
                              src={item.imageUrl}
                              alt=""
                              width={100}
                              height={60}
                            />
                            {item.courseTitle}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            {item.price.toLocaleString()} VND
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <p style={{ textAlign: "right" }}>
                    <strong>Tổng tiền:</strong>{" "}
                    {selectedPayment.totalPayment.toLocaleString()} VND
                  </p>
                </div>
                <div className="modal-payment-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Đóng
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleExportPDF}
                  >
                    Xuất PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Paper>
  );
};
export const RequestAdminURL = RequireAdmin(PaymentList);
export default PaymentList;
