import { Button, Col, Row } from "antd";
import React from "react";
import { Link } from "react-router-dom";
import "../App.css";
import Logo from "../img/Neusoft_Logo.svg";

function Header() {
  return (
    <div>
      <Row className="header-main">
        <Col>
          <div>
            <img src={Logo} className="avatar" />
          </div>
        </Col>
        <Col offset={17}>
          <Button>
            <Link to="/">Home</Link>
          </Button>
        </Col>
        <Col offset={1}>
          <Button>
            <Link to="/route">Add Routes</Link>
          </Button>
        </Col>
      </Row>
    </div>
  );
}

export default Header;
