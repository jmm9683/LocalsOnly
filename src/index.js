import React from "react";
import { render } from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App";
import HomePage from "./HomePage";
import StashList from "./StashList";
import StashForm from "./StashForm";

const rootElement = document.getElementById("root");
render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route path="/" element={<HomePage />} />
        <Route path="stashes" element={<StashList search={true} />} />
        <Route path="add-stash" element={<StashForm />} />
      </Route>
    </Routes>
  </BrowserRouter>,
  rootElement
);
