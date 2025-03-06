
import { onDisconnect, ref, set } from "firebase/database";
import Sidebar from "../components/sidebar/Sidebar";
import "./home.scss";

import { ReactNode, useEffect, useMemo } from "react";
import { database } from "../../util/fucntion/firebaseConfig";

interface HomeProps {
  children: ReactNode;
}

const Home: React.FC<HomeProps> = ({ children }) => {
  const getUserData = () => {
    const authData = localStorage.getItem("authData");
    return authData ? JSON.parse(authData) : null;
  };
  const user = useMemo(() => getUserData(), []);
  useEffect(() => {
    const userId = user?.id;
    if (userId) {
      const statusRef = ref(database, `users/${userId}/status`);
      set(statusRef, "online");
      onDisconnect(statusRef).set("offline");

      return () => {
        set(statusRef, "offline");
      };
    }
  }, [user]);

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-2">
          <Sidebar></Sidebar>
        </div>
        <div className="col-md-10">
          <div className="homeContainer">
            <main className="main">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Home;
