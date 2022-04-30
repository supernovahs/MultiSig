import { PageHeader } from "antd";
import React from "react";
import "antd/dist/antd.css";
import "../Header.css";
// displays a page header

export default function Header() {
  return (
    <div>
      <div>
        <div className="bg">
          <div className="headerspace">SoulSafe</div>
          <div className="tagline">Wallet for life</div>
        </div>
      </div>
    </div>
  );
}
