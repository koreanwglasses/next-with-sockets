import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Collapse,
  Typography,
} from "@mui/material";
import { useList } from "react-use";
import { useSocket, useSocketIdx, useSockPost } from "../hooks/use-socket";
import { useSubscribe } from "../hooks/use-subscribe";

const Ping = () => {
  const [messages, { push }] = useList<string>();
  const [waiting, setWaiting] = useState<boolean>();
  const [error, setError] = useState<Error>();
  const sockPost = useSockPost();

  const { data } = useSubscribe<{ numSockets: number }>("/api/socket-count");
  const { numSockets } = data ?? {};
  const socketIdx = useSocketIdx();

  useSocket(
    () => ({
      message: (message: string) => {
        push(message);
        setWaiting(false);
      },
    }),
    [push]
  );

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
      <Typography>
        {data ? numSockets : <CircularProgress size={10} />} sockets linked to
        current session
      </Typography>
      <Typography>
        Current socketIdx: {socketIdx || <CircularProgress size={10} />}
      </Typography>
      <Collapse in={!!error}>
        <Alert severity="error">
          {error?.name}: {error?.message}
          <br />
          Try refreshing your browser
        </Alert>
      </Collapse>
      <Button
        disabled={waiting}
        variant="contained"
        onClick={async () => {
          try {
            // Make a post request and specify the return socket id
            await sockPost("/api/ping");
            setWaiting(true);
          } catch (e) {
            setError(e as any);
          }
        }}
      >
        Ping
      </Button>
      {[...messages, ""].map((message, i) => (
        <Collapse key={i} in={message !== ""}>
          {message}
        </Collapse>
      ))}
      {waiting && <CircularProgress />}
    </Box>
  );
};

export default Ping;
