import { useEffect } from "react";
import { socket } from "../services/socket";

const useSocket = () => {
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
  }, []);

  return socket;
};

export default useSocket;
