"use client"; // クライアントサイドで実行

import React, { useState, useEffect } from "react";

interface UrlInputProps {
  onUrlSubmit: (url: string) => void; // URLを親コンポーネントに渡す関数
}

const UrlInput: React.FC<UrlInputProps> = ({ onUrlSubmit }) => {
  const [url, setUrl] = useState("");
  const [isActive, setIsActive] = useState(false); // フレームの表示状態

  const handleAddClick = () => {
    if (url.trim()) {
      onUrlSubmit(url); // URLを親コンポーネントに渡す
      setUrl(""); // 入力欄をリセット
    }
  };

  const handleInputClick = () => {
    setIsActive(true); // フレームを表示
  };

  const handleOutsideClick = (e: MouseEvent) => {
    // 入力部分の外をクリックしたときにフレームを消す
    if (
      !document
        .getElementById("url-input-container")
        ?.contains(e.target as Node)
    ) {
      setIsActive(false);
    }
  };

  useEffect(() => {
    // 外部クリックを監視するイベントリスナーを登録
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      // クリーンアップ
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <div
      id="url-input-container"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        maxWidth: "600px",
        margin: "20px auto",
        background: "linear-gradient(135deg, #ffffff, #f3f4f6)", // シンプルなグラデーション
        borderRadius: "50px", // 丸みのあるデザイン
        boxShadow: isActive
          ? "0 0 10px 3px rgba(59, 130, 246, 0.8)" // アクティブ時のフレーム
          : "0 10px 20px rgba(0, 0, 0, 0.1)", // 通常時のシャドウ
        padding: "10px 20px",
        gap: "10px",
        position: "relative", // フレーム効果に対応
        transition: "box-shadow 0.3s ease",
      }}
    >
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onClick={handleInputClick} // 入力をクリックしたらフレーム表示
        placeholder="Enter URL"
        style={{
          flex: 1,
          backgroundColor: "#ffffff",
          border: "none",
          borderRadius: "50px",
          padding: "10px 20px",
          fontSize: "16px",
          color: "#4a5568",
          outline: "none",
          boxShadow: "inset 0 2px 5px rgba(0, 0, 0, 0.1)", // 内側の影で立体感を追加
          transition: "background-color 0.3s ease",
        }}
        onFocus={(e) => (e.target.style.backgroundColor = "#f9fafb")} // フォーカス時の背景色
        onBlur={(e) => (e.target.style.backgroundColor = "#ffffff")} // フォーカス解除時の背景色
      />
      <button
        onClick={handleAddClick}
        style={{
          background: "linear-gradient(135deg, #06b6d4, #3b82f6)", // モダンな青系グラデーション
          color: "#ffffff",
          border: "none",
          borderRadius: "50%",
          width: "50px",
          height: "50px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 6px 12px rgba(59, 130, 246, 0.5)", // ボタンのシャドウ
          cursor: "pointer",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
          e.currentTarget.style.boxShadow =
            "0 8px 16px rgba(59, 130, 246, 0.6)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow =
            "0 6px 12px rgba(59, 130, 246, 0.5)";
        }}
      >
        +
      </button>
    </div>
  );
};

export default UrlInput;
