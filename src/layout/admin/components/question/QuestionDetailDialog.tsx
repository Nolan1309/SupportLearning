import React from "react";
import { Dialog, DialogTitle, DialogContent } from "@mui/material";
import { Question } from "./QuestionsList";
// interface Question {
//   id: number;
//   content: string;
//   instruction: string;
//   optionA: string;
//   optionB: string;
//   optionC: string;
//   optionD: string;
//   result: string;
//   resultCheck: string;
//   deleted: boolean;
//   level: string;
//   type: string;
//   accountId: number;
//   courseId: number;
//   topic: string;
// }

interface QuestionDetailDialogProps {
  open: boolean;
  onClose: () => void;
  selectedQuestion: Question | null;
}

const QuestionDetailDialog: React.FC<QuestionDetailDialogProps> = ({
  open,
  onClose,
  selectedQuestion,
}) => {
  if (!selectedQuestion) return null;

  const renderDetailsByType = () => {
    switch (selectedQuestion.type) {
      case "fill-in-the-blank":
        return (
          <>
            <p>
              <strong>Từ khuyết:</strong> {selectedQuestion.result}
            </p>
            <p>
              <strong>Hướng dẫn:</strong> {selectedQuestion.instruction}
            </p>
          </>
        );

      case "multiple-choice":
        return (
          <>
            <p>
              <strong>Đáp án A:</strong> {selectedQuestion.optionA}
            </p>
            <p>
              <strong>Đáp án B:</strong> {selectedQuestion.optionB}
            </p>
            <p>
              <strong>Đáp án C:</strong> {selectedQuestion.optionC}
            </p>
            <p>
              <strong>Đáp án D:</strong> {selectedQuestion.optionD}
            </p>
            <p>
              <strong>Đáp án đúng:</strong> {selectedQuestion.result}
            </p>
          </>
        );

      case "essay":
        return (
          <p>
            <strong>Hướng dẫn:</strong> {selectedQuestion.instruction}
          </p>
        );

      case "checkbox":
        return (
          <>
            <p>
              <strong>Lựa chọn 1:</strong> {selectedQuestion.optionA}
            </p>
            <p>
              <strong>Lựa chọn 2:</strong> {selectedQuestion.optionB}
            </p>
            <p>
              <strong>Lựa chọn 3:</strong> {selectedQuestion.optionC}
            </p>
            <p>
              <strong>Lựa chọn 4:</strong> {selectedQuestion.optionD}
            </p>
            <p>
              <strong>Đáp án đúng:</strong> {selectedQuestion.resultCheck}
            </p>
          </>
        );

      default:
        return <p>Không có thông tin chi tiết cho loại câu hỏi này.</p>;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Chi Tiết Câu Hỏi</DialogTitle>
      <DialogContent>
        <p>
          <strong>ID:</strong> {selectedQuestion.id}
        </p>
        <p>
          <strong>Câu hỏi:</strong> {selectedQuestion.content}
        </p>
        {renderDetailsByType()}
      </DialogContent>
    </Dialog>
  );
};

export default QuestionDetailDialog;
