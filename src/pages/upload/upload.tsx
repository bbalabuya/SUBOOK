import React, { useEffect, useState } from "react";
import "./upload.css";
import imgUpload from "../../assets/imgUpload.png"; // 카메라 아이콘
import { useNavigate } from "react-router-dom";
import { getMajorList } from "../../API/uploadAPI";

const API_URL = import.meta.env.VITE_DOMAIN_URL;
const MAX_IMAGES = 5; // 최대 이미지 개수

const Upload = () => {
  const [postName, setPostName] = useState("");
  const [title, setTitle] = useState("");
  const [postPrice, setPostPrice] = useState(""); // 문자열로 받되, 전송 시 숫자로 변환
  const [content, setContent] = useState("");
  const [professor, setProfessor] = useState("");
  const [courseName, setCourseName] = useState("");
  const [grade, setGrade] = useState<number>(1);
  const [semester, setSemester] = useState<number>(1);
  const [postImage, setPostImage] = useState<File[]>([]); // 원본 File 객체 저장
  const [majorList, setMajorList] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [majorId, setMajorId] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null,
  ); // 중앙에 크게 보여줄 이미지 인덱스

  const navigate = useNavigate();

  /** 📸 이미지 업로드 */
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    // 현재 이미지 개수 + 새로 추가할 이미지 개수가 MAX_IMAGES를 넘지 않도록
    const newImages = [...postImage, ...files].slice(0, MAX_IMAGES);
    setPostImage(newImages);

    // 새 이미지가 추가되었고, 현재 선택된 이미지가 없거나(null) 유효하지 않다면 첫 이미지를 선택
    if (
      newImages.length > 0 &&
      (selectedImageIndex === null ||
        newImages[selectedImageIndex] === undefined)
    ) {
      setSelectedImageIndex(0);
    }
    // 인풋 파일 초기화 (동일 파일 재선택 가능하도록)
    e.target.value = "";
  };

  /** ❌ 이미지 삭제 */
  const handleDeleteImage = (index: number) => {
    setPostImage((prev) => {
      const updatedImages = prev.filter((_, i) => i !== index);

      // 삭제 후 선택된 이미지 인덱스 조정 로직
      if (selectedImageIndex === index) {
        // 삭제된 이미지가 현재 선택된 이미지인 경우
        if (updatedImages.length > 0) {
          // 남은 이미지가 있으면 첫 번째 이미지 선택
          setSelectedImageIndex(0);
        } else {
          // 이미지가 없으면 선택 해제
          setSelectedImageIndex(null);
        }
      } else if (selectedImageIndex !== null && selectedImageIndex > index) {
        // 삭제된 이미지보다 뒤에 있는 이미지가 선택되어 있었으면 인덱스 하나 줄이기
        setSelectedImageIndex((prevIndex) =>
          prevIndex !== null ? prevIndex - 1 : null,
        );
      }
      return updatedImages;
    });
  };

  /** 🧾 게시글 업로드 (이미지 필수, multipart/form-data 통일) */
  const handleSubmit = async () => {
    try {
      // ✅ 이미지 필수 유효성 검사
      if (postImage.length === 0) {
        alert("⚠️ 최소 1장의 이미지를 등록해야 합니다.");
        return;
      }

      const token = localStorage.getItem("accessToken");
      const formData = new FormData();

      // 텍스트 데이터 추가 (기존 로직 유지)
      formData.append("postName", postName);
      formData.append("title", title);
      const priceInt = parseInt(postPrice.replace(/,/g, ""));
      formData.append("postPrice", String(isNaN(priceInt) ? 0 : priceInt));
      formData.append("professor", professor);
      formData.append("courseName", courseName);
      formData.append("grade", String(grade));
      formData.append("semester", String(semester));
      formData.append("content", content);
      formData.append("majorId", majorId);

      // 이미지 파일 추가 (최대 5장)
      postImage.forEach((file) => {
        // 🚨 변경된 백엔드 API 명세에 따라 키 이름을 'postImages'로 변경
        formData.append("postImages", file);
      });
      console.log(
        "✅ [handleSubmit] FormData 준비 완료: postImages로 파일 추가 완료",
      );

      const res = await fetch(`${API_URL}/api/posts`, {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`업로드 실패: ${res.status} - ${errorText}`);
      }

      alert("📸 게시글이 성공적으로 업로드되었습니다.");
      navigate("/");
    } catch (err) {
      alert("업로드 중 오류가 발생했습니다.");
      console.error("❌ [handleSubmit] 업로드 실패:", err);
    }
  };

  /** 🎓 전공 목록 불러오기 */
  useEffect(() => {
    const fetchMajors = async () => {
      try {
        const list = await getMajorList();
        setMajorList(list);
        if (list.length > 0) setMajorId(list[0].id);
      } catch (err) {
        console.error("전공 리스트 불러오기 실패:", err);
      }
    };
    fetchMajors();
  }, []);

  // 이미지 선택 시 중앙에 보여줄 이미지 URL (미리보기)
  const mainImageUrl =
    selectedImageIndex !== null && postImage[selectedImageIndex]
      ? URL.createObjectURL(postImage[selectedImageIndex])
      : imgUpload; // 선택된 이미지가 없으면 기본 카메라 아이콘

  return (
    <div className="upload-whole-container">
      {/* 왼쪽: 이미지 업로드 영역 */}
      <div className="upload-left-container">
        {/* 중앙에 크게 표시되는 이미지 */}
        <div className="main-image-display">
          {selectedImageIndex !== null && postImage[selectedImageIndex] ? (
            <img
              src={mainImageUrl}
              alt="메인 이미지"
              className="uploaded-main-img"
            />
          ) : (
            <div className="empty-main-slot">
              <img
                src={imgUpload}
                alt="이미지 없음"
                className="upload-icon-large"
              />
              <p>최대 5장의 이미지를 등록해주세요</p>
            </div>
          )}
        </div>

        {/* 하단 썸네일 목록 (최대 5개) */}
        <div className="thumbnail-upload-set">
          {Array.from({ length: MAX_IMAGES }).map((_, index) => (
            <div
              key={index}
              className={`thumbnail-slot ${postImage[index] ? "has-image" : "empty"} ${selectedImageIndex === index ? "selected" : ""}`}
              onClick={() => {
                if (postImage[index]) {
                  setSelectedImageIndex(index); // 썸네일 클릭 시 메인 이미지 변경
                }
              }}
            >
              {postImage[index] ? (
                // 이미지가 있는 슬롯 (썸네일)
                <div className="thumbnail-wrapper">
                  <img
                    src={URL.createObjectURL(postImage[index])}
                    alt={`업로드 이미지 ${index + 1}`}
                    className="uploaded-thumbnail-img"
                  />
                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation(); // 썸네일 선택 이벤트와 중복 방지
                      handleDeleteImage(index);
                    }}
                  >
                    ×
                  </button>
                </div>
              ) : (
                // 이미지가 없는 빈 슬롯 (업로드 버튼)
                <label className="empty-thumbnail-label">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: "none" }}
                    onChange={handleImageUpload}
                    // 5장이 가득 찼으면 input 비활성화
                    disabled={postImage.length >= MAX_IMAGES}
                  />
                  {postImage.length < MAX_IMAGES && (
                    <img
                      src={imgUpload}
                      alt="카메라"
                      className="upload-thumbnail-icon"
                    />
                  )}
                  {postImage.length >= MAX_IMAGES && (
                    <div className="no-upload-slot"></div>
                  )}
                </label>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 오른쪽: 입력 폼 */}
      <div className="upload-right-container">
        {/* 게시글 제목 */}
        <div className="enter-title-set">
          <div className="enter-title">게시글 제목</div>
          <input
            className="enter-box"
            placeholder="게시글의 제목을 입력해주세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* 책 제목 */}
        <div className="enter-title-set">
          <div className="enter-title">책 제목</div>
          <input
            className="enter-box"
            placeholder="판매하려는 책 이름을 넣어주세요"
            value={postName}
            onChange={(e) => setPostName(e.target.value)}
          />
        </div>

        {/* 책의 상태 */}
        <div className="enter-title-set">
          <div className="enter-title">책의 상태</div>
          <textarea // input 대신 textarea 사용
            className="enter-info-box"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className="course-professor-container">
          {/* 교수명 */}
          <div className="enter-title-set">
            <div className="enter-title">교수명</div>
            <input
              className="enter-professor"
              value={professor}
              onChange={(e) => setProfessor(e.target.value)}
            />
          </div>

          {/* 강의명 */}
          <div className="enter-title-set">
            <div className="enter-title">강의명</div>
            <input
              className="enter-box"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
            />
          </div>
        </div>

        {/* 학년 / 학기 */}
        <div className="enter-title-set">
          <div className="enter-title">학년 / 학기</div>
          <div className="upload-select-set">
            <select
              value={grade}
              onChange={(e) => setGrade(Number(e.target.value))}
            >
              {[1, 2, 3, 4].map((y) => (
                <option key={y} value={y}>
                  {y}학년
                </option>
              ))}
            </select>
            <select
              value={semester}
              onChange={(e) => setSemester(Number(e.target.value))}
            >
              {[1, 2].map((s) => (
                <option key={s} value={s}>
                  {s}학기
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 전공 선택 */}
        <div className="enter-title-set">
          <div className="enter-title">전공</div>
          <select
            className="enter-box"
            value={majorId}
            onChange={(e) => setMajorId(e.target.value)}
          >
            {majorList.map((major) => (
              <option key={major.id} value={major.id}>
                {major.name}
              </option>
            ))}
          </select>
        </div>

        {/* 가격 */}
        <div className="enter-title-set">
          <div className="enter-title">가격</div>
          <input
            placeholder="가격을 입력해주세요 (숫자만)"
            className="enter-box"
            type="number" // 숫자만 입력받도록 type 변경
            value={postPrice}
            onChange={(e) => setPostPrice(e.target.value)}
          />
        </div>

        <button className="save-upload-button" onClick={handleSubmit}>
          업로드하기
        </button>
      </div>
    </div>
  );
};

export default Upload;
