import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Collapse,
  TextField,
} from "@mui/material";
import { useSubscribe } from "../hooks/use-subscribe";
import { Example } from "../backend/models/example";
import { post } from "../lib/fetchers";
import { TransitionGroup } from "react-transition-group";

const ExamplePage = () => {
  const [error, setError] = useState<Error>();
  const [dataOut, setDataOut] = useState("");

  const { data: dataIn } = useSubscribe<Example[]>("/api/example");

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <TextField
        value={dataOut}
        onChange={(e) => setDataOut(e.currentTarget.value)}
      />
      <Button
        variant="contained"
        onClick={async () => {
          try {
            await post("/api/example", { data: dataOut });
          } catch (e) {
            setError(e as any);
          }
        }}
      >
        Upload
      </Button>
      <Collapse in={!!error}>
        <Alert severity="error">
          {error?.name}: {error?.message}
          <br />
          Try refreshing your browser
        </Alert>
      </Collapse>
      <TransitionGroup>
        {(dataIn ?? []).map((d) => (
          <Collapse key={d._id} in={dataIn?.includes(d)}>
            <DataView d={d} />
          </Collapse>
        ))}
      </TransitionGroup>
    </Box>
  );
};

const DataView = ({ d }: { d: Example }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const dt = 50;
    const interval = setInterval(() => {
      setProgress(Math.min(4 + (Date.now() - +new Date(d.created)) / 100, 100));
    }, dt);
    return () => clearInterval(interval);
  }, [d.created]);

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <CircularProgress variant="determinate" value={progress} />
      <Box sx={{ flexGrow: 1 }}>
        <pre>{JSON.stringify(d, null, 2)}</pre>
      </Box>
    </Box>
  );
};

export default ExamplePage;
