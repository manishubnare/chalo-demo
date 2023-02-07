import { Button, Col, Input, Modal, Row, Select, Table, Tag } from "antd";
import { compact, find, get, map } from "lodash";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { updateData, useRouteTableData } from "../../hooks/Routes";
import { EditOutlined, DeleteOutlined, CheckOutlined } from "@ant-design/icons";
import Header from "../Header";
import Maps from "../maps/Maps";
import Stops from "../stops/Stops";
import "./Home.css";
import HidableComponent from "../HideableComponent";
import generatePdf from "../../services/GeneratePdf";

const CustomEditOutlined = HidableComponent(EditOutlined);
const CustomCheckOutlined = HidableComponent(CheckOutlined);

const ROUTE_DIRECTION = [
  {
    key: 1,
    name: 'routeDirection',
    label: "UP",
    value: "UP",
  },
  {
    key: 2,
    name: 'routeDirection',
    label: "DOWN",
    value: "DOWN",
  },
];

const ROUTE_STATUS = [
  {
    key: 1,
    name: 'routeStatus',
    label: "ACTIVE",
    value: "ACTIVE",
  },
  {
    key: 2,
    name: 'routeStatus',
    label: "INACTIVE",
    value: "INACTIVE",
  },
];

function Home() {
  const [openStopModal, setOpenStopsModal] = useState(false);
  const [selectedStopsData, setStopsData] = useState([]);
  const [selectedStopsCoord, setSelectedStopsCoord] = useState([]);
  const { data: routestableData, isLoading } = useRouteTableData();
  const [selectedRowRouteId, setselectedRowRouteId] = useState(null);
  const [editableRouteData, setEditableRouteData] = useState({});
  const [enableEditRouteData, setEnableEditRouteData] = useState(false);

  const getSearchRouteOptions = () => {
    const routesName = compact(map(routestableData, (routeDetails) => {
      if(get(routeDetails, 'routeStatus') === "INACTIVE"){
        return null;
      }
      return {
        label: get(routeDetails, "routeName"),
        value: get(routeDetails, "routeName")
      };
    }));
    return routesName;
  };

  const handleFieldValueChange = (e) => {
    const { name, value } = e.target;
    setEditableRouteData({
      ...editableRouteData,
      [name]: value,
    });
  };

  const handleSelectFieldChange = (option) => {
    const name = get(option, 'name');
    const value = get(option, 'value');
    setEditableRouteData({
      ...editableRouteData,
      [name]: value
    });
  }

  const routeTableColumn = [
    {
      title: "Route ID",
      dataIndex: "routeId",
      key: "routeId",
      width: 120,
      render: (_, data) => {
        const columnValue = get(data, "routeId");
        if (
          enableEditRouteData &&
          selectedRowRouteId === get(data, "routeId")
        ) {
          return (
            <Input
              type="text"
              defaultValue={columnValue}
              name="routeName"
              onChange={(e) => handleFieldValueChange(e)}
            />
          );
        } else {
          return `${columnValue}`;
        }
      },
    },
    {
      title: "Name",
      dataIndex: "routeName",
      key: "routeName",
      width: 120,
      render: (_, data) => {
        const columnValue = get(data, "routeName");
        if (
          enableEditRouteData &&
          selectedRowRouteId === get(data, "routeId")
        ) {
          return (
            <Input
              type="text"
              defaultValue={columnValue}
              name="routeName"
              onChange={(e) => handleFieldValueChange(e)}
            />
          );
        } else {
          return `${columnValue}`;
        }
      },
    },
    {
      title: "Direction",
      dataIndex: "routeDirection",
      key: "routeDirection",
      width: 120,
      render: (_, data) => {
        const columnValue = get(data, "routeDirection");
        if (
          enableEditRouteData &&
          selectedRowRouteId === get(data, "routeId")
        ) {
          return (
            <Select
              className="select-field"
              defaultValue={columnValue}
              options={ROUTE_DIRECTION}
              onSelect={(_, option) => handleSelectFieldChange(option)}
            />
          );
        } else {
          if (columnValue === "UP") {
            return <Tag color="processing">UP</Tag>;
          } else {
            return <Tag color="default">DOWN</Tag>;
          }
        }
      },
    },
    {
      title: "Status",
      dataIndex: "routeStatus",
      key: "routeStatus",
      width: 120,
      render: (_, data) => {
        const columnValue = get(data, "routeStatus");
        if (
          enableEditRouteData &&
          selectedRowRouteId === get(data, "routeId")
        ) {
          return (
            <Select
              className="select-field"
              defaultValue={columnValue}
              options={ROUTE_STATUS}
              onSelect={(_, option) => handleSelectFieldChange(option)}
            />
          );
        } else {
          if (columnValue === "ACTIVE") {
            return <Tag color="success">ACTIVE</Tag>;
          } else {
            return <Tag color="warning">INACTIVE</Tag>;
          }
        }
      },
    },
    {
      title: "Stops",
      dataIndex: "routesStops",
      key: "routesStops",
      width: 120,
      render: (_, data) => {
        const clickToSeeStops = () => (
          setOpenStopsModal(true),
          setStopsData(data.routeStops),
          setselectedRowRouteId(get(data, "routeId"))
        )
        return <a onClick={clickToSeeStops}>See all stops</a>
      }
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "action",
      width: 120,
      render: (_, data) => {
        const hideEditButton =
          enableEditRouteData && selectedRowRouteId === get(data, "routeId");
        return (
          <Row>
            <Col>
              <CustomEditOutlined
                isHidden={hideEditButton}
                onClick={() => (
                  setselectedRowRouteId(get(data, "routeId")),
                  setEditableRouteData(data),
                  setEnableEditRouteData(true)
                )}
              />
              <CustomCheckOutlined
                isHidden={!hideEditButton}
                onClick={() => handleUpdateRouteData()}
              />
            </Col>
            <Col offset={2}>
              <DeleteOutlined
                onClick={() => handleDeleteRouteData(get(data, "routeId"))}
              />
            </Col>
          </Row>
        );
      },
    },
  ];

  const handleSelectChange = (value) => {
    const allSelectedRouteStopsCoord = [];
    map(value, (item) => {
      const routeDetails = find(
        routestableData,
        ({ routeName }) => routeName === item
      );
      const routeStopData = get(routeDetails, "routeStops", []);
      const routeStopCoord = map(routeStopData, ({ stopLat, stopLong }) => {
        return {
          lat: parseFloat(stopLat),
          lng: parseFloat(stopLong),
        };
      });
      allSelectedRouteStopsCoord.push(routeStopCoord);
    });
    setSelectedStopsCoord(allSelectedRouteStopsCoord);
  };

  const handleUpdateRouteData = () => {
    const updatedRouteData = map(routestableData, (data) => {
      if (get(data, "routeId") === selectedRowRouteId) {
        return editableRouteData;
      }
      return data;
    });

    window.localStorage.setItem(
      "routes_data",
      JSON.stringify(updatedRouteData)
    );
    updateData("fetchRouteData", updatedRouteData);
    setEditableRouteData({});
    setselectedRowRouteId(null);
    setEnableEditRouteData(false);
  };

  const handleDeleteRouteData = (routeId) => {
    const updatedRouteData = compact(
      map(routestableData, (data) => {
        if (get(data, "routeId") === routeId) {
          return null;
        }
        return data;
      })
    );
    window.localStorage.setItem(
      "routes_data",
      JSON.stringify(updatedRouteData)
    );
    updateData("fetchRouteData", updatedRouteData);
  };

  const updateSelectedRouteStop = () => {
    const { routeStops } = find(
      routestableData,
      ({ routeId }) => routeId === selectedRowRouteId
    );
    setStopsData(routeStops);
  };

  return (
    <div>
      <Header />
      <div className="table-height">
        <Table
          loading={isLoading}
          columns={routeTableColumn}
          dataSource={routestableData}
          scroll={{
            y: 240,
          }}
          pagination={false}
        />
      </div>
      <Row className="add-new-route">
        <Col span={8} offset={8}>
          <Select
            mode="multiple"
            allowClear
            style={{
              width: "100%",
            }}
            placeholder="Please select"
            options={getSearchRouteOptions()}
            onChange={handleSelectChange}
          />
        </Col>
        <Col offset={5}>
          <Button onClick={() => generatePdf(routestableData)}>
            Generate Report
          </Button>
        </Col>
      </Row>
      <Row offset={2}>
        <Col span={10} offset={6}>
          <Maps stopsCoords={selectedStopsCoord} />
        </Col>
      </Row>
      <Modal
        title="Route Details"
        centered
        open={openStopModal}
        onOk={() => setOpenStopsModal(false)}
        onCancel={() => setOpenStopsModal(false)}
        width={1200}
      >
        <Stops
          routeData={routestableData}
          stopsData={selectedStopsData}
          enableUpdateExistingStops={true}
          selectedRowRouteId={selectedRowRouteId}
          updateSelectedRouteStop={updateSelectedRouteStop}
        />
      </Modal>
    </div>
  );
}

export default Home;
