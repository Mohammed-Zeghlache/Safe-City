import { BrowserRouter, Routes, Route } from 'react-router-dom';

//Home Page
import Header from "./FTC_Project/Lading_Page/Header/Header";
import Lading1 from "./FTC_Project/Lading_Page/Lading1/Lading1";
import Lading2 from "./FTC_Project/Lading_Page/Lading2/Lading2";
import Lading3 from "./FTC_Project/Lading_Page/Lading3/Lading3";
import HazardMap from "./FTC_Project/Lading_Page/Lading4-Map/HazardMap";

//Chat Page
import Header2 from "./FTC_Project/Chat-Page/Header-Chat/Header2";
import Pagech1 from "./FTC_Project/Chat-Page/Page1-chat/Pagech1";
import Chatbot from "./FTC_Project/Chat-Page/Container-chat/Chatbot";
import Chatbot2 from "./Admin/Dashboard2/Chatbot2";

//Notification page
import Header3 from "./FTC_Project/Notification/Header3/Header3";
import Page1N from "./FTC_Project/Notification/Page1-N/Page1N";

//Admin
import SignUp from "./Admin/Sign-up/SignUp";
import Login from "./Admin/Login/Login";
import Dashboard from './Admin/Dachboard/Dachboard';

//Cart
import Header4 from "./FTC_Project/Carte/header4";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <>
            <Header />
            <Lading1 />
            <Lading2 />
            <Lading3 />
            <HazardMap />
          </>
        } />
        <Route path="/report" element={
          <>
            <Header2 />
            <Pagech1 />
            <Chatbot2 />
          </>
        } />
        <Route path="/Notification" element={
          <>
            <Header3 />
            <Page1N />
          </>
        } />
        <Route path="/carte" element={
          <>
            <Header4 />
            <HazardMap />
          </>
        } />

        <Route path="/admin/signup" element={<SignUp />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;