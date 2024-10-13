import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "../src/components/Header"
import Login from "../src/components/Login";
import React, { useState } from 'react';
import Inscription from "./components/Inscription";
import PageAccueil from "./components/PageUser";
import DeleteUser from "./components/DeleteUser";
import Denied from "./components/Denied";
import PageAdmin from "./components/PageAdmin";
import NewTarifs from "./components/NewTarifs";


export default function App() {
const [log, setLog] = useState(false);

//utilisation du Routing pour créer des composant react
  return (
    <BrowserRouter><Header/>
      <Routes>



      <Route path="/" element={<Login/>} />
      <Route path="/User" element={<PageAccueil/>} />

      <Route path="/Inscription" element={<Inscription/>} />
      <Route path="/DeleteUser" element={<DeleteUser/>} />
      <Route path="/PageAdmin" element={<PageAdmin/>} />

      <Route path="/Denied" element={<Denied/>} />
      <Route path="/NewTarifs" element={<NewTarifs/>} />
        </Routes>
    </BrowserRouter>

  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);