import React, { useEffect, useState } from "react";
import useRefreshToken from "../../util/fucntion/useRefreshToken";
import { isTokenExpired } from "../../util/fucntion/auth";
import "./payment-history.css";
export interface PaymentHistory {
  paymentId: number;
  paymentDate: string;
  totalPayment: number;
  courseCount: number;
  paymentMethod: string;
}
interface PaymentDetailHistory {
  courseId: number;
  courseTitle: string;
  imageUrl: string;
  price: number;
}

function PayHistory() {
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [paymentDetailHistory, setPaymentDetailHistory] = useState<
    PaymentDetailHistory[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const refresh = useRefreshToken();
  const getUserData = () => {
    const authData = localStorage.getItem("authData");
    if (authData) {
      return JSON.parse(authData);
    }
    return null;
  };
  const user = getUserData();
  const [selectedPayment, setSelectedPayment] = useState<PaymentHistory | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPaymentHistory = async () => {
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
        `${process.env.REACT_APP_SERVER_HOST}/api/payments/summary?accountId=${user.id}&page=${page}&size=${size}`,
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
        setPaymentHistory(data.content || []);
        setTotalTransactions(data.totalElements || 0);
        setTotalAmount(
          data.content.reduce(
            (sum: number, item: PaymentHistory) => sum + item.totalPayment,
            0
          )
        ); // Tính tổng số tiền
      } else {
        console.error("Failed to fetch payment history:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching payment history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentHistory();
  }, [page, size]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0) {
      setPage(newPage);
    }
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
        `${process.env.REACT_APP_SERVER_HOST}/api/payments/course-detail/${paymentId}`,
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

  const handlePaymentClick = (payment: PaymentHistory) => {
    fetchPaymentDetailHistory(payment.paymentId);
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  return (
    <div id="payHistory" className="container-fluid">
      <div className="row mt-4">
        <div className="col-md-6">
          <div className="card text-white bg-primary mb-3">
            <div className="card-header">Tổng số giao dịch</div>
            <div className="card-body">
              <h5 className="card-title">{totalTransactions}</h5>
              <p className="card-text">Tổng số giao dịch đã thực hiện</p>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card text-white bg-success mb-3">
            <div className="card-header">Tổng số tiền</div>
            <div className="card-body">
              <h5 className="card-title">{totalAmount.toLocaleString()} VND</h5>
              <p className="card-text">Tổng số tiền đã thanh toán</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          <div className="card mb-4">
            <div className="card-header">Lịch sử thanh toán</div>
            <div className="card-body">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Ngày thanh toán</th>
                    <th>Số tiền</th>
                    <th>Số lượng khóa học</th>
                    <th>Phương thức thanh toán</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center">
                        Đang tải dữ liệu...
                      </td>
                    </tr>
                  ) : paymentHistory.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center">
                        Không có dữ liệu.
                      </td>
                    </tr>
                  ) : (
                    paymentHistory.map((payment, index) => (
                      <tr
                        key={payment.paymentId}
                        onClick={() => handlePaymentClick(payment)}
                        style={{ cursor: "pointer" }}
                      >
                        <th scope="row">{index + 1 + page * size}</th>
                        <td>
                          {new Date(payment.paymentDate).toLocaleString()}
                        </td>
                        <td>{payment.totalPayment.toLocaleString()} VND</td>
                        <td>{payment.courseCount}</td>
                        <td>{payment.paymentMethod}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <div className="d-flex justify-content-between mt-3">
                <button
                  className="btn btn-primary"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 0}
                >
                  Trang trước
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={paymentHistory.length < size}
                >
                  Trang sau
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && selectedPayment && (
        <div className="modal-payment show d-block" tabIndex={-1} role="dialog">
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
              <div className="modal-payment-body">
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
                        <td style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                          <img
                            src={item.imageUrl}
                            alt=""
                            width={100}
                            height={60}
                          />
                          {item.courseTitle}
                        </td >
                        <td style={{ textAlign: "right" }}>{item.price.toLocaleString()} VND</td>
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PayHistory;
