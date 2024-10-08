import React from "react";
import AppRouter from "./routes/Router.tsx";
import Sidebar from "./components/Sidebar.tsx";
import Navbar from "./components/Navbar.tsx";

function App() {
  return (
    <>
      {/* <AppRouter /> */}
      <div className="w-full h-screen overflow-y-scroll flex flex-col justify-between">
        <Navbar />
        <div className="w-full h-[calc(100vh-45px)] flex justify-between">
          <div className="w-[350px] h-full overflow-y-scroll bg-[#05202b]">
            <Sidebar />
          </div>
          <div className="w-full h-full">
            <AppRouter />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
