// EditDocument.tsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  TextField,
  Select,
  MenuItem,
  Paper,
  Typography,
  Box,
  Grid,
  InputLabel,
  FormControl,
  FormHelperText,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import styles from "./editDocument.module.scss"; // Updated to use CSS Modules
import {
  ADMIN_GET_ONE_DOCUMENT,
  ADMIN_UPDATE_DOCUMENT,
  ADMIN_CATEGORY_GET_LEVEL1,
  ADMIN_CATEGORY_GET_LEVEL2,
  ADMIN_CATEGORY_GET_LEVEL3,
} from "../../../../api/api";
import CloudUpload from "@mui/icons-material/CloudUpload";
import ConvertApi from "convertapi-js";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// Set the path to the worker from the public folder
GlobalWorkerOptions.workerSrc = "/pdfjs-dist/build/pdf.worker.min.mjs";

interface Document {
  id: number;
  title: string;
  url: string;
  description: string;
  idCategory: number;
  idLevel1: number;
  idLevel2: number;
  image_url: string;
}

interface CategoryLevel {
  id: number;
  name: string;
  level: number;
  parentId: number | null;
  type:string;
}

const EditDocument: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedLevel1, setSelectedLevel1] = useState<number | "">("");
  const [selectedLevel2, setSelectedLevel2] = useState<number | "">("");
  const [selectedLevel3, setSelectedLevel3] = useState<number | "">("");
  const [categoriesLevel1, setCategoriesLevel1] = useState<CategoryLevel[]>([]);
  const [categoriesLevel2, setCategoriesLevel2] = useState<CategoryLevel[]>([]);
  const [categoriesLevel3, setCategoriesLevel3] = useState<CategoryLevel[]>([]);
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null); // To store the new file
  const token = localStorage.getItem("authToken");
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const [pdfImage, setPdfImage] = useState<File | null>(null);

  const isDocumentLoaded = (doc: Document | null): doc is Document => {
    return doc !== null;
  };

  useEffect(() => {
    const fetchDocument = async () => {
      if (!token) {
        setError("Authentication token is missing");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(ADMIN_GET_ONE_DOCUMENT(Number(id)), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data: Document = await response.json();
        setDocument(data);
        await fetchCategories(data.idLevel1, data.idLevel2, data.idCategory);
      } catch (error) {
        console.error("There was an error fetching the document!", error);
        setError("Document not found or could not be fetched");
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async (
      level1Id: number,
      level2Id: number,
      level3Id: number
    ) => {
      if (!token) {
        setError("Authentication token is missing");
        console.error("Authentication token is missing");
        return;
      }

      try {
        // Fetch categories for all levels
        const [level1Response, level2Response, level3Response] = await Promise.all([
          fetch(ADMIN_CATEGORY_GET_LEVEL1, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(ADMIN_CATEGORY_GET_LEVEL2, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(ADMIN_CATEGORY_GET_LEVEL3, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (!level1Response.ok || !level2Response.ok || !level3Response.ok) {
          throw new Error("Failed to fetch categories");
        }

        const [level1Data, level2Data, level3Data] = await Promise.all([
          level1Response.json(),
          level2Response.json(),
          level3Response.json(),
        ]);
        const filteredLevel1 = level1Data.filter((category: CategoryLevel) => category.type === "document");
        const filteredLevel2 = level2Data.filter((category: CategoryLevel) => category.type === "document");
        const filteredLevel3 = level3Data.filter((category: CategoryLevel) => category.type === "document");
        

        setCategoriesLevel1(filteredLevel1);
        setCategoriesLevel2(filteredLevel2);
        setCategoriesLevel3(filteredLevel3);

        setSelectedLevel1(
          level1Data.find((category: CategoryLevel) => category.id === level1Id)?.id || ""
        );
        setSelectedLevel2(
          level2Data.find((category: CategoryLevel) => category.id === level2Id)?.id || ""
        );
        setSelectedLevel3(
          level3Data.find((category: CategoryLevel) => category.id === level3Id)?.id || ""
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        setError(`Failed to fetch categories: ${errorMessage}`);
        console.error("Failed to fetch categories:", errorMessage);
      }
    };

    fetchDocument();
  }, [id, token]);

  // const createThumbnailFromPDFFile = async (file: File) => {
  //   try {
  //     const fileUrl = URL.createObjectURL(file);
  //     const response = await fetch(fileUrl);
  //     const arrayBuffer = await response.arrayBuffer();
  //     const typedArray = new Uint8Array(arrayBuffer);

  //     const pdf = await getDocument({ data: typedArray }).promise;
  //     const firstPage = await pdf.getPage(1);

  //     const viewport = firstPage.getViewport({ scale: 0.2 });
  //     const canvas = document.createElement("canvas");
  //     const context = canvas.getContext("2d");

  //     if (canvas && context) {
  //       canvas.width = viewport.width;
  //       canvas.height = viewport.height;
  //       await firstPage.render({ canvasContext: context, viewport }).promise;

  //       const imageBlob = await new Promise<Blob | null>((resolve) => {
  //         canvas.toBlob((blob) => {
  //           console.log("Blob created:", blob); // Check if blob is created
  //           resolve(blob);
  //         }, "image/png");
  //       });

  //       if (imageBlob) {
  //         const imageFile = new File([imageBlob], "thumbnail.png", {
  //           type: "image/png",
  //         });
  //         setPdfImage(imageFile); // Set the file in state
  //       } else {
  //         console.error("Failed to create Blob from canvas");
  //         setPdfImage(null);
  //       }
  //     } else {
  //       console.error("Failed to create canvas or get context");
  //     }

  //     URL.revokeObjectURL(fileUrl);
  //   } catch (error) {
  //     console.error("Error fetching or processing PDF:", error);
  //   }
  // };

  const handleSave = async () => {
    if (isDocumentLoaded(document)) {
      const isValid = validateForm();
      if (!isValid) return;

      const confirmSave = window.confirm("Bạn có chắc chắn muốn cập nhật tài liệu này?");
      if (!confirmSave) return;

      const formData = new FormData();
      formData.append("title", document.title);
      formData.append("description", document.description);
      formData.append("idCategory", selectedLevel3.toString());
      formData.append("image_url", document.image_url);

      if (file) {
        formData.append("file", file); // Send new file
      } else {
        formData.append("url", document.url); // Send existing URL
      }

      try {
        const response = await fetch(ADMIN_UPDATE_DOCUMENT(Number(id)), {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        navigate("/admin"); // Adjust the navigation path as needed
      } catch (error) {
        console.error("Error updating document:", error);
        setError("Error updating document");
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]); // Update file in state
    } else {
      setFile(null); // Remove file if none selected
    }
  };

  const handleLevel1Change = (e: SelectChangeEvent<number | "">) => {
    const level1Id = e.target.value as number;
    setSelectedLevel1(level1Id);
    setSelectedLevel2("");
    setSelectedLevel3("");
  };

  const handleLevel2Change = (e: SelectChangeEvent<number | "">) => {
    const level2Id = e.target.value as number;
    setSelectedLevel2(level2Id);
    setSelectedLevel3("");
  };

  const handleLevel3Change = (e: SelectChangeEvent<number | "">) => {
    const level3Id = e.target.value as number;
    setSelectedLevel3(level3Id);
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!document!.title.trim()) newErrors.title = "Tiêu đề tài liệu không được để trống.";
    if (!document!.description.trim()) newErrors.description = "Mô tả tài liệu không được để trống.";
    if (!selectedLevel3) newErrors.idCategory = "Vui lòng chọn môn học.";
    if (!document!.url && !file) newErrors.url = "Vui lòng chọn file hoặc nhập URL tài liệu.";
    if (!document!.image_url) newErrors.image_url = "Hình ảnh không được để trống.";

    setFormErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  if (loading) return <div>Loading...</div>;
  if (!document) return <div>Document not found!</div>;

  return (
    <Box className={styles["edit-document-page"]}>
      <Paper elevation={3} className={styles["edit-document-container"]}>
        <Typography variant="h4" gutterBottom>
          Cập nhật tài liệu
        </Typography>

        <Grid container spacing={3} className={styles["form-container"]}>
          {/* Left Side */}
          <Grid item xs={12} sm={6}>
            {/* Title */}
            <Box className={styles["input-group"]}>
              <InputLabel htmlFor="title">Tiêu đề tài liệu</InputLabel>
              <TextField
                id="title"
                fullWidth
                value={document.title}
                onChange={(e) => setDocument({ ...document, title: e.target.value })}
                error={!!formErrors.title}
                helperText={formErrors.title}
              />
            </Box>

            {/* Description */}
            <Box className={styles["input-group"]}>
              <InputLabel htmlFor="description">Mô tả tài liệu</InputLabel>
              <TextField
                id="description"
                fullWidth
                multiline
                rows={4}
                value={document.description}
                onChange={(e) => setDocument({ ...document, description: e.target.value })}
                error={!!formErrors.description}
                helperText={formErrors.description}
              />
            </Box>

            {/* URL/File */}
            <Box className={styles["input-group"]}>
              <InputLabel htmlFor="url">URL tài liệu hoặc Upload File</InputLabel>
              <Box display="flex" alignItems="center" gap={2}>
                <Button variant="contained" component="label" aria-label="Upload File">
                  Upload File
                  <input type="file" hidden onChange={handleFileChange} />
                </Button>
                {document.url && !file && (
                  <a href={document.url} target="_blank" rel="noopener noreferrer">
                    Xem tài liệu hiện tại
                  </a>
                )}
              </Box>
              {formErrors.url && (
                <FormHelperText error>{formErrors.url}</FormHelperText>
              )}
            </Box>

            {/* Image URL */}
            <Box className={styles["input-group"]}>
              <InputLabel htmlFor="image_url">URL hình ảnh</InputLabel>
              <TextField
                id="image_url"
                fullWidth
                value={document.image_url}
                onChange={(e) => setDocument({ ...document, image_url: e.target.value })}
                error={!!formErrors.image_url}
                helperText={formErrors.image_url}
              />

            </Box>
          </Grid>

          {/* Right Side */}
          <Grid item xs={12} sm={6}>
            {/* Category Level 1 */}
            <Box className={styles["input-group"]}>
              <FormControl
                fullWidth
                variant="outlined"
                margin="normal"
                required
                error={!!formErrors.idCategory}
                className={styles["form-control"]}
              >
                <InputLabel id="level1-label">Ngành học</InputLabel>
                <Select
                  labelId="level1-label"
                  id="level1-select"
                  value={selectedLevel1}
                  onChange={handleLevel1Change}
                  label="Ngành học"
                >
                  <MenuItem value="">
                    <em>Chọn ngành</em>
                  </MenuItem>
                  {categoriesLevel1.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.idCategory && (
                  <FormHelperText>{formErrors.idCategory}</FormHelperText>
                )}
              </FormControl>
            </Box>

            {/* Category Level 2 */}
            <Box className={styles["input-group"]}>
              <FormControl
                fullWidth
                variant="outlined"
                margin="normal"
                required
                error={!!formErrors.idCategory}
                className={styles["form-control"]}
                disabled={selectedLevel1 === ""}
              >
                <InputLabel id="level2-label">Khoa</InputLabel>
                <Select
                  labelId="level2-label"
                  id="level2-select"
                  value={selectedLevel2}
                  onChange={handleLevel2Change}
                  label="Khoa"
                >
                  <MenuItem value="">
                    <em>Chọn khoa</em>
                  </MenuItem>
                  {categoriesLevel2
                    .filter((category) => category.parentId === selectedLevel1)
                    .map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                </Select>
                {formErrors.idCategory && (
                  <FormHelperText>{formErrors.idCategory}</FormHelperText>
                )}
              </FormControl>
            </Box>

            {/* Category Level 3 */}
            <Box className={styles["input-group"]}>
              <FormControl
                fullWidth
                variant="outlined"
                margin="normal"
                required
                error={!!formErrors.idCategory}
                className={styles["form-control"]}
                disabled={selectedLevel2 === ""}
              >
                <InputLabel id="level3-label">Môn học</InputLabel>
                <Select
                  labelId="level3-label"
                  id="level3-select"
                  value={selectedLevel3}
                  onChange={handleLevel3Change}
                  label="Môn học"
                >
                  <MenuItem value="">
                    <em>Chọn môn học</em>
                  </MenuItem>
                  {categoriesLevel3
                    .filter((category) => category.parentId === selectedLevel2)
                    .map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                </Select>
                {formErrors.idCategory && (
                  <FormHelperText>{formErrors.idCategory}</FormHelperText>
                )}
              </FormControl>
            </Box>

            {/* Save and Back Buttons */}
            {error && (
              <Typography color="error" variant="body2" className={styles["error-message"]}>
                {error}
              </Typography>
            )}
            <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
              <Button variant="contained" color="primary" onClick={handleSave}>
                Cập nhật
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => navigate("/admin")}
              >
                Quay lại
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default EditDocument;
