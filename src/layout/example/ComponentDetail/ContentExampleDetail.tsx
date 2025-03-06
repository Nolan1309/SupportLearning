import React from "react";

function ContentExampleDetail() {
  return (
    <div className="col-md-8 col-xs-12">
      <div className="row basic-info">
        <div className="col-12 pl-0">
          <h1 style={{ fontSize: "15px !important" }}>
            Kiểm tra phát triển ứng dụng di động
          </h1>
          <div className="mb-2">
            <a className="icons mr-4">
              <i className="fa fa-qrcode text-muted mr-1"></i>Mã trắc nghiệm:{" "}
              <b> 11008842</b>
            </a>
          </div>
        </div>
      </div>

      <div className="quiz-content">
        <div className="row">
          <div className="col-12">
            <div id="countdown" className="h4 float-right text-danger"></div>
          </div>
        </div>
        <ul style={{ listStyle: "none" }} className="ml-0 list-question mb-5">
          <li className="question-info mb-5" question-id="147099">
            <div className="question-title mb-3 font-weight-bold">Câu 1:</div>
            <div className="question-content">
              <div className="item-choice-rd desc-question mb-3">
                <div>
                  <span>Trong phát triển ứng dụng di động, framework nào sau đây thường được sử dụng để phát triển ứng dụng đa nền tảng?</span>
                </div>
              </div>
              <div className="item-choice-rd list-answer">
                <ul style={{ listStyle: "none" }} className="ml-0">
                  <li className="ansewe-info mb-1 p-3">
                    <label className="d-flex align-items-center mb-0">
                      <span id="icon-check-381088" className="w-5"></span>
                      <input
                        type="radio"
                        className="a-value"
                        name="option-147099"
                        answer-point="0"
                        answer-id="381088"
                      />
                      <span className="ml-3">
                        <div>A. Django</div>
                      </span>
                    </label>
                  </li>
                  <li className="ansewe-info mb-1 p-3">
                    <label className="d-flex align-items-center mb-0">
                      <span id="icon-check-381089" className="w-5"></span>
                      <input
                        type="radio"
                        className="a-value"
                        name="option-147099"
                        answer-point="0"
                        answer-id="381089"
                      />
                      <span className="ml-3">
                        <div>B. React Native</div>
                      </span>
                    </label>
                  </li>
                  <li className="ansewe-info mb-1 p-3">
                    <label className="d-flex align-items-center mb-0">
                      <span id="icon-check-381090" className="w-5"></span>
                      <input
                        type="radio"
                        className="a-value"
                        name="option-147099"
                        answer-point="0"
                        answer-id="381090"
                      />
                      <span className="ml-3">
                        <div>C. Flask</div>
                      </span>
                    </label>
                  </li>
                  <li className="ansewe-info mb-1 p-3">
                    <label className="d-flex align-items-center mb-0">
                      <span id="icon-check-381091" className="w-5"></span>
                      <input
                        type="radio"
                        className="a-value"
                        name="option-147099"
                        answer-point="1"
                        answer-id="381091"
                      />
                      <span className="ml-3">
                        <div>D. Angular</div>
                      </span>
                    </label>
                  </li>
                </ul>
              </div>
            </div>
          </li>

          <li className="question-info mb-5" question-id="147100">
            <div className="question-title mb-3 font-weight-bold">Câu 2:</div>
            <div className="question-content">
              <div className="item-choice-rd desc-question mb-3">
                <div>
                  <span>Ngôn ngữ lập trình nào sau đây được sử dụng để phát triển ứng dụng iOS?</span>
                </div>
              </div>
              <div className="item-choice-rd list-answer">
                <ul style={{ listStyle: "none" }} className="ml-0">
                  <li className="ansewe-info mb-1 p-3">
                    <label className="d-flex align-items-center mb-0">
                      <span id="icon-check-381092" className="w-5"></span>
                      <input
                        type="radio"
                        className="a-value"
                        name="option-147100"
                        answer-point="0"
                        answer-id="381092"
                      />
                      <span className="ml-3">
                        <div>A. Java</div>
                      </span>
                    </label>
                  </li>
                  <li className="ansewe-info mb-1 p-3">
                    <label className="d-flex align-items-center mb-0">
                      <span id="icon-check-381093" className="w-5"></span>
                      <input
                        type="radio"
                        className="a-value"
                        name="option-147100"
                        answer-point="0"
                        answer-id="381093"
                      />
                      <span className="ml-3">
                        <div>B. Kotlin</div>
                      </span>
                    </label>
                  </li>
                  <li className="ansewe-info mb-1 p-3">
                    <label className="d-flex align-items-center mb-0">
                      <span id="icon-check-381094" className="w-5"></span>
                      <input
                        type="radio"
                        className="a-value"
                        name="option-147100"
                        answer-point="1"
                        answer-id="381094"
                      />
                      <span className="ml-3">
                        <div>C. Swift</div>
                      </span>
                    </label>
                  </li>
                  <li className="ansewe-info mb-1 p-3">
                    <label className="d-flex align-items-center mb-0">
                      <span id="icon-check-381095" className="w-5"></span>
                      <input
                        type="radio"
                        className="a-value"
                        name="option-147100"
                        answer-point="0"
                        answer-id="381095"
                      />
                      <span className="ml-3">
                        <div>D. Ruby</div>
                      </span>
                    </label>
                  </li>
                </ul>
              </div>
            </div>
          </li>

          <li className="question-info mb-5" question-id="147101">
            <div className="question-title mb-3 font-weight-bold">Câu 3:</div>
            <div className="question-content">
              <div className="item-choice-rd desc-question mb-3">
                <div>
                  <span>Google khuyến nghị sử dụng ngôn ngữ lập trình nào để phát triển ứng dụng Android?</span>
                </div>
              </div>
              <div className="item-choice-rd list-answer">
                <ul style={{ listStyle: "none" }} className="ml-0">
                  <li className="ansewe-info mb-1 p-3">
                    <label className="d-flex align-items-center mb-0">
                      <span id="icon-check-381096" className="w-5"></span>
                      <input
                        type="radio"
                        className="a-value"
                        name="option-147101"
                        answer-point="0"
                        answer-id="381096"
                      />
                      <span className="ml-3">
                        <div>A. Python</div>
                      </span>
                    </label>
                  </li>
                  <li className="ansewe-info mb-1 p-3">
                    <label className="d-flex align-items-center mb-0">
                      <span id="icon-check-381097" className="w-5"></span>
                      <input
                        type="radio"
                        className="a-value"
                        name="option-147101"
                        answer-point="1"
                        answer-id="381097"
                      />
                      <span className="ml-3">
                        <div>B. Kotlin</div>
                      </span>
                    </label>
                  </li>
                  <li className="ansewe-info mb-1 p-3">
                    <label className="d-flex align-items-center mb-0">
                      <span id="icon-check-381098" className="w-5"></span>
                      <input
                        type="radio"
                        className="a-value"
                        name="option-147101"
                        answer-point="0"
                        answer-id="381098"
                      />
                      <span className="ml-3">
                        <div>C. C++</div>
                      </span>
                    </label>
                  </li>
                  <li className="ansewe-info mb-1 p-3">
                    <label className="d-flex align-items-center mb-0">
                      <span id="icon-check-381099" className="w-5"></span>
                      <input
                        type="radio"
                        className="a-value"
                        name="option-147101"
                        answer-point="0"
                        answer-id="381099"
                      />
                      <span className="ml-3">
                        <div>D. PHP</div>
                      </span>
                    </label>
                  </li>
                </ul>
              </div>
            </div>
          </li>

          <li className="question-info mb-5" question-id="147102">
            <div className="question-title mb-3 font-weight-bold">Câu 4:</div>
            <div className="question-content">
              <div className="item-choice-rd desc-question mb-3">
                <div>
                  <span>Framework nào sau đây thuộc sở hữu của Google và thường được sử dụng để phát triển ứng dụng di động?</span>
                </div>
              </div>
              <div className="item-choice-rd list-answer">
                <ul style={{ listStyle: "none" }} className="ml-0">
                  <li className="ansewe-info mb-1 p-3">
                    <label className="d-flex align-items-center mb-0">
                      <span id="icon-check-381100" className="w-5"></span>
                      <input
                        type="radio"
                        className="a-value"
                        name="option-147102"
                        answer-point="0"
                        answer-id="381100"
                      />
                      <span className="ml-3">
                        <div>A. Ionic</div>
                      </span>
                    </label>
                  </li>
                  <li className="ansewe-info mb-1 p-3">
                    <label className="d-flex align-items-center mb-0">
                      <span id="icon-check-381101" className="w-5"></span>
                      <input
                        type="radio"
                        className="a-value"
                        name="option-147102"
                        answer-point="1"
                        answer-id="381101"
                      />
                      <span className="ml-3">
                        <div>B. Flutter</div>
                      </span>
                    </label>
                  </li>
                  <li className="ansewe-info mb-1 p-3">
                    <label className="d-flex align-items-center mb-0">
                      <span id="icon-check-381102" className="w-5"></span>
                      <input
                        type="radio"
                        className="a-value"
                        name="option-147102"
                        answer-point="0"
                        answer-id="381102"
                      />
                      <span className="ml-3">
                        <div>C. Xamarin</div>
                      </span>
                    </label>
                  </li>
                  <li className="ansewe-info mb-1 p-3">
                    <label className="d-flex align-items-center mb-0">
                      <span id="icon-check-381103" className="w-5"></span>
                      <input
                        type="radio"
                        className="a-value"
                        name="option-147102"
                        answer-point="0"
                        answer-id="381103"
                      />
                      <span className="ml-3">
                        <div>D. PhoneGap</div>
                      </span>
                    </label>
                  </li>
                </ul>
              </div>
            </div>
          </li>

          <li className="question-info mb-5" question-id="147103">
            <div className="question-title mb-3 font-weight-bold">Câu 5:</div>
            <div className="question-content">
              <div className="item-choice-rd desc-question mb-3">
                <div>
                  <span>Trong Android, thành phần nào được sử dụng để quản lý vòng đời của ứng dụng?</span>
                </div>
              </div>
              <div className="item-choice-rd list-answer">
                <ul style={{ listStyle: "none" }} className="ml-0">
                  <li className="ansewe-info mb-1 p-3">
                    <label className="d-flex align-items-center mb-0">
                      <span id="icon-check-381104" className="w-5"></span>
                      <input
                        type="radio"
                        className="a-value"
                        name="option-147103"
                        answer-point="1"
                        answer-id="381104"
                      />
                      <span className="ml-3">
                        <div>A. Activity</div>
                      </span>
                    </label>
                  </li>
                  <li className="ansewe-info mb-1 p-3">
                    <label className="d-flex align-items-center mb-0">
                      <span id="icon-check-381105" className="w-5"></span>
                      <input
                        type="radio"
                        className="a-value"
                        name="option-147103"
                        answer-point="0"
                        answer-id="381105"
                      />
                      <span className="ml-3">
                        <div>B. Service</div>
                      </span>
                    </label>
                  </li>
                  <li className="ansewe-info mb-1 p-3">
                    <label className="d-flex align-items-center mb-0">
                      <span id="icon-check-381106" className="w-5"></span>
                      <input
                        type="radio"
                        className="a-value"
                        name="option-147103"
                        answer-point="0"
                        answer-id="381106"
                      />
                      <span className="ml-3">
                        <div>C. BroadcastReceiver</div>
                      </span>
                    </label>
                  </li>
                  <li className="ansewe-info mb-1 p-3">
                    <label className="d-flex align-items-center mb-0">
                      <span id="icon-check-381107" className="w-5"></span>
                      <input
                        type="radio"
                        className="a-value"
                        name="option-147103"
                        answer-point="0"
                        answer-id="381107"
                      />
                      <span className="ml-3">
                        <div>D. ContentProvider</div>
                      </span>
                    </label>
                  </li>
                </ul>
              </div>
            </div>
          </li>

        </ul>
        <input type="hidden" id="memberCode" value="2413105" />
        <div className="mb-5" id="quiz-check">
          <div id="error-check-quiz" style={{ listStyle: "none" }}></div>
          <div className="text-center" id="div-check-quiz">
            <button type="button" className="btn btn-warning" id="btnCheckQuiz">
              Kiểm tra kết quả
            </button>
          </div>
          <div id="quiz-help" style={{ listStyle: "none" }}>
            <hr />
            <p>
              <span className="w-5">
                <i className="fa fa-check fa-2x mr-2 text-info"></i>
              </span>
              Đáp án đúng của hệ thống
            </p>
            <p>
              <span className="w-5">
                <i className="fa fa-check-circle fa-2x mr-2 text-info"></i>
              </span>
              Trả lời đúng của bạn
            </p>
            <p>
              <span className="w-5">
                <i className="fa fa-times-circle fa-2x mr-2 text-danger"></i>
              </span>
              Trả lời sai của bạn
            </p>
          </div>
          <div
            id="quiz-result"
            style={{ listStyle: "none" }}
            className="ml-5 text-center h4"
          >
            <p>
              Bạn đã trả lời đúng được
              <span id="totalAnswer"></span> Câu hỏi.
            </p>
            <p>
              Số điểm bạn đạt được: <span id="totalPoint"></span> điểm.
            </p>
          </div>

          <div
            className="text-center"
            id="div-check-quiz-again"
            style={{ listStyle: "none" }}
          >
            <a href="#" className="btn btn-outline-primary mr-3">
              Làm lại
            </a>
            <button type="button" className="btn btn-info" id="btnSaveResult">
              Lưu kết quả
            </button>
          </div>
        </div>
        <div
          className="mb-5 text-center"
          id="div-start-quiz"
          style={{ listStyle: "none" }}
        >
          <p className="font-italic">
            Click bên dưới để bắt đầu bài trắc nghiệm.
          </p>
          <button type="button" className="btn btn-primary" id="btnStartQuiz">
            Bắt đầu ngay
          </button>
        </div>
        <input type="hidden" id="duration-quiz" value="0" />
        <input type="hidden" id="product-code" value="11008842" />
        <input type="hidden" id="package-code" value="5" />
        <input
          type="hidden"
          id="json-list-question-info"
          value='[{"Id":147098,"Type":2,"HaveTrueAnswer":true,"ListAnswer":""},{"Id":147099,"Type":2,"HaveTrueAnswer":true,"ListAnswer":""},{"Id":147100,"Type":2,"HaveTrueAnswer":true,"ListAnswer":""},{"Id":147101,"Type":2,"HaveTrueAnswer":true,"ListAnswer":""},{"Id":147102,"Type":2,"HaveTrueAnswer":true,"ListAnswer":""},{"Id":147103,"Type":2,"HaveTrueAnswer":true,"ListAnswer":""},{"Id":147104,"Type":2,"HaveTrueAnswer":true,"ListAnswer":""},{"Id":147105,"Type":2,"HaveTrueAnswer":true,"ListAnswer":""},{"Id":147106,"Type":2,"HaveTrueAnswer":true,"ListAnswer":""},{"Id":147107,"Type":2,"HaveTrueAnswer":true,"ListAnswer":""},{"Id":147108,"Type":2,"HaveTrueAnswer":true,"ListAnswer":""},{"Id":147109,"Type":2,"HaveTrueAnswer":true,"ListAnswer":""},{"Id":147110,"Type":2,"HaveTrueAnswer":true,"ListAnswer":""},{"Id":147111,"Type":2,"HaveTrueAnswer":true,"ListAnswer":""},{"Id":147112,"Type":2,"HaveTrueAnswer":true,"ListAnswer":""},{"Id":147113,"Type":2,"HaveTrueAnswer":true,"ListAnswer":""},{"Id":147114,"Type":2,"HaveTrueAnswer":true,"ListAnswer":""},{"Id":147115,"Type":2,"HaveTrueAnswer":true,"ListAnswer":""},{"Id":147116,"Type":2,"HaveTrueAnswer":true,"ListAnswer":""},{"Id":147117,"Type":2,"HaveTrueAnswer":true,"ListAnswer":""}]'
        />
        <form id="frmCheckQuiz">
          <div id="divHtmlAntiForgeryToken">
            <input
              name="__RequestVerificationToken"
              type="hidden"
              value="rBj_RrvqlIWeW4WfG7Qg7Hf0loZVv7mMmw1KeW-EYE9vx2FMtmi9zBZJnM2pobLSJOlSB-JYHT5SFGq0O-qYJl0i1I8hgkRG-FBU8vkNKHCzj-cbXQPRQAlZJaESqaC8lso0shnA8Jje82CX1uUZHg2"
            />
          </div>
        </form>
        <form
          id="frmResultCheck"
          action="https://khotrithucso.com/quiz/save-result"
        >
          <input type="hidden" name="QuizCode" value="11008842" />
          <input type="hidden" name="QuizPackageCode" value="5" />
          <input
            type="hidden"
            name="QuizName"
            value="Đề kiểm tra môn Đại số lớp 10 Chương 1 Mệnh đề và Tập hợp"
          />
          <input
            type="hidden"
            name="TotalPoint"
            value=""
            id="TotalPointValue"
          />
          <input
            type="hidden"
            name="TotalPointMember"
            value=""
            id="TotalPointMemberValue"
          />
          <input
            type="hidden"
            name="TotalAnswer"
            value=""
            id="TotalAnswerValue"
          />
          <input
            type="hidden"
            name="TotalQuestion"
            value=""
            id="TotalQuestionValue"
          />
          <input
            type="hidden"
            name="TotalQuestionDone"
            value=""
            id="TotalQuestionDoneValue"
          />
          <input
            type="hidden"
            name="ListQuestionInfo"
            value=""
            id="ListQuestionInfoValue"
          />
          <div id="divHtmlAntiForgeryTokenSaveResult">
            <input
              name="__RequestVerificationToken"
              type="hidden"
              value="rBj_RrvqlIWeW4WfG7Qg7Hf0loZVv7mMmw1KeW-EYE9vx2FMtmi9zBZJnM2pobLSJOlSB-JYHT5SFGq0O-qYJl0i1I8hgkRG-FBU8vkNKHCzj-cbXQPRQAlZJaESqaC8lso0shnA8Jje82CX1uUZHg2"
            />
          </div>
        </form>
        <div
          className="modal fade"
          id="timeupModal"
          //   tabindex="-1"
          role="dialog"
          aria-labelledby="timeupModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header bg-white">
                <h5 className="modal-title" id="timeupModalLabel">
                  Thông báo
                </h5>
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              <div className="modal-body">
                <p className="text-center">Bạn đã hết thời gian làm bài.</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-light"
                  data-dismiss="modal"
                >
                  Ok
                </button>
              </div>
            </div>
          </div>
        </div>
        <div
          className="modal fade"
          id="messageModal"
          //   tabindex="-1"
          role="dialog"
          aria-labelledby="messageModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header bg-white">
                <h5 className="modal-title" id="messageModalLabel">
                  Thông báo
                </h5>
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              <div className="modal-body">
                <p className="text-center" id="txtMessageModal"></p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-light"
                  data-dismiss="modal"
                >
                  Ok
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12"></div>
      </div>
    </div>
  );
}
export default ContentExampleDetail;
