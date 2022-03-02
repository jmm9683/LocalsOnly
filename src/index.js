import React from "react";
import { render } from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App";
import HomePage from "./HomePage";
import StashList from "./StashList";
import StashForm from "./StashForm";
import ManageAccount from "./ManageAccount";

const rootElement = document.getElementById("root");
render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route path="/" element={<HomePage />} />
        <Route path="stashes" element={<StashList search={true} />} />
        <Route path="add-stash" element={<StashForm />} />
        <Route path="account" element={<ManageAccount />} />
      </Route>
    </Routes>
  </BrowserRouter>,
  rootElement
);
