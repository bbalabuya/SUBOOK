import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";
import arrowImg from "./assets/arrow.png";
import profileImg from "./assets/basic_profile.png";
import readingGlass from "./assets/reading_glass.png";
import subookLogo from "./assets/subookLogo.png";

// =======================
// 🔹 스타일 정의
// =======================
const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 50px 30px;
  width: 100%;
  height: 70px;
  background-color: #f8f8f8;
  border-bottom: 3px solid #b516ff;
  position: sticky;
  box-sizing: border-box;

  top: 0;
  z-index: 100;
`;

const Logo = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: black;
  cursor: pointer;
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 30px;
  font-size: 17px;
  font-weight: bold;

  a {
    color: #b516ff;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const SearchBox = styled.div`
  display: flex;
  flex: 1;
  margin: 0 70px;
  align-items: center;
  background-color: white;
  border: 1px solid #b516ff;
  border-radius: 999px;
  overflow: hidden;
`;

const SelectWrapper = styled.div`
  position: relative;
  display: flex;
  padding: 0px 0px 0px 10px;
  align-items: center;
  border-right: 1px solid #ddd;
`;

const Select = styled.select`
  padding: 5px 1px 5px 15px;
  border: none;
  background-color: transparent;
  font-size: 15px;
  color: #333;
  outline: none;
  appearance: none;
  cursor: pointer;
`;

const Arrow = styled.img.attrs({ src: arrowImg, alt: "화살표" })`
  position: relative;
  width: 15px;
  height: 15px;
  transform: rotate(90deg);
  pointer-events: none;
  margin-right: 7px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 15px 12px;
  border: none;
  font-size: 14px;
  outline: none;
  background-color: white;
  color: black;
`;

const Profile = styled.img`
  width: 45px;
  height: 45px;
  align-items: center;
  cursor: pointer;
  border-radius: 50%;
`;

const Button = styled.button`
  padding: 8px 16px;
  background-color: #b516ff;
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 15px;
  cursor: pointer;
  white-space: nowrap;
  font-weight: bold;

  &:hover {
    background-color: #8c13cc;
  }
`;

const ReadingGlass = styled.img`
  width: 30px;
  height: 30px;
  cursor: pointer;
  margin-right: 13px;
`;

const API_URL = import.meta.env.VITE_DOMAIN_URL;

// =======================
// 🔹 Header 컴포넌트
// =======================
const Header: React.FC = () => {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(false);
  const [searchType, setSearchType] = useState("bookName");
  const [keyword, setKeyword] = useState("");

  // ✅ 로그인 상태 확인 및 토큰 재발급
  const loginCheck = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setLoggedIn(false);
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/reissue`,
        {},
        { withCredentials: true },
      );

      console.log("✅ [Header] 로그인 상태 확인 응답:", response);
      if (
        response.headers["authorization"] ||
        response.headers["Authorization"]
      ) {
        const token =
          response.headers["authorization"] ||
          response.headers["Authorization"];
        localStorage.setItem("accessToken", token.replace("Bearer ", ""));
        console.log("✅ [Header] 토큰 재발급 성공");
        setLoggedIn(true);
      } else {
        console.warn("⚠️ [Header] 재발급 응답에 accessToken 없음");
        setLoggedIn(false);
      }
    } catch (error) {
      console.error("❌ [Header] 토큰 재발급 실패:", error);
      setLoggedIn(false);
    }
  };

  // ✅ 페이지 로드 시 로그인 상태 확인
  useEffect(() => {
    loginCheck();
  }, []);

  // ✅ 검색 버튼 클릭 시 "/"로 이동하면서 쿼리 전달
  const handleSearch = () => {
    if (!keyword.trim()) return;
    console.log("키워드와 타입 전달");
    navigate(`/?type=${searchType}&keyword=${keyword}`);
  };

  // ✅ 로그인 페이지 이동
  const handleLogin = () => {
    navigate("/login");
  };

  // ✅ 로그아웃 처리
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const response = await axios.post(
        `${API_URL}/api/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status === 200) {
        console.log("✅ 로그아웃 성공:", response.data.message);
      } else {
        alert("로그아웃 실패. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("❌ 로그아웃 에러:", error);
    } finally {
      setLoggedIn(false);
      navigate("/");
    }
  };

  // =======================
  // 🔹 렌더링
  // =======================
  return (
    <HeaderContainer>
      {/* 로고 클릭 시 홈으로 이동 */}
      <Logo onClick={() => navigate("/")}>
        <img src={subookLogo} alt="수북로고" style={{ width: "150px" }} />
      </Logo>

      {/* 검색창 */}
      <SearchBox>
        <SelectWrapper>
          <Select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
          >
            <option value="bookName">책이름</option>
            <option value="className">강의명</option>
          </Select>
          <Arrow />
        </SelectWrapper>

        <SearchInput
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="책 이름 또는 강의명을 입력하세요"
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />

        <ReadingGlass
          src={readingGlass}
          alt="돋보기 버튼"
          onClick={handleSearch}
        />
      </SearchBox>

      {/* 네비게이션 */}
      <Nav>
        <a href="/chatlist">채팅방</a>
        <a href="/mypage/my_info">마이페이지</a>
        <a href="/upload">책 팔기</a>
      </Nav>

      {/* 로그인 / 로그아웃 */}
      <div
        style={{ width: "100px", display: "flex", justifyContent: "center" }}
      >
        {loggedIn ? (
          <Button onClick={handleLogout}>로그아웃</Button>
        ) : (
          <Button onClick={handleLogin}>로그인</Button>
        )}
      </div>
    </HeaderContainer>
  );
};

export default Header;
