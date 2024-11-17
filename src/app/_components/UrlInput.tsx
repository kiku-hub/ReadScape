import React from "react";
import { TextField, IconButton, Box } from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";

const UrlInput: React.FC = () => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        maxWidth: 500,
        margin: "20px auto",
        background: "linear-gradient(135deg, #e3f2fd, #ffffff)",
        borderRadius: "30px",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        padding: "10px 15px",
        gap: "10px",
      }}
    >
      <TextField
        variant="outlined"
        placeholder="URLを入力してください"
        InputProps={{
          sx: {
            backgroundColor: "#ffffff",
            borderRadius: "20px",
            padding: "10px",
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            "& input": {
              fontSize: "16px",
              color: "#333",
            },
            "& input::placeholder": {
              color: "#999",
            },
          },
        }}
        fullWidth
      />
      <IconButton
        sx={{
          backgroundColor: "#42a5f5",
          color: "#ffffff",
          borderRadius: "50%",
          width: "50px",
          height: "50px",
          boxShadow: "0 4px 8px rgba(66, 165, 245, 0.4)",
          transition: "transform 0.3s ease, background-color 0.3s ease",
          "&:hover": {
            backgroundColor: "#1e88e5",
            transform: "scale(1.1)",
          },
          "&:active": {
            transform: "scale(0.9)",
          },
        }}
      >
        <AddCircleIcon fontSize="large" />
      </IconButton>
    </Box>
  );
};

export default UrlInput;
