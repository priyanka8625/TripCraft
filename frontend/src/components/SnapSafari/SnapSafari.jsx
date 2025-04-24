import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Feed from "./Feed/Feed";

function SnapSafari() {
  return (
    <Router>
      <div className="SnapSafari">
        <Routes>
          <Route path="/*" element={<Feed />} />
        </Routes>
      </div>
    </Router>
  );
}

export default SnapSafari;
