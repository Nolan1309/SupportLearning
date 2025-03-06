import React, { useState, useEffect } from "react";
import {
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  CircularProgress,
  FormHelperText,
  Paper,
  Typography,
  Box,
} from "@mui/material";
import CloudUpload from "@mui/icons-material/CloudUpload";
import { useNavigate } from "react-router-dom";
import {
  ADMIN_DOCUMENT_GET_CATEGORY_LEVEL1,
  ADMIN_GET_CATEGORY_PARENT_ID,
  ADMIN_POST_DOCUMENT,
} from "../../../../api/api";
import ConvertApi from "convertapi-js";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Set the path to the worker from the public folder
GlobalWorkerOptions.workerSrc = "/pdfjs-dist/build/pdf.worker.min.mjs";

interface CategoryLevel {
  id: number;
  name: string;
  category: string | null;
  level: number;
  type: string;
}

const UploadDocument: React.FC = () => {
  const [mainCategory, setMainCategory] = useState<number | "">("");
  const [subCategory, setSubCategory] = useState<number | "">("");
  const [subSubCategory, setSubSubCategory] = useState<number | "">("");
  const [file, setFile] = useState<File | null>(null);
  const [pdfImage, setPdfImage] = useState<File | null>(null);

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const [categoriesLevel1, setCategoriesLevel1] = useState<CategoryLevel[]>([]);
  const [subCategories, setSubCategories] = useState<CategoryLevel[]>([]);
  const [subSubCategories, setSubSubCategories] = useState<CategoryLevel[]>([]);

  const [selectedMainCategoryId, setSelectedMainCategoryId] = useState<
    number | null
  >(null);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<
    number | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const token = localStorage.getItem("authToken");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategoriesLevel1 = async () => {
      try {
        const response = await fetch(ADMIN_DOCUMENT_GET_CATEGORY_LEVEL1, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.length === 0) {
            setWarning("Không có lĩnh vực nào được tìm thấy.");
          } else {
            const filteredLevel1 = data.filter(
              (category: CategoryLevel) => category.type === "document"
            );
            setCategoriesLevel1(filteredLevel1);
          }
        } else {
          const errorText = await response.text();
          throw new Error(
            `Failed to fetch categories level 1. Status: ${response.status}. Response: ${errorText}`
          );
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        setError(errorMessage);
        console.error("Failed to fetch categories level 1:", errorMessage);
      }
    };
    fetchCategoriesLevel1();
  }, [token]);
  useEffect(() => {
    const fetchSubCategories = async () => {
      if (selectedMainCategoryId !== null) {
        try {
          const response = await fetch(
            ADMIN_GET_CATEGORY_PARENT_ID(selectedMainCategoryId),
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (data.length === 0) {
              setWarning("Không có ngành nào được tìm thấy cho lĩnh vực này.");
            } else {
              const filteredLevel2 = data.filter(
                (category: CategoryLevel) => category.type === "document"
              );
              setSubCategories(filteredLevel2);
            }
          } else {
            const errorText = await response.text();
            throw new Error(
              `Failed to fetch subcategories. Status: ${response.status}. Response: ${errorText}`
            );
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";
          setError(errorMessage);
          console.error("Failed to fetch subcategories:", errorMessage);
        }
      }
    };
    fetchSubCategories();
  }, [selectedMainCategoryId, token]);
  useEffect(() => {
    const fetchSubSubCategories = async () => {
      if (selectedSubCategoryId !== null) {
        try {
          const response = await fetch(
            ADMIN_GET_CATEGORY_PARENT_ID(selectedSubCategoryId),
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (data.length === 0) {
              setWarning("Không có môn học nào được tìm thấy cho ngành này.");
            } else {
              const filteredLevel3 = data.filter(
                (category: CategoryLevel) => category.type === "document"
              );
              setSubSubCategories(filteredLevel3);
            }
          } else {
            const errorText = await response.text();
            throw new Error(
              `Failed to fetch sub-subcategories. Status: ${response.status}. Response: ${errorText}`
            );
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";
          setError(errorMessage);
          console.error("Failed to fetch sub-subcategories:", errorMessage);
        }
      }
    };
    fetchSubSubCategories();
  }, [selectedSubCategoryId, token]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target && event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const createThumbnailFromPDFFile = async (file: File) => {
    try {
      const fileUrl = URL.createObjectURL(file);
      const response = await fetch(fileUrl);
      const arrayBuffer = await response.arrayBuffer();
      const typedArray = new Uint8Array(arrayBuffer);

      const pdf = await getDocument({ data: typedArray }).promise;
      const firstPage = await pdf.getPage(1);

      const viewport = firstPage.getViewport({ scale: 0.2 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (canvas && context) {
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await firstPage.render({ canvasContext: context, viewport }).promise;

        const imageBlob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((blob) => {
            console.log("Blob created:", blob); // Check if blob is created
            resolve(blob);
          }, "image/png");
        });

        if (imageBlob) {
          const imageFile = new File([imageBlob], "thumbnail.png", {
            type: "image/png",
          });
          setPdfImage(imageFile); // Set the file in state
        } else {
          console.error("Failed to create Blob from canvas");
          setPdfImage(null);
        }
      } else {
        console.error("Failed to create canvas or get context");
      }

      URL.revokeObjectURL(fileUrl);
    } catch (error) {
      console.error("Error fetching or processing PDF:", error);
    }
  };

  useEffect(() => {
    const uploadDocument = async () => {
      if (
        pdfImage &&
        file &&
        title.trim() !== "" &&
        description.trim() !== "" &&
        subSubCategory !== ""
      ) {
        const formData = new FormData();
        formData.append("file", file); // Use the actual file object here
        formData.append("title", title);
        formData.append("description", description);
        formData.append("categoryId", subSubCategory.toString());
        formData.append("thumbnail", pdfImage, "thumbnail.png");

        try {
          const uploadResponse = await fetch(ADMIN_POST_DOCUMENT, {
            method: "POST",
            body: formData,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            throw new Error(
              `Tải tài liệu lên thất bại. Trạng thái: ${uploadResponse.status}. Phản hồi: ${errorText}`
            );
          }

          const result = await uploadResponse.json();
          toast.success("Tải tài liệu lên thành công!");
          navigate("/admin");
        } catch (error) {
          console.error("Lỗi khi tải tài liệu lên:", error);
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Tải tài liệu lên thất bại.";
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } else {
        // Optional: Provide feedback if required data is missing
        if (!pdfImage) {
          setWarning("Không thể tải lên tài liệu. Thiếu hình ảnh thumbnail.");
          toast.warn("Không thể tải lên tài liệu. Thiếu hình ảnh thumbnail.");
        }
      }
    };

    if (pdfImage) {
      uploadDocument();
    }
  }, [pdfImage, file, title, description, subSubCategory, token, navigate]);

  const handleUpload = async () => {
    let validationPassed = true;

    // Reset previous errors and warnings
    setError(null);
    setWarning(null);

    // Validate Title
    if (!title.trim()) {
      setError("Vui lòng nhập tiêu đề tài liệu.");
      toast.error("Vui lòng nhập tiêu đề tài liệu.");
      validationPassed = false;
    }

    // Validate Description
    if (!description.trim()) {
      setError("Vui lòng nhập mô tả tài liệu.");
      toast.error("Vui lòng nhập mô tả tài liệu.");
      validationPassed = false;
    }

    // Validate Main Category
    if (mainCategory === "") {
      setError("Vui lòng chọn lĩnh vực.");
      toast.error("Vui lòng chọn lĩnh vực.");
      validationPassed = false;
    }

    // Validate Sub Category
    if (subCategory === "") {
      setError("Vui lòng chọn ngành.");
      toast.error("Vui lòng chọn ngành.");
      validationPassed = false;
    }

    // Validate Sub-Sub Category
    if (subSubCategory === "") {
      setError("Vui lòng chọn môn học.");
      toast.error("Vui lòng chọn môn học.");
      validationPassed = false;
    }

    // Validate File Selection
    if (!file) {
      setWarning("Vui lòng chọn một file để tải lên.");
      toast.warn("Vui lòng chọn một file để tải lên.");
      validationPassed = false;
    }

    // Validate Token
    if (!token) {
      setError("Không tìm thấy mã xác thực. Vui lòng đăng nhập.");
      toast.error("Không tìm thấy mã xác thực. Vui lòng đăng nhập.");
      validationPassed = false;
    }

    if (!validationPassed) {
      return; // Halt the upload process if validation fails
    }

    // At this point, TypeScript still thinks 'file' could be null.
    // We use the non-null assertion operator to inform TypeScript that 'file' is not null.
    const currentFile = file!;

    try {
      let pdfFile: File;

      if (
        currentFile.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        // Detect DOCX file and convert to PDF
        setWarning("Đang chuyển đổi DOCX sang PDF...");
        toast.info("Đang chuyển đổi DOCX sang PDF...");
        const convertApi = ConvertApi.auth("secret_PSW1O3RmkJdvTxkA"); // Replace with your actual API key
        const params = convertApi.createParams();
        params.add("File", currentFile); // 'currentFile' is assured to be non-null

        const result1 = await convertApi.convert("docx", "pdf", params);
        const pdfUrl = result1.files[0].Url;
        const pdfResponse = await fetch(pdfUrl);
        const pdfBlob = await pdfResponse.blob();
        pdfFile = new File([pdfBlob], "converted-file.pdf", {
          type: "application/pdf",
        });
        setFile(pdfFile);
      } else if (currentFile.type === "application/pdf") {
        // PDF file, no conversion needed
        pdfFile = currentFile;
      } else {
        setError("Định dạng file không được hỗ trợ. Chỉ hỗ trợ DOCX và PDF.");
        toast.error(
          "Định dạng file không được hỗ trợ. Chỉ hỗ trợ DOCX và PDF."
        );
        return;
      }

      await createThumbnailFromPDFFile(pdfFile);
    } catch (error) {
      console.error("Lỗi khi chuyển đổi hoặc tạo thumbnail:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Không thể xử lý tài liệu.";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="80vh"
      bgcolor="#f5f5f5"
      p={2}
    >
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          maxWidth: 600,
          width: "100%",
        }}
      >
        <Typography variant="h5" component="h2" gutterBottom>
          Thêm Tài Liệu
        </Typography>
        <Box
          component="form"
          noValidate
          autoComplete="off"
          sx={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <TextField
            label="Tiêu đề"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            variant="outlined"
            fullWidth
            margin="dense"
            sx={{ mb: 2 }}
            required
            error={!title.trim() && error === "Vui lòng nhập tiêu đề tài liệu."}
            helperText={
              !title.trim() && error === "Vui lòng nhập tiêu đề tài liệu."
                ? "Tiêu đề là bắt buộc."
                : ""
            }
          />
          <TextField
            label="Mô tả"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            variant="outlined"
            fullWidth
            margin="dense"
            multiline
            rows={4}
            sx={{ mb: 2 }}
            required
            error={
              !description.trim() && error === "Vui lòng nhập mô tả tài liệu."
            }
            helperText={
              !description.trim() && error === "Vui lòng nhập mô tả tài liệu."
                ? "Mô tả là bắt buộc."
                : ""
            }
          />

          <FormControl
            fullWidth
            margin="normal"
            sx={{ mb: 2 }}
            required
            error={mainCategory === "" && error === "Vui lòng chọn lĩnh vực."}
          >
            <InputLabel id="main-category-label">Lĩnh vực</InputLabel>
            <Select
              labelId="main-category-label"
              id="main-category-select"
              value={mainCategory}
              label="Lĩnh vực"
              onChange={(e) => {
                const value = e.target.value as number;
                setMainCategory(value);
                setSelectedMainCategoryId(value);
                setSubCategory("");
                setSubSubCategory("");
                setSubCategories([]);
                setSubSubCategories([]);
              }}
            >
              {categoriesLevel1.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
            {mainCategory === "" && error === "Vui lòng chọn lĩnh vực." && (
              <FormHelperText>Lĩnh vực là bắt buộc.</FormHelperText>
            )}
          </FormControl>

          <FormControl
            fullWidth
            margin="normal"
            sx={{ mb: 2 }}
            required
            error={subCategory === "" && error === "Vui lòng chọn ngành."}
          >
            <InputLabel id="sub-category-label">Ngành</InputLabel>
            <Select
              labelId="sub-category-label"
              id="sub-category-select"
              value={subCategory}
              label="Ngành"
              onChange={(e) => {
                const value = e.target.value as number;
                setSubCategory(value);
                setSelectedSubCategoryId(value);
                setSubSubCategory(""); // Reset subSubCategory when subCategory changes
                setSubSubCategories([]); // Clear subSubCategories when subCategory changes
              }}
            >
              {subCategories.map((subCat) => (
                <MenuItem key={subCat.id} value={subCat.id}>
                  {subCat.name}
                </MenuItem>
              ))}
            </Select>
            {subCategory === "" && error === "Vui lòng chọn ngành." && (
              <FormHelperText>Ngành là bắt buộc.</FormHelperText>
            )}
          </FormControl>

          <FormControl
            fullWidth
            margin="normal"
            sx={{ mb: 2 }}
            required
            error={subSubCategory === "" && error === "Vui lòng chọn môn học."}
          >
            <InputLabel id="sub-sub-category-label">Môn học</InputLabel>
            <Select
              labelId="sub-sub-category-label"
              id="sub-sub-category-select"
              value={subSubCategory}
              label="Môn học"
              onChange={(e) => setSubSubCategory(e.target.value as number)}
            >
              {subSubCategories.map((subSubCat) => (
                <MenuItem key={subSubCat.id} value={subSubCat.id}>
                  {subSubCat.name}
                </MenuItem>
              ))}
            </Select>
            {subSubCategory === "" && error === "Vui lòng chọn môn học." && (
              <FormHelperText>Môn học là bắt buộc.</FormHelperText>
            )}
          </FormControl>

          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <input
              id="contained-button-file"
              multiple
              type="file"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <label htmlFor="contained-button-file">
              <Button
                variant="contained"
                color="primary"
                component="span"
                startIcon={<CloudUpload />}
              >
                Chọn File
              </Button>
            </label>
            {file && (
              <Typography variant="body1" sx={{ ml: 2 }}>
                {file.name}
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              mt: 2,
              justifyContent: "flex-end", // Thêm dòng này
              width: "100%", // Đảm bảo Box chiếm toàn bộ chiều rộng
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
              disabled={
                !title.trim() ||
                !description.trim() ||
                mainCategory === "" ||
                subCategory === "" ||
                subSubCategory === "" ||
                !file
              }
            >
              Thêm tài liệu
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => navigate("/admin")}
            >
              Hủy
            </Button>
          </Box>

          {error && (
            <Typography variant="body2" color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
          {warning && (
            <Typography variant="body2" color="warning.main" sx={{ mt: 2 }}>
              {warning}
            </Typography>
          )}
        </Box>
        <ToastContainer />
      </Paper>
    </Box>
  );
};

export default UploadDocument;
