import { useEffect } from "react";
import { socket } from "../services/socket";

const useSocket = () => {
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      // React StrictMode ki wajah se development mein
      // socket ko baar-baar disconnect mat karo
    };
  }, []);

  return socket;
};

export default useSocket;