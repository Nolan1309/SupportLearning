import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useRefreshToken from '../../../../util/fucntion/useRefreshToken';
import { isTokenExpired } from '../../../../util/fucntion/auth';
import { TextField, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Paper, Button } from "@mui/material";
import { DeleteForever, Restore } from "@mui/icons-material"; // Các icon Material UI
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';  // Để làm việc với đối tượng ngày
import ConfirmModal from "../../../../util/ConfirmModal";

export interface AccountDetailsDTO_V2 {
    id: number; // ID của tài khoản
    fullname: string; // Họ và tên của tài khoản
    email: string; // Email của tài khoản
    phone: string; // Số điện thoại
    gender: string; // Giới tính
    googleId: string; // Google ID nếu tài khoản liên kết Google
    image: string; // Đường dẫn hình ảnh của tài khoản
    isDeleted: boolean; // Trạng thái tài khoản bị xóa
    isGoogleAccount: boolean; // Có phải tài khoản Google không
    birthday: string; // Ngày sinh (định dạng chuỗi)
    createdAt: string; // Ngày tạo tài khoản
    updatedAt: string; // Ngày cập nhật tài khoản
    deletedDate: string; // Ngày tài khoản bị xóa
    roleId: number; // ID vai trò của tài khoản
}

const AccountManagementComponent: React.FC = () => {
    const [accounts, setAccounts] = useState<AccountDetailsDTO_V2[]>([]);
    const [page, setPage] = useState(0);  // Lưu trang hiện tại
    const [size, setSize] = useState(10);  // Lưu số lượng bản ghi mỗi trang
    const [totalPages, setTotalPages] = useState(0);
    const navigate = useNavigate();
    const refresh = useRefreshToken();
    const [searchTerm, setSearchTerm] = useState("");  // Lưu từ khóa tìm kiếm
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);  // Lưu ngày chọn tìm kiếm
    const [isSearch, setIsSearch] = useState(false);

    const [selectedAccount, setSelectedAccount] = useState<number | null>(null); // Khóa học đang được chọn
    const [isModalOpen, setIsModalOpen] = useState(false); // Quản lý trạng thái modal
    const [modalTitle, setModalTitle] = useState(""); // Tiêu đề modal
    const [modalMessage, setModalMessage] = useState(""); // Nội dung thông báo trong modal
    const [action, setAction] = useState<"restore" | "delete" | null>(null); // Hành động xác nhận (restore hoặc delete)

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };
    // Hàm để lọc danh sách khóa học theo ngày xóa
    const filterByDate = (courses: AccountDetailsDTO_V2[]) => {
        if (selectedDate) {
            return accounts.filter(course => {
                // Chuyển đổi ngày xóa sang đối tượng ngày và so sánh
                const deletedDate = course.deletedDate ? dayjs(course.deletedDate) : null;
                return deletedDate && deletedDate.isSame(selectedDate, 'day');
            });
        }
        return courses;
    };
    const handleRestore = (id: number) => {
        setSelectedAccount(id);
        setModalTitle("Khôi phục khóa học");
        setModalMessage("Bạn có chắc chắn muốn khôi phục khóa học này?");
        setAction("restore");
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        setSelectedAccount(id);
        setModalTitle("Xóa vĩnh viễn khóa học");
        setModalMessage("Bạn có chắc chắn muốn xóa vĩnh viễn khóa học này?");
        setAction("delete");
        setIsModalOpen(true);
    };

    const fetchAccountList = async () => {
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
                `${process.env.REACT_APP_SERVER_HOST}/api/account/restore/list-all-accounts?page=${page}&size=${size}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const data = await response.json();
            setAccounts(data.content);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Failed to fetch data", error);
        }
    };
    const fetchAccountListSearch = async () => {
        let token = localStorage.getItem("authToken");

        if (isTokenExpired(token)) {
            token = await refresh();
            if (!token) {
                window.location.href = "/dang-nhap";
                return;
            }
            localStorage.setItem("authToken", token);
        }
        const searchParams = new URLSearchParams({
            fullName: searchTerm || "",
            deletedDate: selectedDate ? selectedDate.format("YYYY-MM-DD") : "",
            page: page.toString(),
            size: size.toString(),
        });

        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/account/restore/list-all/search-accounts?${searchParams.toString()}`
                ,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const data = await response.json();
            setAccounts(data.content);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Failed to fetch accounts", error);
        }
    };

    const RestoreAccountFunction = async () => {
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
            const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/account/restore/${selectedAccount}`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const updatedAccounts = accounts.filter(account => account.id !== selectedAccount);
                setAccounts(updatedAccounts);
                setIsModalOpen(false);
            } else {
                console.error("Failed to restore account");
            }
        } catch (error) {
            console.error("Error occurred while restoring account", error);
        }
    };
    const DeleteAccountFunction = async () => {
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
            const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/account/delete/${selectedAccount}`, {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const updatedAccounts = accounts.filter(account => account.id !== selectedAccount);
                setAccounts(updatedAccounts);
                setIsModalOpen(false); // Close modal
            } else {
                console.error("Failed to delete account");
            }
        } catch (error) {
            console.error("Error occurred while deleting account", error);
        }
    };

    const handleConfirm = async () => {
        if (action === "restore" && selectedAccount !== null) {
            RestoreAccountFunction();
        } else if (action === "delete" && selectedAccount !== null) {
            DeleteAccountFunction();
        }
    };


    const handleCancel = () => {
        setIsModalOpen(false);
    };
    useEffect(() => {
        fetchAccountList();
    }, [page, size]);

    const handleSearchClick = () => {
        if (searchTerm === "" && selectedDate === null) {
            fetchAccountList();
            return;
        }
        fetchAccountListSearch();
    };
    const filteredAccounts = filterByDate(
        accounts.filter(account =>
            account.fullname.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );
    return (
        <div style={{ backgroundColor: 'white', padding: '10px', height: '100%', width: '100%' }}>
            <h2>Danh sách tài khoản đã xóa</h2>

            <div className="row">
                <div className="col-md-8"> <TextField
                    label="Tìm kiếm tài khoản"
                    variant="outlined"
                    fullWidth
                    value={searchTerm}
                    onChange={handleSearchChange}
                    sx={{ marginBottom: "20px" }}
                /></div>
                <div className="col-md-4">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Tìm kiếm theo ngày xóa"
                            value={selectedDate}
                            onChange={(date: Dayjs | null) => setSelectedDate(date)}
                            format="YYYY-MM-DD"
                        />
                    </LocalizationProvider>
                    <Button onClick={handleSearchClick}>Tìm kiếm</Button>
                </div>

            </div>
            <div className="row">
                <div className="col-12">
                    <table style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tên</th>
                                <th>Email</th>
                                <th>Ngày xóa</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAccounts.map((account: any) => (
                                <tr key={account.id}>
                                    <td>{account.id}</td>
                                    <td>{account.fullname}</td>
                                    <td>{account.email}</td>
                                    <td>{account.deletedDate ? account.deletedDate : "Chưa xóa"}</td>
                                    <td>
                                        <IconButton onClick={() => handleRestore(account.id)} color="primary">
                                            <Restore />
                                        </IconButton>

                                        <IconButton onClick={() => handleDelete(account.id)} color="secondary">
                                            <DeleteForever />
                                        </IconButton>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                </div>
            </div>



            <div>
                <button
                    onClick={() => setPage(prev => Math.max(prev - 1, 0))}
                    disabled={page === 0}
                >
                    Previous
                </button>
                <span>Page {page + 1} of {totalPages}</span>
                <button
                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages - 1))}
                    disabled={page === totalPages - 1}
                >
                    Next
                </button>
            </div>

            <ConfirmModal
                isOpen={isModalOpen}
                title={modalTitle}
                message={modalMessage}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </div>
    );
};
export default AccountManagementComponent;
