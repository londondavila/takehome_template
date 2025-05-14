import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { ADD_REPOSITORY } from "../graphql/mutations";
import { GET_REPOSITORIES } from "../graphql/queries";
import { Box, TextField, Button, Typography } from "@mui/material";

const AddRepository: React.FC = () => {
  const [url, setUrl] = useState("");
  const [addRepository, { loading, error }] = useMutation(ADD_REPOSITORY, {
    refetchQueries: [{ query: GET_REPOSITORIES }],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addRepository({ variables: { url } });
      setUrl("");
    } catch (err) {
      console.error("Error adding repository:", err);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Add a Repository
      </Typography>
      <TextField
        label="GitHub Repository URL"
        variant="outlined"
        fullWidth
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={loading}
      >
        {loading ? "Adding..." : "Add Repository"}
      </Button>
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          Error: {error.message}
        </Typography>
      )}
    </Box>
  );
};

export default AddRepository;
