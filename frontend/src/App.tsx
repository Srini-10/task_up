import React from "react";
import AppRouter from "./routes/Router.tsx";
import SideBar from "./components/SideBar.tsx";
import Navbar from "./components/Navbar.tsx";

function App() {
  return (
    <>
      {/* <AppRouter /> */}
      <div className="w-full h-screen overflow-y-scroll flex flex-col justify-between">
        <Navbar />
        <div className="w-full h-[calc(100vh-45px)] flex justify-between">
          <div className="w-[350px] h-full overflow-y-scroll bg-[#05202b]">
            <SideBar />
          </div>
          <div className="w-full h-full overflow-y-scroll">
            <AppRouter />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
